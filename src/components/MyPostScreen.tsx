import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MypageStackParamList } from '../types/navigation';

// 마이페이지 - 내가 작성한 글 목록 출력 화면
const MyPostScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MypageStackParamList>>();
  const [posts, setPosts] = useState<any[]>([]);

  // 현재 로그인한 사용자의 게시글을 조회하고 최신순으로 정렬하여 실시간 반영
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetched);
    });

    return () => unsubscribe();
  }, []);

  // 게시글 삭제 핸들러 (삭제 확인 Alert 포함)
  const handleDelete = (postId: string) => {
    Alert.alert(
      '정말 삭제하시겠어요?',
      '삭제된 글은 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'posts', postId));
            } catch (err) {
              console.error('삭제 오류:', err);
            }
          },
        },
      ]
    );
  };

  // 게시글 카드 렌더링
  const renderPost = ({ item }: any) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={{ flexDirection: 'row', flex: 1 }}
        onPress={() => navigation.navigate('Detail', { post: item })}
      >
        {item.imageUrls?.[0] ? (
          <Image source={{ uri: item.imageUrls[0] }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnail} />
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardText} numberOfLines={2}>
            {item.content}
          </Text>
          <Text style={styles.cardFooter}>
            댓글 {item.comments || 0} · 조회수 {item.views || 0}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 수정/삭제 버튼 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditPost', { post: item })}
          style={styles.editButton}
        >
          <Text style={styles.buttonText}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.buttonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>내가 쓴 글</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </SafeAreaView>
  );
};

export default MyPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 30,
  },
  card: {
    flexDirection: 'column',
    backgroundColor: '#333',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    backgroundColor: '#666',
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  cardText: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
  cardFooter: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    marginRight: 8,
    backgroundColor: '#4E9F3D',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#D72323',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
  },
});
