// DetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Entypo } from '@expo/vector-icons';
import { db, auth } from '../firebase/firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import type { RootStackParamList } from '../types/navigation';

const screenWidth = Dimensions.get('window').width;
type PostDetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;

const DetailScreen = () => {
  const route = useRoute<PostDetailRouteProp>();
  const { post } = route.params;
  const navigation = useNavigation();

  const [comments, setComments] = useState<any[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisibleId, setModalVisibleId] = useState<string | null>(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const increaseViews = async () => {
      const ref = doc(db, 'posts', post.id);
      await updateDoc(ref, { views: increment(1) });
    };
    increaseViews();
  }, [post.id]);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', post.id),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(loaded as any);
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUser) return;

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const nickname = userDoc.exists() ? userDoc.data().nickname : '익명';

    await addDoc(collection(db, 'comments'), {
      postId: post.id,
      authorId: currentUser.uid,
      authorName: nickname,
      content: newComment,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'posts', post.id), { commentCount: increment(1) });
    setNewComment('');
    setIsWriting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteDoc(doc(db, 'comments', commentId));
    await updateDoc(doc(db, 'posts', post.id), { commentCount: increment(-1) });
    setModalVisibleId(null);
  };

  const handleEditComment = async (commentId: string) => {
    if (!editedContent.trim()) return;
    await updateDoc(doc(db, 'comments', commentId), { content: editedContent });
    setEditingCommentId(null);
    setModalVisibleId(null);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>{'<'} 돌아가기</Text>
            </TouchableOpacity>
          </View>

          {post.imageUrls?.length > 0 && (
            <View style={styles.imageWrapper}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={e => {
                  const index = Math.floor(
                    e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
                  );
                  setCurrentImageIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {post.imageUrls.map((uri: string, idx: number) => (
                  <Image key={idx} source={{ uri }} style={styles.thumbnail} />
                ))}
              </ScrollView>
              <View style={styles.imageIndexBadge}>
                <Text style={styles.imageIndexText}>
                  {currentImageIndex + 1} / {post.imageUrls.length}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.postBox}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.metaText}>
              {post.nickname || '익명'} · 👁 {post.views || 0} · 💬 {comments.length}
            </Text>
            <Text style={styles.content}>{post.content}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.commentHeaderRow}>
            <Text style={styles.commentHeader}>댓글 {comments.length}</Text>
            <TouchableOpacity onPress={() => setIsWriting(prev => !prev)}>
              <Text style={styles.writeButtonText}>{isWriting ? '닫기' : '댓글쓰기'}</Text>
            </TouchableOpacity>
          </View>

          {comments.map(comment => (
            <View key={comment.id} style={styles.commentBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                {currentUser?.uid === comment.authorId && (
                  <TouchableOpacity onPress={() => setModalVisibleId(comment.id)}>
                    <Entypo name="dots-three-horizontal" size={16} color="#aaa" />
                  </TouchableOpacity>
                )}
              </View>
              {editingCommentId === comment.id ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editedContent}
                    onChangeText={setEditedContent}
                  />
                  <TouchableOpacity onPress={() => handleEditComment(comment.id)}>
                    <Text style={styles.writeButtonText}>저장</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.commentText}>{comment.content}</Text>
              )}
              {modalVisibleId === comment.id && (
                <Modal transparent animationType="fade" visible>
                  <TouchableWithoutFeedback onPress={() => setModalVisibleId(null)}>
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalBox}>
                        <TouchableOpacity
                          onPress={() => {
                            setEditingCommentId(comment.id);
                            setEditedContent(comment.content);
                          }}
                        >
                          <Text style={styles.modalItem}>수정</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                          <Text style={styles.modalItem}>삭제</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
              )}
            </View>
          ))}
        </KeyboardAwareScrollView>

        {isWriting && (
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="댓글을 입력하세요"
              placeholderTextColor="#aaa"
              value={newComment}
              onChangeText={setNewComment}
              onSubmitEditing={handleAddComment}
              blurOnSubmit={false}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
              <Text style={styles.sendText}>등록</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  headerRow: { paddingTop: 20, paddingHorizontal: 16 },
  backText: { color: '#FF8A3D', fontSize: 16, fontWeight: '600', marginTop: 30 },
  imageWrapper: { width: '100%', height: 240, backgroundColor: '#444', marginTop: 10 },
  thumbnail: { width: screenWidth, height: 240, resizeMode: 'cover' },
  imageIndexBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: '#000000aa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageIndexText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  postBox: { padding: 16, paddingTop: 12 },
  title: { fontSize: 20, color: '#fff', fontWeight: 'bold', marginBottom: 6 },
  metaText: { fontSize: 13, color: '#aaa', marginBottom: 10 },
  content: { fontSize: 15, color: '#ddd', lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#444', marginHorizontal: 16, marginVertical: 12 },
  commentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  commentHeader: { fontSize: 16, color: '#fff', fontWeight: '600' },
  writeButtonText: { color: '#FF8A3D', fontWeight: '600', fontSize: 14 },
  commentBox: {
    backgroundColor: '#3B3B3B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  commentAuthor: { color: '#FF8A3D', fontWeight: '600', marginBottom: 4 },
  commentText: { color: '#ddd', fontSize: 14 },
  inputWrapper: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#444',
    backgroundColor: '#2B2B2B',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#3B3B3B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#FF8A3D',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000077',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    width: 200,
  },
  modalItem: {
    fontSize: 16,
    color: '#fff',
    paddingVertical: 8,
  },
});

export default DetailScreen;
