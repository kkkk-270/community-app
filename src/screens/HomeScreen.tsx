import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MypageStackParamList } from '../types/navigation';

// 카테고리 필터 목록
const categories = ['전체', '자유글', '정보', '질문'];

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MypageStackParamList>>();
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedSort, setSelectedSort] = useState('최신순');
  const [sortOpen, setSortOpen] = useState(false);
  const sortHeight = useRef(new Animated.Value(44)).current;

  // 게시글 실시간 조회 및 댓글 수, 작성자 닉네임 병합
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const promises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        // 닉네임 조회
        let nickname = '익명';
        try {
          const userSnap = await getDoc(doc(db, 'users', data.authorId));
          if (userSnap.exists()) {
            nickname = userSnap.data().nickname || '익명';
          }
        } catch (e) {
          console.log('닉네임 불러오기 실패:', e);
        }

        // 댓글 수 조회
        let commentCount = 0;
        try {
          const commentQuery = query(
            collection(db, 'comments'),
            where('postId', '==', id)
          );
          const commentSnap = await getDocs(commentQuery);
          commentCount = commentSnap.size;
        } catch (e) {
          console.log('댓글 수 조회 실패:', e);
        }

        return {
          id,
          ...data,
          nickname,
          commentCount,
        };
      });

      const postsWithExtras = await Promise.all(promises);
      setPosts(postsWithExtras);
    });

    return () => unsubscribe();
  }, []);

  // 정렬 드롭다운 토글
  const toggleSort = () => {
    Animated.timing(sortHeight, {
      toValue: sortOpen ? 44 : 88,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setSortOpen(!sortOpen);
  };

  // 정렬 방식 변경
  const handleSortChange = (option: string) => {
    setSelectedSort(option);
    toggleSort();
  };

  // 카테고리 및 정렬 조건에 따른 게시글 필터링
  const filteredPosts = (selectedCategory === '전체'
    ? posts
    : posts.filter((post) => post.category === selectedCategory)
  ).sort((a, b) => {
    if (selectedSort === '최신순') return 0;
    if (selectedSort === '조회순') return (b.views || 0) - (a.views || 0);
    return 0;
  });

  // 게시글 렌더링 카드
  const renderPost = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { post: item })}
    >
      {item.imageUrls?.[0] ? (
        <Image source={{ uri: item.imageUrls[0] }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnail} />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardText} numberOfLines={2}>{item.content}</Text>
        <Text style={styles.cardFooter}>
          {item.nickname} · 💬 {item.commentCount} · 👁 {item.views || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 카테고리 필터 */}
      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, selectedCategory === cat && styles.selectedCategoryButton]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.selectedCategoryText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 정렬 선택 */}
      <Animated.View style={[styles.sortBox, sortOpen && styles.sortBoxExpanded]}>
        <TouchableOpacity onPress={toggleSort} style={styles.sortOption}>
          <Text style={styles.sortText}>{selectedSort} ▼</Text>
        </TouchableOpacity>
        {sortOpen && (
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSortChange(selectedSort === '최신순' ? '조회순' : '최신순')}
          >
            <Text style={styles.optionText}>{selectedSort === '최신순' ? '조회순' : '최신순'}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* 게시글 리스트 */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* 글쓰기 및 새로고침 버튼 */}
      <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Write')}>
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.refreshButton} onPress={() => console.log('Refresh')}>
        <Ionicons name="refresh-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#444',
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#FF8A3D',
  },
  categoryText: {
    color: '#ccc',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  sortBox: {
    backgroundColor: '#444',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'flex-end',
    marginBottom: 12,
    width: 85,
  },
  sortBoxExpanded: {
    height: 88,
  },
  sortOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sortText: {
    color: '#fff',
    fontSize: 14,
  },
  optionText: {
    color: '#ccc',
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
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
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 150,
    backgroundColor: '#FF8A3D',
    borderRadius: 30,
    padding: 14,
    elevation: 6,
  },
  refreshButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#666',
    borderRadius: 30,
    padding: 14,
    elevation: 6,
  },
});
