// 감성적인 그라데이션 프리셋
export const GRADIENT_PRESETS = [
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', // Default (Pastel Blue)
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', // Soft Pink
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', // Mint Blue
    'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)', // Sunset Purple
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // Lavender
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Emerald
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', // Silver
    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', // Sky Blue
    'linear-gradient(to top, #30cfd0 0%, #330867 100%)', // Deep Ocean
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'  // Royal Purple
];

// 이미지 프리셋 (대폭 확장 & 고화질 ID 검증 완료 v2)
export const IMAGE_PRESETS = [
    // --- 국가/도시 ---
    {
        category: '한국',
        imageUrl: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=800&q=80',
        keywords: ['한국', '서울', '경복궁', '전주', '한옥', 'korea', 'seoul']
    },
    {
        category: '제주',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // Replace with Beach (Safe)
        keywords: ['제주', 'jeju', '섬', '현무암', '성산', '서귀포', '귤']
    },
    {
        category: '일본',
        imageUrl: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=800&q=80', // Tokyo Night
        keywords: ['일본', '도쿄', '오사카', '교토', '후쿠오카', '삿포로', 'japan', 'tokyo']
    },
    {
        category: '유럽',
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', // Paris Eiffel (Proven)
        keywords: ['유럽', '파리', '프랑스', '이탈리아', '스페인', '로마', '체코', '오스트리아', '부다페스트', '동유럽', 'europe', 'paris']
    },
    {
        category: '미국',
        imageUrl: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=800&q=80', // NYC
        keywords: ['미국', '뉴욕', 'LA', '하와이', 'usa', 'nyc', 'america']
    },
    {
        category: '동남아',
        imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80', // Thailand/Temple
        keywords: ['베트남', '태국', '방콕', '다낭', '발리', '세부', 'asia', 'sea']
    },

    // --- 테마/분위기 ---
    {
        category: '바다',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // Beach
        keywords: ['바다', '해변', '오션', '여름', '수영', '비치', 'beach', 'ocean', 'summer']
    },
    {
        category: '호캉스',
        imageUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80', // Modern Hotel
        keywords: ['호텔', '호캉스', '수영장', '리조트', '휴식', 'pool', 'hotel', 'relax']
    },
    {
        category: '캠핑',
        imageUrl: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80', // Tent
        keywords: ['캠핑', '글램핑', '텐트', '불멍', '산장', 'camping']
    },
    {
        category: '자연',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', // Deep Forest
        keywords: ['자연', '산', '숲', '등산', '공원', '트레킹', 'nature', 'forest', 'mountain']
    },
    {
        category: '도시',
        imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80', // City View
        keywords: ['도시', '시티', '야경', '건물', '쇼핑', 'city', 'urban']
    },
    {
        category: '노을',
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', // Golden Hour Field
        keywords: ['노을', '석양', '일몰', '해질녘', 'sunset', 'dusk']
    },
    {
        category: '휴양지',
        imageUrl: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=800&q=80', // Resort Beach
        keywords: ['휴양지', '리조트', '섬', '야자수', 'resort', 'vacation']
    },
    {
        category: '먹방',
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', // BBQ/Food
        keywords: ['맛집', '먹방', '음식', '식도락', '카페', '고기', 'food', 'bbq']
    },
    {
        category: '기차',
        imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80', // Train track
        keywords: ['기차', '내일로', '배낭', '기차여행', 'train', 'rail']
    },
    {
        category: '겨울',
        imageUrl: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=800&q=80', // Snow
        keywords: ['겨울', '눈', '스키', '보드', '설경', 'winter', 'snow']
    }
];

/**
 * 제목을 기반으로 어울리는 이미지 추천
 */
export const getRecommendedCover = (title: string): string | null => {
    const lowerTitle = title.toLowerCase();

    // 1. 키워드 매칭 시도
    for (const preset of IMAGE_PRESETS) {
        if (preset.keywords.some(k => lowerTitle.includes(k))) {
            return preset.imageUrl;
        }
    }

    return null;
};
