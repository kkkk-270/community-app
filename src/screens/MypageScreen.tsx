import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MypageStackParamList } from '../types/navigation';
import { auth } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const defaultProfileUri = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const MypageScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MypageStackParamList>>();

  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState(defaultProfileUri);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setNickname(data.nickname || '닉네임 없음');
          setProfileImage(data.profileImage || defaultProfileUri);
        }
      } catch (err) {
        console.log('유저 정보 불러오기 실패', err);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <Text style={styles.nickname}>{nickname}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyPost')}
        >
          <Text style={styles.menuText}>내가 쓴 글</Text>
        </TouchableOpacity>

        
      </View>
    </ScrollView>
  );
};

export default MypageScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#1E1E1E',
    flexGrow: 1,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 32,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#444',
  },
  nickname: {
    fontSize: 20,
    color: '#fff',
    marginTop: 12,
    fontWeight: '600',
  },
  menuSection: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 24,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuText: {
    fontSize: 16,
    color: '#ccc',
  },
});
