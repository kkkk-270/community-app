// 게시글 상세 화면 - 게시글 이미지, 내용, 댓글 목록 및 작성/수정/삭제 기능 포함

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
    if (!newComment.trim() || !currentUser) return;

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
              {post.nickname || '익명'} · 조회수 {post.views || 0} · 댓글 {comments.length}
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

export default DetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
  },
  headerRow: {
    paddingVertical: 16,
  },
  backText: {
    color: '#FF8A3D',
    fontSize: 14,
  },
  imageWrapper: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  thumbnail: {
    width: screenWidth,
    height: 260,
    resizeMode: 'cover',
  },
  imageIndexBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: '#00000080',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  imageIndexText: {
    color: '#fff',
    fontSize: 12,
  },
  postBox: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  metaText: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 6,
  },
  content: {
    color: '#ddd',
    fontSize: 15,
    marginTop: 12,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 20,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentHeader: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  writeButtonText: {
    color: '#FF8A3D',
    fontSize: 14,
  },
  commentBox: {
    backgroundColor: '#2E2E2E',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  commentAuthor: {
    fontSize: 14,
    color: '#FF8A3D',
  },
  commentText: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1E1E1E',
  },
  input: {
    flex: 1,
    backgroundColor: '#2E2E2E',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#fff',
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  sendText: {
    color: '#FF8A3D',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000070',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#2E2E2E',
    padding: 16,
    borderRadius: 12,
    width: 160,
  },
  modalItem: {
    fontSize: 14,
    color: '#fff',
    paddingVertical: 6,
  },
});
