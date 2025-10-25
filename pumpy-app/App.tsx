import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, BackHandler, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

// 🌐 실제 서버 URL (배포 후 업데이트)
// 환경 변수 우선 사용, 없으면 기본값 사용
const PRODUCTION_URL = process.env.EXPO_PUBLIC_WEB_URL || 'http://3.27.28.175/app'
const WEB_URL = __DEV__ 
  ? 'http://localhost:3000/app'  // 개발 환경
  : PRODUCTION_URL;              // 프로덕션 환경

export default function App() {
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [error, setError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Android 뒤로가기 버튼 처리
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>🚫</Text>
        <Text style={styles.errorTitle}>연결 실패</Text>
        <Text style={styles.errorMessage}>
          서버에 연결할 수 없습니다.{'\n'}
          인터넷 연결을 확인해주세요.
        </Text>
        <Text style={styles.errorUrl}>{WEB_URL}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#667eea" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBox}>
            <Text style={styles.logo}>🥊</Text>
            <Text style={styles.appName}>펌피</Text>
            <ActivityIndicator size="large" color="#667eea" style={styles.spinner} />
            <Text style={styles.loadingText}>로딩 중...</Text>
          </View>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        style={styles.webView}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={handleLoad}
        onError={handleError}
        onNavigationStateChange={handleNavigationStateChange}
        // 기본 설정
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={false}
        allowsBackForwardNavigationGestures={true}
        // 캐시 최적화 (성능 향상)
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        incognito={false}
        // 보안 및 호환성
        mixedContentMode="always"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        // 사용자 에이전트 (앱 식별)
        userAgent={`PumpyApp/${Platform.OS}/${Platform.Version}`}
        // 성능 최적화 (Android)
        androidLayerType="hardware"
        // 미디어 자동 재생
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        // 줌 비활성화 (일관된 UX)
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 30,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  errorUrl: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
