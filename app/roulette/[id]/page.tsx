'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface RouletteData {
  roulette_number: number;
  roulette_name: string;
  roulette_data_count: number;
  roulette_inner_data: string[];
  roulette_user_data?: string[];
  GuaranteedWin?: string | null;
}

export default function RoulettePage() {
  const params = useParams();
  const router = useRouter();
  const [rouletteData, setRouletteData] = useState<RouletteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [wonItems, setWonItems] = useState<Set<string>>(new Set()); // 당첨된 항목 추적
  const [wonItemUsers, setWonItemUsers] = useState<Map<string, string>>(new Map()); // 당첨된 항목과 유저 매핑
  const svgRef = useRef<SVGSVGElement>(null);
  const rotationRef = useRef(0);
  
  // 중복 제거 모드 확인 (URL 쿼리 파라미터에서)
  const [noDuplicate, setNoDuplicate] = useState(false);
  
  useEffect(() => {
    // URL 쿼리 파라미터에서 noDuplicate 확인
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setNoDuplicate(searchParams.get('noDuplicate') === 'true');
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchRouletteData();
    }
  }, [params.id]);

  const fetchRouletteData = async () => {
    if (!params.id || Array.isArray(params.id)) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/roulettes/${params.id}`);
      const result = await response.json();
      if (result.success) {
        setRouletteData(result.data);
      }
    } catch (error) {
      console.error('Error fetching roulette data:', error);
    } finally {
      setLoading(false);
    }
  };

  const spinRoulette = () => {
    if (!rouletteData || spinning) return;

    setSpinning(true);
    setWinner(null);
    setShowModal(false);

    const itemCount = rouletteData.roulette_data_count;
    const anglePerItem = 360 / itemCount;
    
    // 중복 제거 모드일 때 당첨 가능한 항목 필터링
    const availableItems = noDuplicate
      ? rouletteData.roulette_inner_data.filter((item) => !wonItems.has(item))
      : rouletteData.roulette_inner_data;
    
    // 모든 항목이 당첨된 경우 처리
    if (noDuplicate && availableItems.length === 0) {
      setSpinning(false);
      return;
    }
    
    // GuaranteedWin이 있는지 확인
    let targetItemIndex: number;
    if (rouletteData.GuaranteedWin && rouletteData.GuaranteedWin !== null) {
      // GuaranteedWin이 있으면 해당 항목을 당첨자로 설정
      const guaranteedItem = rouletteData.GuaranteedWin;
      // 중복 제거 모드일 때 이미 당첨된 항목이면 사용 불가
      if (noDuplicate && wonItems.has(guaranteedItem)) {
        setSpinning(false);
        alert('指定された項目は既に当選済みです。');
        return;
      }
      targetItemIndex = rouletteData.roulette_inner_data.indexOf(guaranteedItem);
      if (targetItemIndex === -1) {
        // GuaranteedWin 항목이 roulette_inner_data에 없으면 사용 가능한 항목 중 랜덤 선택
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        const selectedItem = availableItems[randomIndex];
        targetItemIndex = rouletteData.roulette_inner_data.indexOf(selectedItem);
      }
    } else {
      // GuaranteedWin이 없으면 사용 가능한 항목 중 랜덤 선택
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      const selectedItem = availableItems[randomIndex];
      targetItemIndex = rouletteData.roulette_inner_data.indexOf(selectedItem);
    }
    
    // 핀은 상단 중앙(-90도)에 고정되어 있음
    // 룰렛이 회전한 후 상단 중앙에 오는 항목이 당첨
    // 룰렛 항목은 -90도(상단)부터 시작하여 시계방향으로 배치됨
    
    let targetItemCenterAngle: number;
    
    // GuaranteedWin이 있을 때 자연스러운 오차 추가 (±5도)
    if (rouletteData.GuaranteedWin && rouletteData.GuaranteedWin !== null) {
      // 1. 각 항목 범위 구하기 (0~360도 기준)
      const itemStartAngle = ((-90 + targetItemIndex * anglePerItem) % 360 + 360) % 360;
      const itemEndAngle = ((-90 + (targetItemIndex + 1) * anglePerItem) % 360 + 360) % 360;
      
      // 2. 각 항목 범위의 중간치 구하기
      let itemCenterAngle: number;
      if (itemStartAngle < itemEndAngle) {
        itemCenterAngle = itemStartAngle + anglePerItem / 2;
      } else {
        // 360도를 넘어가는 경우
        const totalRange = (360 - itemStartAngle) + itemEndAngle;
        itemCenterAngle = (itemStartAngle + totalRange / 2) % 360;
      }
      
      // 3. 중간치에서 오차 범위 구하기 (roulette_data_count에 따라 다름)
      // roulette_data_count에 따른 오차 범위 매핑
      const offsetMap: { [key: number]: number } = {
        2: 90,
        3: 60,
        4: 45,
        5: 36,
        6: 30,
        7: 25,
        8: 22,
        9: 20,
        10: 18,
        11: 16,
        12: 15,
        13: 13,
        14: 12,
        15: 12,
      };
      // roulette_data_count에 해당하는 오차 범위 가져오기 (기본값: 5도)
      const offsetRange = offsetMap[itemCount] || 5;
      const minAngle = itemCenterAngle - offsetRange;
      const maxAngle = itemCenterAngle + offsetRange;
      
      // 4. 오차 범위 내에서 랜덤으로 각도 선택
      const randomAngle = minAngle + Math.random() * (maxAngle - minAngle);
      // 0~360도 범위로 정규화
      targetItemCenterAngle = ((randomAngle % 360) + 360) % 360;
    } else {
      // GuaranteedWin이 없으면 정확한 중간 각도 사용
      targetItemCenterAngle = -90 + targetItemIndex * anglePerItem + anglePerItem / 2;
    }
    
    // 상단 중앙(-90도)에 오도록 하려면, targetItemCenterAngle이 -90도 위치로 오도록 회전
    // 룰렛이 시계방향으로 회전하면:
    // - 원래 각도 theta에 있던 항목은 (theta + 회전각도) 위치로 이동
    // - 핀(-90도)이 가리키는 항목의 원래 각도는 (-90 - 회전각도)
    // - 따라서: targetItemCenterAngle = -90 - 회전각도
    // - 회전각도 = -90 - targetItemCenterAngle
    
    // targetItemCenterAngle을 0~360도 범위로 정규화
    const normalizedTargetAngleForRotation = ((targetItemCenterAngle % 360) + 360) % 360;
    
    // 회전 각도 계산: -90도 위치에 오도록
    // 룰렛이 시계방향으로 회전하면:
    // - 원래 각도 theta에 있던 항목은 (theta + 회전각도) 위치로 이동
    // - 핀(-90도)이 가리키는 항목의 원래 각도는 (-90 - 회전각도)
    // - 따라서: normalizedTargetAngleForRotation = -90 - 회전각도
    // - 회전각도 = -90 - normalizedTargetAngleForRotation
    // - -90도는 270도로 표현 가능하므로: 회전각도 = 270 - normalizedTargetAngleForRotation
    // - 이를 0~360도 범위로 정규화: (270 - normalizedTargetAngleForRotation + 360) % 360
    let angleToRotate = (270 - normalizedTargetAngleForRotation + 360) % 360;
    
    // 검증: angleToRotate가 올바른지 확인
    // 목표: normalizedTargetAngleForRotation이 핀 위치(-90도)에 오도록
    // 회전 후: normalizedTargetAngleForRotation + angleToRotate = -90도 (또는 270도)
    // 따라서: angleToRotate = 270 - normalizedTargetAngleForRotation
    // 이게 맞는지 확인
    const testAngle = (normalizedTargetAngleForRotation + angleToRotate) % 360;
    const expectedAngle = 270; // -90도 = 270도
    if (Math.abs(testAngle - expectedAngle) > 0.1) {
      console.log('경고: angleToRotate 계산 오류', {
        normalizedTargetAngleForRotation,
        angleToRotate,
        testAngle,
        expectedAngle
      });
    }
    
    // GuaranteedWin이 있을 때는 목표 각도에 정확히 멈추도록 설정
    if (rouletteData.GuaranteedWin && rouletteData.GuaranteedWin !== null) {
      // 1. 항상 기본 위치(0도)에서 시작하도록 rotationRef.current 리셋
      rotationRef.current = 0;
      
      // 2. 회전 수는 반드시 10회로 고정
      const fixedSpins = 10;
      
      // 3. 목표 각도에 멈추도록 역산 계산
      // 목표: normalizedTargetAngleForRotation이 핀 위치(-90도)에 오도록
      // 회전각도 = 270 - normalizedTargetAngleForRotation
      // 10회 회전 후 멈추려면: rotationRef.current = 10 * 360 + 회전각도
      rotationRef.current = fixedSpins * 360 + angleToRotate;
    } else {
      // GuaranteedWin이 없으면 기존대로
      const randomSpins = 5 + Math.random() * 10;
      let totalRotation = randomSpins * 360 + angleToRotate;
      rotationRef.current += totalRotation;
    }

    // 최종 회전 각도 계산 (0~360도 범위로 정규화)
    // 실제 애니메이션은 rotationRef.current만큼 회전하므로 이를 기준으로 계산
    const finalAngle = ((rotationRef.current % 360) + 360) % 360;
    
    // 당첨 항목 계산
    // 핀은 -90도(상단 중앙) 위치에 고정되어 있음
    // 룰렛이 finalAngle만큼 시계방향으로 회전했을 때:
    // - 원래 각도 theta에 있던 항목은 (theta + finalAngle) 위치로 이동
    // - 핀(-90도)이 가리키는 항목의 원래 각도는 (-90 - finalAngle)
    // - 이를 0~360도 범위로 정규화
    // 주의: finalAngle은 시계방향 회전 각도이므로, 핀 위치는 반시계방향으로 계산
    let pinTargetAngle = ((-90 - finalAngle) % 360 + 360) % 360;
    
    // 룰렛 항목은 -90도부터 시작하여 시계방향으로 배치
    // 각 항목의 시작 각도: -90 + i * anglePerItem
    // 각 항목의 끝 각도: -90 + (i+1) * anglePerItem
    // 이를 0~360도 범위로 정규화하여 계산
    let calculatedItemIndex = -1;
    for (let i = 0; i < itemCount; i++) {
      const itemStartAngle = ((-90 + i * anglePerItem) % 360 + 360) % 360;
      const itemEndAngle = ((-90 + (i + 1) * anglePerItem) % 360 + 360) % 360;
      
      if (itemStartAngle < itemEndAngle) {
        // 일반적인 경우
        if (pinTargetAngle >= itemStartAngle && pinTargetAngle < itemEndAngle) {
          calculatedItemIndex = i;
          break;
        }
      } else {
        // 360도를 넘어가는 경우 (예: 350도 ~ 10도)
        if (pinTargetAngle >= itemStartAngle || pinTargetAngle < itemEndAngle) {
          calculatedItemIndex = i;
          break;
        }
      }
    }
    
    // 안전장치: 계산 실패 시 targetItemIndex 사용
    if (calculatedItemIndex === -1) {
      calculatedItemIndex = targetItemIndex;
    }
    
    // GuaranteedWin이 있으면 해당 항목이 정확히 핀 위치에 오도록 보장
    if (rouletteData.GuaranteedWin && rouletteData.GuaranteedWin !== null) {
      calculatedItemIndex = targetItemIndex;
    }
    
    // 당첨 항목과 멈춘 위치 기록
    // 실제 멈춘 위치는 애니메이션이 rotationRef.current만큼 회전한 후의 위치
    // 핀은 -90도 위치에 고정되어 있고, 룰렛이 finalAngle만큼 시계방향으로 회전했을 때:
    // - 핀(-90도)이 가리키는 항목의 원래 각도는 (-90 - finalAngle) % 360
    // - 이는 이미 위에서 계산한 pinTargetAngle과 동일
    const actualPinTargetAngle = pinTargetAngle;
    
    // targetItemCenterAngle을 0~360도 범위로 정규화하여 비교
    const normalizedTargetAngle = ((targetItemCenterAngle % 360) + 360) % 360;
    
    const winnerItem = rouletteData.roulette_inner_data[calculatedItemIndex];
    console.log('당첨 항목:', winnerItem);
    console.log('멈춘 위치 (핀 위치의 원래 각도):', actualPinTargetAngle.toFixed(2), '도');
    if (rouletteData.GuaranteedWin && rouletteData.GuaranteedWin !== null) {
      console.log('목표 각도:', normalizedTargetAngle.toFixed(2), '도');
      // 각도 차이 계산 (360도 경계 처리)
      let angleDiff = Math.abs(actualPinTargetAngle - normalizedTargetAngle);
      angleDiff = Math.min(angleDiff, 360 - angleDiff); // 360도 경계 처리
      console.log('각도 차이:', angleDiff.toFixed(2), '도');
    }

    // 룰렛만 회전하도록 애니메이션 (룰렛 그룹에 적용)
    const rouletteGroup = document.getElementById('roulette-group');
    if (rouletteGroup) {
      // GuaranteedWin이 있을 때는 항상 기본 위치(0도)에서 시작
      if (rouletteData.GuaranteedWin && rouletteData.GuaranteedWin !== null) {
        // 먼저 0도로 리셋 (애니메이션 없이)
        rouletteGroup.style.transition = 'none';
        rouletteGroup.style.transform = 'rotate(0deg)';
        // 다음 프레임에서 목표 위치로 애니메이션
        requestAnimationFrame(() => {
          if (rouletteGroup) {
            rouletteGroup.style.transition = 'transform 7s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
            rouletteGroup.style.transform = `rotate(${rotationRef.current}deg)`;
          }
        });
      } else {
        // GuaranteedWin이 없으면 기존대로
        rouletteGroup.style.transition = 'transform 7s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        rouletteGroup.style.transform = `rotate(${rotationRef.current}deg)`;
      }
    }

    // 애니메이션 완료 후 당첨 항목 설정
    setTimeout(() => {
      setSpinning(false);
      // 계산된 당첨 항목 사용
      const actualWinner = rouletteData.roulette_inner_data[calculatedItemIndex];
      setWinner(actualWinner);
      setShowModal(true);
      
      // 중복 제거 모드일 때 당첨된 항목 추가 및 유저 매핑
      if (noDuplicate) {
        setWonItems((prev) => new Set(prev).add(actualWinner));
        // roulette_user_data가 있고 빈 문자열이 아닌 실제 데이터가 있으면 매핑
        if (rouletteData.roulette_user_data && rouletteData.roulette_user_data.length > 0) {
          // 빈 문자열이 아닌 유저만 필터링
          const validUsers = rouletteData.roulette_user_data.filter(user => user && user.trim() !== '');
          const usedUserCount = wonItemUsers.size;
          if (usedUserCount < validUsers.length) {
            const userToAssign = validUsers[usedUserCount];
            setWonItemUsers((prev) => new Map(prev).set(actualWinner, userToAssign));
          }
        }
      }
    }, 7000);
  };

  // Reset 함수: 모든 당첨 항목 초기화
  const handleReset = () => {
    setWonItems(new Set());
    setWonItemUsers(new Map());
    setWinner(null);
    setShowModal(false);
  };

  // 모든 항목이 당첨되었는지 확인
  const allItemsWon = noDuplicate && rouletteData && wonItems.size === rouletteData.roulette_inner_data.length;

  // roulette_user_data에 실제 데이터가 있는지 확인 (빈 문자열 제외)
  const hasUserData = rouletteData?.roulette_user_data && 
    rouletteData.roulette_user_data.some(user => user && user.trim() !== '');

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

  if (!rouletteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">ルーレットデータを読み込めませんでした。</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const itemCount = rouletteData.roulette_data_count;
  const anglePerItem = 360 / itemCount;
  const radius = 300; // 더 크게
  const svgSize = 700; // SVG 크기 증가
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // 각 항목의 경로와 텍스트 위치 계산
  const items = rouletteData.roulette_inner_data.map((item, index) => {
    const startAngle = (index * anglePerItem - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * anglePerItem - 90) * (Math.PI / 180);
    
    const largeArcFlag = anglePerItem > 180 ? 1 : 0;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    // 텍스트 위치 (중간 각도)
    const textAngle = (index * anglePerItem + anglePerItem / 2 - 90) * (Math.PI / 180);
    const textRadius = radius * 0.7;
    const textX = centerX + textRadius * Math.cos(textAngle);
    const textY = centerY + textRadius * Math.sin(textAngle);

    // 색상 (무지개 파스텔톤: 빨주노초파남보)
    // 중복 제거 모드일 때 당첨된 항목은 회색으로 표시
    const isWon = noDuplicate && wonItems.has(item);
    let color: string;
    if (isWon) {
      // 당첨된 항목은 회색 (더 진한 회색)
      color = 'hsl(0, 0%, 50%)';
    } else {
      // 무지개 색상 HSL 값 (파스텔톤: 채도 낮추고 명도 높임)
      const rainbowColors = [
        { h: 0, s: 60, l: 75 },   // 빨강 (1번)
        { h: 30, s: 60, l: 75 },  // 주황 (2번)
        { h: 60, s: 60, l: 75 },  // 노랑 (3번)
        { h: 120, s: 60, l: 75 }, // 초록 (4번)
        { h: 180, s: 60, l: 75 }, // 파랑 (5번)
        { h: 240, s: 60, l: 75 }, // 남색 (6번)
        { h: 270, s: 60, l: 75 }, // 보라 (7번)
      ];
      // 인덱스를 7로 나눈 나머지로 무지개 색상 순환
      const colorIndex = index % 7;
      const selectedColor = rainbowColors[colorIndex];
      color = `hsl(${selectedColor.h}, ${selectedColor.s}%, ${selectedColor.l}%)`;
    }

    return {
      pathData,
      textX,
      textY,
      textAngle: (textAngle * 180) / Math.PI + 90,
      item,
      color,
      isWon,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      {/* 룰렛과 항목 표를 감싸는 컨테이너 */}
      <div className="flex items-start justify-center gap-8 mb-8">
        {/* 룰렛 컨테이너 - 브라우저 중앙 기준 */}
        <div className="flex flex-col items-center">
          {/* 룰렛 타이틀과 뒤로가기 버튼 - 하나의 파츠로 묶어서 중앙 정렬 */}
          <div className="mb-6 mr-10 flex items-center justify-center">
            <div className="flex items-center gap-4">
              {/* 뒤로가기 버튼 - 타이틀 왼쪽 */}
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-200 w-10 h-10 rounded-lg transition-colors duration-200 flex-shrink-0"
              >
                <svg width="40" height="40" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {/* 룰렛 타이틀 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-5xl font-bold whitespace-nowrap" style={{ color: '#00489D' }}>{rouletteData.roulette_name}</h1>
              </div>
            </div>
          </div>
          
          {/* 룰렛 */}
          <div className="relative">
            <div className="relative" style={{ width: `${svgSize}px`, height: `${svgSize}px` }}>
            {/* 고정된 포인터 (상단 중앙) - 상하반전 */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
              <svg width="50" height="50" viewBox="0 0 50 50">
                <polygon
                  points="25,50 10,15 40,15"
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth="2.5"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))"
                />
              </svg>
            </div>
            
            {/* 룰렛 SVG */}
            <svg
              ref={svgRef}
              width={svgSize}
              height={svgSize}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="drop-shadow-2xl"
              style={{ transformOrigin: 'center' }}
            >
              {/* 외곽 원 (장식) */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius + 10}
                fill="none"
                stroke="#1e40af"
                strokeWidth="4"
                opacity="0.3"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r={radius + 5}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                opacity="0.5"
              />
              
              {/* 룰렛 그룹 (회전하는 부분) */}
              <g id="roulette-group" style={{ transformOrigin: `${centerX}px ${centerY}px` }}>
                {items.map((item, index) => (
                  <g key={index}>
                    <path
                      d={item.pathData}
                      fill={item.color}
                      stroke="#fff"
                      strokeWidth="3"
                      className="transition-all duration-300"
                    />
                    <text
                      x={item.textX}
                      y={item.textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="32"
                      fontWeight="bold"
                      transform={`rotate(${item.textAngle}, ${item.textX}, ${item.textY})`}
                      style={{ 
                        pointerEvents: 'none',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        letterSpacing: '1px'
                      }}
                    >
                      {item.item}
                    </text>
                  </g>
                ))}
                {/* 중앙 원 (룰렛과 함께 회전) - 더 크고 모던하게 */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="50"
                  fill="#1e40af"
                  stroke="#fff"
                  strokeWidth="4"
                  filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="35"
                  fill="#3b82f6"
                  opacity="0.8"
                />
              </g>
            </svg>
            
            {/* 돌리기 버튼 (룰렛 정중앙) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <button
                onClick={spinRoulette}
                disabled={spinning}
                className="text-white w-32 h-32 rounded-full font-bold text-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 flex items-center justify-center border-4 border-white"
                style={{ 
                  backgroundColor: spinning ? '#9CA3AF' : '#00489D',
                }}
                onMouseEnter={(e) => {
                  if (!spinning) {
                    e.currentTarget.style.backgroundColor = '#0056B3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!spinning) {
                    e.currentTarget.style.backgroundColor = '#00489D';
                  }
                }}
              >
                {spinning ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-1"></div>
                    <span className="text-sm">回転中...</span>
                  </div>
                ) : (
                  <div className="relative w-25 h-25 flex items-center justify-center">
                    <img
                      src="/toyoko-inn-logo.png"
                      alt="Toyoko Inn"
                      className="w-full h-full object-contain"
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                )}
              </button>
            </div>
          </div>
          </div>
          
          {/* Reset 버튼 (모든 항목 당첨 시 표시) - 룰렛 아래 */}
          <div className="flex justify-center mt-6" style={{ minHeight: '64px' }}>
            {allItemsWon && (
              <button
                onClick={handleReset}
                className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3V1M10 3C8.89543 3 7.89543 3.89543 7.89543 5M10 3C11.1046 3 12.1046 3.89543 12.1046 5M17 10C17 13.866 13.866 17 10 17M17 10C17 6.13401 13.866 3 10 3M17 10H19M10 17C6.13401 17 3 13.866 3 10M10 17V19M3 10C3 6.13401 6.13401 3 10 3M3 10H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Reset
              </button>
            )}
          </div>
        </div>
        
        {/* 항목 표 */}
        <div className="ml-20 mt-15">
          {/* 중복제거 상태 표시 - 항목 표 카드 위 중앙 */}
          {noDuplicate && (
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 border-2 border-blue-600 rounded-lg px-4 py-2 flex items-center gap-2 whitespace-nowrap">
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span className="text-sm font-semibold" style={{ color: '#00489D' }}>重複なし</span>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-lg p-6" style={{ minHeight: `${svgSize}px` }}>
            <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: '#00489D' }}>項目一覧</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-blue-200">
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#00489D' }}>番号</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#00489D' }}>項目</th>
                {/* 当選者 열: 중복제거 ON이고 roulette_user_data에 실제 데이터가 있을 때만 표시 */}
                {noDuplicate && hasUserData && (
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: '#00489D' }}>当選者</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rouletteData.roulette_inner_data.map((item, index) => {
                const isWon = noDuplicate && wonItems.has(item);
                const winnerUser = isWon ? wonItemUsers.get(item) : null;
                return (
                  <tr key={index} className={`border-b border-gray-100 transition-colors ${isWon ? 'bg-gray-300' : 'hover:bg-blue-50'}`}>
                    <td className="py-3 px-4 text-gray-700 font-medium">{index + 1}</td>
                    <td className={`py-3 px-4 ${isWon ? 'text-gray-500' : 'text-gray-800'}`}>
                      <span className={`inline-block relative ${isWon ? 'line-through' : ''}`}>
                        {item}
                        {isWon && (
                          <span 
                            className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-500 transform -translate-y-1/2 animate-line-through"
                          />
                        )}
                      </span>
                    </td>
                    {/* 当選者 열: 중복제거 ON이고 roulette_user_data에 실제 데이터가 있을 때만 표시 */}
                    {noDuplicate && hasUserData && (
                      <td className="py-3 px-4 text-gray-700">
                        {winnerUser || '-'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* 결과 모달 */}
      {showModal && winner && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-bounce-in pointer-events-auto">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-blue-600 mb-4">当選！</h2>
              <p className="text-2xl font-semibold text-gray-800 mb-6">{winner}</p>
              <button
                onClick={() => {
                  setShowModal(false);
                  setWinner(null);
                }}
                className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

