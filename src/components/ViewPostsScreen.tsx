import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MypageStackParamList } from '../types/navigation';

const ViewPostsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MypageStackParamList>>();
  const [viewedPosts, setViewedPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchViewed = async () => {
      const stored = await AsyncStorage.getItem('viewedPosts');
      if (!stored) return;

      const ids = JSON.parse(stored); // ['abc123', 'xyz456'] 형식
      const posts: any[] = [];

      for (const id of ids) {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          posts.push({ id: docSnap.id, ...docSnap.data() });
        }
      }
      setViewedPosts(posts);
    };
    fetchViewed();
  }, []);

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
        <Text style={styles.cardText} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.cardFooter}>
          💬 {item.comments || 0} · 👁 {item.views || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={viewedPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
};

export default ViewPostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingTop: 20,
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
});
