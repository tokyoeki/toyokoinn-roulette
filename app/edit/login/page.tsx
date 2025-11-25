'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = () => {
    if (loginId === 'toyoko' && loginPassword === '1045') {
      router.push('/edit');
    } else {
      setLoginError('IDまたはパスワードが正しくありません');
    }
  };

  const handleLoginKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
        {/* 뒤로가기 버튼 - 카드 왼쪽 상단 */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
          title="戻る"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#00489D' }}>ログイン</h2>
          <p className="text-sm text-gray-600 mt-2">ルーレット編集にはログインが必要です</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="login-id" className="block text-sm font-medium text-gray-700 mb-2">
              ID
            </label>
            <input
              id="login-id"
              type="text"
              value={loginId}
              onChange={(e) => {
                setLoginId(e.target.value);
                setLoginError('');
              }}
              onKeyPress={handleLoginKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="IDを入力"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              id="login-password"
              type="password"
              value={loginPassword}
              onChange={(e) => {
                setLoginPassword(e.target.value);
                setLoginError('');
              }}
              onKeyPress={handleLoginKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="パスワードを入力"
            />
          </div>

          {loginError && (
            <div className="text-red-600 text-sm text-center">
              {loginError}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  );
}

