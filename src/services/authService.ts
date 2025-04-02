export const redirectToSocialAuth = (provider: 'kakao' | 'google'): void => {
  localStorage.setItem('oauth_provider', provider);
  
  const kakaoClientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const kakaoRedirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleRedirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

  if (!kakaoClientId || !kakaoRedirectUri || !googleClientId || !googleRedirectUri) {
    throw new Error('OAuth 환경 변수가 설정되지 않았습니다.');
  }

  let authUrl = '';
  if (provider === 'kakao') {
    authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(kakaoRedirectUri)}&response_type=code`;
  } else if (provider === 'google') {
    authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(googleRedirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline`;
  }

  window.location.href = authUrl;
};
