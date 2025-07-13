import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/fsirestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MypageStackParamList } from '../types/navigation';

const defaultProfileUri = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

type NavigationProp = NativeStackNavigationProp<MypageStackParamList, 'Signup'>;

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [focused, setFocused] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 회원가입 처리 함수
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      // Firebase Authentication으로 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore에 사용자 정보 저장
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        nickname: nickname,
        profileImage: profileImage || defaultProfileUri,
        createdAt: serverTimestamp(),
      });

      Alert.alert('회원가입 성공', '이제 로그인해주세요.');
      navigation.navigate('Login');
    } catch (error: any) {
      console.log('회원가입 에러:', error.code);
      Alert.alert('회원가입 실패', error.message);
    }
  };

  // 이미지 선택 (갤러리에서)
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // 기본 이미지로 설정
  const setDefaultImage = () => {
    setProfileImage(defaultProfileUri);
  };

  // 입력 필드 렌더링 (플로팅 라벨 포함)
  const renderFloatingInput = (
    label: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    key: string,
    secure = false,
    keyboardType: any = 'default',
    toggleVisible = false,
    onToggle = () => {}
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.floatingLabel, (value.length > 0 || focused[key]) && styles.floatingLabelFocused]}>
        {label}
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={setter}
          onFocus={() => setFocused(prev => ({ ...prev, [key]: true }))}
          onBlur={() => setFocused(prev => ({ ...prev, [key]: false }))}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          style={styles.input}
        />
        {toggleVisible && (
          <TouchableOpacity onPress={onToggle}>
            <Text style={styles.eyeIcon}>{secure ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{'< 뒤로가기'}</Text>
        </TouchableOpacity>

        {/* 타이틀 */}
        <Text style={styles.title}>회원가입</Text>

        {/* 프로필 이미지 선택 */}
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            <Image
              source={{ uri: profileImage || defaultProfileUri }}
              style={styles.profileImage}
            />
            <Text style={styles.imageText}>이미지 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={setDefaultImage}>
            <Text style={styles.defaultImageText}>기본 이미지로 설정</Text>
          </TouchableOpacity>
        </View>

        {/* 입력 폼 영역 */}
        <View style={styles.form}>
          {renderFloatingInput('닉네임', nickname, setNickname, 'nickname')}
          {renderFloatingInput('이메일', email, setEmail, 'email', false, 'email-address')}
          {renderFloatingInput('비밀번호', password, setPassword, 'password', !showPassword, 'default', true, () => setShowPassword(prev => !prev))}
          {renderFloatingInput('비밀번호 확인', confirmPassword, setConfirmPassword, 'confirmPassword', !showConfirmPassword, 'default', true, () => setShowConfirmPassword(prev => !prev))}

          {/* 회원가입 버튼 */}
          <TouchableOpacity onPress={handleSignup} style={styles.button}>
            <Text style={styles.buttonText}>회원가입</Text>
          </TouchableOpacity>

          {/* 로그인 화면으로 이동 링크 */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              이미 계정이 있으신가요? <Text style={styles.linkHighlight}>로그인</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2B2B2B',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  backButton: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePicker: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#444',
  },
  imageText: {
    color: '#ccc',
    marginTop: 8,
    fontSize: 14,
  },
  defaultImageText: {
    color: '#FFB47F',
    fontSize: 13,
    marginTop: 6,
  },
  form: {
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  floatingLabel: {
    position: 'absolute',
    left: 10,
    top: 14,
    color: '#aaa',
    fontSize: 16,
    zIndex: 1,
  },
  floatingLabelFocused: {
    top: -20,
    fontSize: 12,
    color: '#aaa',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3C3C3C',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingTop: 18,
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 10,
    color: '#ccc',
  },
  button: {
    backgroundColor: '#FF8A3D',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  linkHighlight: {
    color: '#FFB47F',
    fontWeight: '600',
  },
});
