'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Roulette {
  _id: string;
  roulette_name: string;
  roulette_number: number;
}

interface RouletteFullData {
  _id: string;
  roulette_number: number;
  roulette_name: string;
  roulette_data_count: number;
  roulette_inner_data: string[];
  roulette_user_data?: string[];
  GuaranteedWin?: string | null;
}

// 룰렛 편집 폼 컴포넌트
function RouletteEditForm({ 
  roulette, 
  onSave, 
  onCancel,
  isNew 
}: { 
  roulette: RouletteFullData; 
  onSave: (roulette: RouletteFullData) => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [formData, setFormData] = useState<RouletteFullData>({ ...roulette });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddItem = () => {
    if (formData.roulette_inner_data.length >= 15) {
      alert('項目数は最大15個までです');
      return;
    }
    setFormData({
      ...formData,
      roulette_inner_data: [...formData.roulette_inner_data, '新しい項目'],
      roulette_data_count: formData.roulette_data_count + 1,
    });
  };

  const handleDeleteItem = (index: number) => {
    const newData = formData.roulette_inner_data.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      roulette_inner_data: newData,
      roulette_data_count: newData.length,
    });
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(formData.roulette_inner_data[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const newData = [...formData.roulette_inner_data];
      newData[editingIndex] = editValue;
      setFormData({
        ...formData,
        roulette_inner_data: newData,
      });
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleSubmit = () => {
    if (formData.roulette_name.trim() === '') {
      alert('ルーレット名を入力してください');
      return;
    }
    if (formData.roulette_inner_data.length === 0) {
      alert('項目を少なくとも1つ追加してください');
      return;
    }
    if (formData.roulette_inner_data.length > 15) {
      alert('項目数は最大15個までです');
      return;
    }
    if (formData.roulette_inner_data.some(item => item.trim() === '')) {
      alert('空の項目があります');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ルーレット番号
        </label>
        <input
          type="number"
          value={formData.roulette_number}
          onChange={(e) => setFormData({ ...formData, roulette_number: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          disabled={!isNew}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ルーレット名
        </label>
        <input
          type="text"
          value={formData.roulette_name}
          onChange={(e) => setFormData({ ...formData, roulette_name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          項目数 (最大15)
        </label>
        <input
          type="number"
          min="1"
          max="15"
          value={formData.roulette_data_count}
          onChange={(e) => {
            let count = parseInt(e.target.value) || 0;
            // 최대 15개로 제한
            if (count > 15) {
              count = 15;
              alert('項目数は最大15個までです');
            }
            if (count < 1) {
              count = 1;
            }
            const currentData = formData.roulette_inner_data;
            if (count > currentData.length) {
              // 증가: 빈 항목 추가 (최대 15개까지만)
              const newData = [...currentData];
              for (let i = currentData.length; i < count && i < 15; i++) {
                newData.push('新しい項目');
              }
              setFormData({ ...formData, roulette_data_count: newData.length, roulette_inner_data: newData });
            } else if (count < currentData.length) {
              // 감소: 뒤에서부터 제거
              const newData = currentData.slice(0, count);
              setFormData({ ...formData, roulette_data_count: count, roulette_inner_data: newData });
            } else {
              setFormData({ ...formData, roulette_data_count: count });
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            内部データ
          </label>
          <button
            onClick={handleAddItem}
            className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            追加
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {formData.roulette_inner_data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
              {editingIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit();
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="text-green-600 hover:text-green-700 hover:bg-green-100 p-1 rounded transition-colors"
                    title="保存"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 p-1 rounded transition-colors"
                    title="キャンセル"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 px-3 py-1 text-gray-800">{item}</span>
                  <button
                    onClick={() => handleStartEdit(index)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-1 rounded transition-colors"
                    title="編集"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteItem(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors"
                    title="削除"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4 border-t">
        <button
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {isNew ? '作成' : '保存'}
        </button>
      </div>
    </div>
  );
}

export default function EditPage() {
  const router = useRouter();
  const [editingRoulette, setEditingRoulette] = useState<RouletteFullData | null>(null);
  const [fullRoulettes, setFullRoulettes] = useState<RouletteFullData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFullRoulettes();
  }, []);

  const fetchFullRoulettes = async () => {
    try {
      // 전체 데이터를 한 번에 가져오기
      const response = await fetch('/api/roulettes?full=true');
      const result = await response.json();
      if (result.success) {
        setFullRoulettes(result.data);
      }
    } catch (error) {
      console.error('Error fetching full roulettes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoulette = async (roulette: RouletteFullData) => {
    try {
      const response = await fetch(`/api/roulettes/${roulette.roulette_number}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roulette_name: roulette.roulette_name,
          roulette_data_count: roulette.roulette_data_count,
          roulette_inner_data: roulette.roulette_inner_data,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchFullRoulettes();
        setEditingRoulette(null);
      } else {
        alert('保存に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving roulette:', error);
      alert('保存に失敗しました');
    }
  };

  const handleDeleteRoulette = async (rouletteNumber: number) => {
    if (!confirm('このルーレットを削除してもよろしいですか？')) {
      return;
    }
    try {
      const response = await fetch(`/api/roulettes/${rouletteNumber}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchFullRoulettes();
      } else {
        alert('削除に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting roulette:', error);
      alert('削除に失敗しました');
    }
  };

  const handleAddRoulette = async () => {
    const newRoulette: RouletteFullData = {
      _id: '',
      roulette_number: fullRoulettes.length > 0 
        ? Math.max(...fullRoulettes.map(r => r.roulette_number)) + 1 
        : 1,
      roulette_name: '新しいルーレット',
      roulette_data_count: 4,
      roulette_inner_data: ['項目1', '項目2', '項目3', '項目4'],
      roulette_user_data: [],
    };
    setEditingRoulette(newRoulette);
  };

  const handleCreateRoulette = async (roulette: RouletteFullData) => {
    try {
      const response = await fetch('/api/roulettes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roulette_number: roulette.roulette_number,
          roulette_name: roulette.roulette_name,
          roulette_data_count: roulette.roulette_data_count,
          roulette_inner_data: roulette.roulette_inner_data,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchFullRoulettes();
        setEditingRoulette(null);
      } else {
        alert('作成に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating roulette:', error);
      alert('作成に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
        {/* 뒤로가기 버튼 - 카드 왼쪽 상단 */}
        <button
          onClick={() => {
            if (editingRoulette) {
              // 편집 중이면 편집 목록으로 돌아가기
              setEditingRoulette(null);
            } else {
              // 편집 목록이면 메인 페이지로 돌아가기
              router.push('/');
            }
          }}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
          title="戻る"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#00489D' }}>ルーレット編集</h2>

        {editingRoulette ? (
          <RouletteEditForm
            roulette={editingRoulette}
            onSave={editingRoulette._id ? handleSaveRoulette : handleCreateRoulette}
            onCancel={() => setEditingRoulette(null)}
            isNew={!editingRoulette._id}
          />
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <button
                onClick={handleAddRoulette}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                追加
              </button>
            </div>

            <div className="space-y-4">
              {fullRoulettes.map((roulette) => (
                <div key={roulette._id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-700">#{roulette.roulette_number}</span>
                      <span className="ml-2 text-lg font-bold" style={{ color: '#00489D' }}>{roulette.roulette_name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingRoulette(roulette)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-2 rounded transition-colors"
                        title="編集"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteRoulette(roulette.roulette_number)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-100 p-2 rounded transition-colors"
                        title="削除"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>項目数: {roulette.roulette_data_count}</span>
                    <span className="ml-4">項目: {roulette.roulette_inner_data.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

