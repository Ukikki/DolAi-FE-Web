import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const getAuthCodeFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
};

const handleSocialLogin = async (provider: 'kakao' | 'google') => {
  const code = getAuthCodeFromUrl();
  if (!code) {
    console.error('OAuth 인증 코드가 없습니다.');
    return;
  }

  // 백엔드에 소셜 로그인 인증 코드 전송
  try {
    const response = await axios.post('http://localhost:8081/auth/social', {
      provider,  // 'kakao' 또는 'google'
      code,      // 소셜 인증 코드
    }, {
  withCredentials: true, // 이거 필요할 수도 있어
});

    const jwt = response.data.data.accessToken;
    localStorage.setItem('jwt', jwt);
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
    console.log('로그인 성공!', jwt);
  } catch (error) {
    console.error('소셜 로그인 에러:', error);
  }
};

const AuthCallback: React.FC = () => {
  const provider = localStorage.getItem('oauth_provider') as 'kakao' | 'google' | null;
  const navigate = useNavigate();
  const calledRef = useRef(false); // 중복 방지

  useEffect(() => {
    const doLogin = async () => {
      if (calledRef.current) return;
      calledRef.current = true;
  
      if (!provider) {
        console.error('OAuth provider가 없습니다.');
        return;
      }
  
      await handleSocialLogin(provider);
      navigate('/');
    };
  
    doLogin();
  }, [navigate]);  

  return <div>로그인 중...</div>;
};

export default AuthCallback;
