// EditPostScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { MypageStackParamList } from '../types/navigation';

type EditPostRouteProp = RouteProp<MypageStackParamList, 'EditPost'>;

const categories = ['자유글', '정보', '질문'];

const EditPostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EditPostRouteProp>();
  const { post } = route.params;

  const [title, setTitle] = useState(post.title || '');
  const [content, setContent] = useState(post.content || '');
  const [selectedCategory, setSelectedCategory] = useState(post.category || categories[0]);
  const [imageUri, setImageUri] = useState(post.imageUrls?.[0] || null);

  // 이미지 선택 (갤러리에서 1장)
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // 이미지 제거
  const removeImage = () => setImageUri(null);

  // 게시글 수정 핸들러
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        title,
        content,
        category: selectedCategory,
        imageUrls: imageUri ? [imageUri] : [],
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('수정 완료', '게시글이 수정되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('게시글 수정 오류:', error);
      Alert.alert('오류', '게시글 수정에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 상단 타이틀 */}
        <Text style={styles.header}>{'< 글 수정'}</Text>

        {/* 카테고리 선택 버튼 */}
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnSelected]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[styles.categoryText, selectedCategory === cat && styles.categoryTextSelected]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 제목 입력 */}
        <TextInput
          placeholder="제목"
          value={title}
          onChangeText={setTitle}
          style={styles.inputTitle}
          placeholderTextColor="#aaa"
        />

        {/* 본문 입력 */}
        <TextInput
          placeholder="내용을 입력해주세요"
          value={content}
          onChangeText={setContent}
          style={styles.inputContent}
          placeholderTextColor="#aaa"
          multiline
        />

        {/* 이미지 업로드 */}
        <Text style={styles.sectionLabel}>대표 이미지</Text>
        <View style={styles.imageSection}>
          {!imageUri ? (
            <TouchableOpacity style={styles.imageUploadBox} onPress={pickImage}>
              <Ionicons name="camera-outline" size={32} color="#888" />
              <Text style={styles.imageCount}>0/1</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeIcon} onPress={removeImage}>
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.thumbnailLabel}>대표사진</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 하단 수정 버튼 */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate}>
        <Text style={styles.submitText}>수정 완료</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditPostScreen;

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    fontSize: 18,
    color: '#FF8A3D',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  categoryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  categoryBtnSelected: {
    backgroundColor: '#FF8A3D',
  },
  categoryText: {
    color: '#aaa',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  inputTitle: {
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  inputContent: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#fff',
    height: 180,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  sectionLabel: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  imageSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  imageUploadBox: {
    width: 80,
    height: 80,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCount: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  imagePreviewWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  thumbnailLabel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#000000aa',
    color: '#fff',
    fontSize: 12,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  submitBtn: {
    backgroundColor: '#FF8A3D',
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
