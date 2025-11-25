'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Roulette {
  _id: string;
  roulette_name: string;
  roulette_number: number;
}

export default function Home() {
  const [roulettes, setRoulettes] = useState<Roulette[]>([]);
  const [selectedRoulette, setSelectedRoulette] = useState<string>('');
  const [noDuplicate, setNoDuplicate] = useState(false); // 중복 제거 토글 (기본값: OFF)
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRoulettes();
  }, []);

  const fetchRoulettes = async () => {
    try {
      const response = await fetch('/api/roulettes');
      const result = await response.json();
      if (result.success) {
        setRoulettes(result.data);
      }
    } catch (error) {
      console.error('Error fetching roulettes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedRoulette) {
      // 중복 제거 옵션을 쿼리 파라미터로 전달
      const queryParam = noDuplicate ? '?noDuplicate=true' : '';
      router.push(`/roulette/${selectedRoulette}${queryParam}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full" style={{ minWidth: '450px', maxWidth: '550px' }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <a
              href="https://www.toyoko-inn.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform duration-200 hover:scale-110 cursor-pointer"
            >
              <Image
                src="/toyoko-inn-logo-blue1.png"
                alt="Toyoko Inn"
                width={100}
                height={100}
                className="object-contain"
                priority
              />
            </a>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#00489D' }}>東横イン ルーレット</h1>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label htmlFor="roulette-select" className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー選択
              </label>
              <select
                id="roulette-select"
                value={selectedRoulette}
                onChange={(e) => setSelectedRoulette(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900"
              >
                <option value="">カテゴリーを選択してください</option>
                {roulettes.map((roulette) => (
                  <option key={roulette._id} value={roulette.roulette_number}>
                    {roulette.roulette_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">重複なし</span>
                  {/* 정보 아이콘 및 툴팁 */}
                  <div className="relative group">
                    <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-help">
                      <span className="text-xs font-bold leading-none">!</span>
                    </div>
                    {/* 툴팁 */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-70 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <p className="text-center">重複なしの設定では、すべての項目が一度ずつのみ当選し、重複当選は発生しません。</p>
                      {/* 툴팁 화살표 */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={noDuplicate}
                    onChange={(e) => setNoDuplicate(e.target.checked)}
                    className="sr-only"
                    id="noDuplicate-toggle"
                  />
                  <label
                    htmlFor="noDuplicate-toggle"
                    className="cursor-pointer"
                  >
                    <div
                      className={`w-14 h-7 rounded-full transition-colors duration-200 flex items-center ${
                        noDuplicate ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          noDuplicate ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleSelect}
              disabled={!selectedRoulette}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              選択
            </button>
          </>
        )}
        </div>
        
        {/* お問い合わせ 버튼 */}
        <button
          onClick={() => setShowContactModal(true)}
          className="mt-10 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 text-sm"
        >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        お問い合わせ
        </button>
      </div>

      {/* 연락처 모달 */}
      {showContactModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => setShowContactModal(false)}>
          <div className="bg-gray-200 rounded-lg shadow-2xl p-6 max-w-xs w-full mx-4 relative border-4 border-black" onClick={(e) => e.stopPropagation()}>
            {/* X 닫기 버튼 */}
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 hover:scale-110 active:scale-95 transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#00489D' }}>お問い合わせ</h2>
              <div className="space-y-2">
                <p className="text-base text-gray-800">マーケティング部　リュウ</p>
                <a 
                  href="mailto:jaehyeok.ryu@toyoko-inn.com"
                  className="text-blue-600 hover:text-blue-700 hover:underline text-base"
                >
                  jaehyeok.ryu@toyoko-inn.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
