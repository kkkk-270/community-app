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
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

const categories = ['자유글', '정보', '질문'];

const WriteScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [imageUris, setImageUris] = useState<string[]>([]);

  // 이미지 여러 장 선택
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsEditing: true,
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      if (imageUris.length + newUris.length > 10) {
        Alert.alert('이미지는 최대 10장까지 업로드할 수 있습니다.');
        return;
      }
      setImageUris(prev => [...prev, ...newUris]);
    }
  };

  // 이미지 제거
  const removeImage = (index: number) => {
    setImageUris(prev => prev.filter((_, i) => i !== index));
  };

  // 게시물 업로드
  const handleSubmit = async () => {
    try {
      const post = {
        title: title || '제목 없음',
        content: content || '내용 없음',
        category: selectedCategory,
        createdAt: Timestamp.now(),
        authorId: auth.currentUser?.uid || 'anonymous',
        imageUrls: imageUris,
      };

      await addDoc(collection(db, 'posts'), post);
      navigation.navigate('Home');
    } catch (e) {
      console.error('게시글 업로드 오류:', e);
      Alert.alert('오류', '게시글을 등록하는 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>{'< 글쓰기'}</Text>

        {/* 카테고리 선택 */}
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryBtn,
                selectedCategory === cat && styles.categoryBtnSelected,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextSelected,
                ]}
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

        {/* 내용 입력 */}
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
          <ScrollView horizontal>
            {imageUris.map((uri, index) => (
              <View key={index} style={styles.imagePreviewWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeIcon}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {imageUris.length < 10 && (
              <TouchableOpacity style={styles.imageUploadBox} onPress={pickImages}>
                <Ionicons name="camera-outline" size={32} color="#888" />
                <Text style={styles.imageCount}>{imageUris.length}/10</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* 등록 버튼 */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>작성 완료</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WriteScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  scrollContainer: { padding: 16 },
  header: {
    fontSize: 18,
    color: '#FF8A3D',
    marginBottom: 20,
    marginTop: 30,
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
    marginRight: 8,
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
