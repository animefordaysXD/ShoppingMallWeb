/* To Lead — 공유 스토어프런트 데이터 계층 (프런트엔드 데모, localStorage 기반). */
(function () {
  'use strict';

  var KEY = 'tolead.store.v1';
  var VERSION = 5;

  var moneyFmt = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  });

  var products = [
    {
      id: 'mara-fringed-poncho', sku: 'EC-W-101', name: '마라 프린지 포니오',
      gender: 'women', type: '니트웨어', price: 168000, compareAt: null,
      image: 'assets/images/poncho.jpg', colors: [{ name: '아이보리', hex: '#e9dfcd' }, { name: '오트', hex: '#c9b99f' }],
      sizes: ['XS', 'S', 'M', 'L'], stock: 12, rating: 4.8, reviewCount: 24, badge: '신상품', isNew: true,
      description: '손으로 매듭지은 프린지가 돋보이는 부드러운 울 블렌드 포니오. 여유로운 실루엣으로 자연스럽게 흘러내립니다.',
      details: ['울·캐시미어 블렌드', '핸드매듭 프린지', '여유로운 드레이프'],
      composition: '울 70%, 캐시미어 30%. 드라이클리닝 전용.', fit: '모델 178cm, S 사이즈 착용.',
      createdAt: '2026-10-20'
    },
    {
      id: 'iris-cotton-dress', sku: 'EC-W-102', name: '아이리스 코튼 원피스',
      gender: 'women', type: '원피스', price: 189000, compareAt: null,
      image: 'assets/images/dress.jpg', colors: [{ name: '화이트', hex: '#f5f2ea' }],
      sizes: ['XS', 'S', 'M', 'L'], stock: 7, rating: 4.9, reviewCount: 31, badge: '신상품', isNew: true,
      description: '산뜻한 유기농 코튼으로 만든 로맨틱한 실루엣. 몸에 맞는 보디스에서 풍성하고 가벼운 스커트로 이어집니다.',
      details: ['유기농 코튼 포플린', '조절 가능한 백 타이', '미디 기장'],
      composition: '유기농 코튼 100%. 찬물 세탁 후 자연 건조.', fit: '모델 175cm, S 사이즈 착용.',
      createdAt: '2026-10-18'
    },
    {
      id: 'sistine-belted-trench', sku: 'EC-W-103', name: '시스틴 벨티드 트렌치',
      gender: 'women', type: '아우터', price: 298000, compareAt: null,
      image: 'assets/images/trench.jpg', colors: [{ name: '스카이', hex: '#8ba7b8' }, { name: '샌드', hex: '#d6c3a7' }],
      sizes: ['XS', 'S', 'M', 'L'], stock: 4, rating: 4.7, reviewCount: 18, badge: null, isNew: false,
      description: '생활 방수 코튼 트윌로 만든 모던 트렌치. 셀프 타이 벨트와 스톰 플랩이 환절기를 위해 설계되었습니다.',
      details: ['생활 방수 코튼 트윌', '셀프 타이 벨트', '스톰 플랩과 백 벤트'],
      composition: '코튼 100%. 전문 드라이클리닝.', fit: '여유로운 핏. 모델 178cm, S 사이즈 착용.',
      createdAt: '2026-09-29'
    },
    {
      id: 'nocturne-leather-jacket', sku: 'EC-W-104', name: '녹턴 레더 자켓',
      gender: 'women', type: '아우터', price: 349000, compareAt: null,
      image: 'assets/images/leather-women.jpg', colors: [{ name: '블랙', hex: '#1b1815' }],
      sizes: ['XS', 'S', 'M', 'L'], stock: 9, rating: 4.9, reviewCount: 42, badge: null, isNew: false,
      description: '버터처럼 부드러운 램스킨으로 만든 크롭 모토 자켓. 앤티크 하드웨어와 부드러운 어깨선이 특징입니다.',
      details: ['램스킨 100%', '앤티크 메탈 하드웨어', '크롭·슬림 핏'],
      composition: '램스킨 100%. 전문 가죽 클리닝 전용.', fit: '정사이즈. 모델 178cm, S 사이즈 착용.',
      createdAt: '2026-09-15'
    },
    {
      id: 'terra-bomber-jacket', sku: 'EC-W-105', name: '테라 봄버 자켓',
      gender: 'women', type: '아우터', price: 218000, compareAt: null,
      image: 'assets/images/bomber.jpg', colors: [{ name: '테라코타', hex: '#b66f4f' }],
      sizes: ['XS', 'S', 'M', 'L'], stock: 6, rating: 4.8, reviewCount: 16, badge: null, isNew: false,
      description: '은은한 광택의 워시드 큐프로로 만든 가벼운 봄버. 리브 트림과 여유로운 핏이 편안합니다.',
      details: ['워시드 큐프로', '리브 트림', '투웨이 지퍼'],
      composition: '큐프로 100%. 드라이클리닝 전용.', fit: '여유로운 핏. 모델 178cm, S 사이즈 착용.',
      createdAt: '2026-09-08'
    },
    {
      id: 'pleated-wide-leg-trouser', sku: 'EC-W-106', name: '플리츠 와이드 팬츠',
      gender: 'women', type: '팬츠', price: 128000, compareAt: null,
      image: 'assets/images/trousers.jpg', colors: [{ name: '로즈워터', hex: '#d8b3a7' }, { name: '잉크', hex: '#1b1815' }],
      sizes: ['24', '26', '28', '30', '32'], stock: 0, rating: 4.6, reviewCount: 27, badge: null, isNew: false,
      description: '앞면에 한 개의 플리츠를 넣은 하이라이즈 팬츠. 바닥을 스치는 듯 유려한 와이드 레그입니다.',
      details: ['텐셀·울 블렌드', '앞면 원 플리츠', '하이라이즈 와이드 핏'],
      composition: '텐셀 68%, 울 32%. 드라이클리닝 전용.', fit: '모델 178cm, 26 사이즈 착용.',
      createdAt: '2026-08-22'
    },
    {
      id: 'sculpted-heel-boot', sku: 'EC-W-107', name: '스컬프티드 힐 부츠',
      gender: 'women', type: '슈즈', price: 198000, compareAt: null,
      image: 'assets/images/boots-women.jpg', colors: [{ name: '샌드', hex: '#d6c3a7' }],
      sizes: ['36', '37', '38', '39', '40'], stock: 5, rating: 4.7, reviewCount: 15, badge: null, isNew: false,
      description: '부드러운 스웨이드에 조각적인 블록 힐을 더한 앵클 부츠. 사이드 지퍼와 스퀘어 토가 돋보입니다.',
      details: ['고트 스웨이드', '7cm 스컬프티드 힐', '가죽 안감'],
      composition: '고트 스웨이드 갑피, 가죽 솔. 슈트리와 함께 보관하세요.', fit: '정사이즈. 힐 높이 7cm.',
      createdAt: '2026-08-30'
    },
    {
      id: 'sheer-silk-blouse', sku: 'EC-W-108', name: '시어 실크 블라우스',
      gender: 'women', type: '탑', price: 158000, compareAt: null,
      image: 'assets/images/silk-blouse.jpg', colors: [{ name: '누아르', hex: '#14110f' }],
      sizes: ['XS', 'S', 'M', 'L'], stock: 11, rating: 4.5, reviewCount: 12, badge: null, isNew: false,
      description: '깃털처럼 가벼운 실크 조젯으로 만든 블라우스. 부드럽게 드레이프되는 네크라인과 시어 소매가 매력적입니다.',
      details: ['실크 조젯 100%', '드레이프 네크라인', '시어 소매'],
      composition: '실크 100%. 찬물 손세탁 또는 드라이클리닝.', fit: '여유로운 핏. 모델 178cm, S 사이즈 착용.',
      createdAt: '2026-09-02'
    },
    {
      id: 'essential-heavy-tee', sku: 'EC-M-201', name: '에센셜 헤비 티',
      gender: 'men', type: '티셔츠', price: 45000, compareAt: null,
      image: 'assets/images/tee.jpg', colors: [{ name: '초크', hex: '#f2eee6' }, { name: '잉크', hex: '#1b1815' }],
      sizes: ['S', 'M', 'L', 'XL'], stock: 48, rating: 4.8, reviewCount: 112, badge: '베스트셀러', isNew: false,
      description: '두께감 있는 유기농 코튼으로 만든 데일리 티셔츠. 깔끔하고 탄탄한 실루엣이 오래갑니다.',
      details: ['260gsm 유기농 코튼', '리브 네크라인', '프리슈링크'],
      composition: '유기농 코튼 100%. 찬물 세탁.', fit: '레귤러 핏. 모델 186cm, M 사이즈 착용.',
      createdAt: '2026-07-12'
    },
    {
      id: 'boucle-knit-sweater', sku: 'EC-M-202', name: '부클 니트 스웨터',
      gender: 'men', type: '니트웨어', price: 135000, compareAt: null,
      image: 'assets/images/knit-men.jpg', colors: [{ name: '그래파이트', hex: '#52514f' }],
      sizes: ['S', 'M', 'L', 'XL'], stock: 14, rating: 4.9, reviewCount: 38, badge: '베스트셀러', isNew: false,
      description: '텍스처가 살아 있는 부클 니트. 하이 넥과 드롭 숄더로 가볍지만 따뜻하게 입을 수 있습니다.',
      details: ['이탈리아 울 부클', '하이 넥', '드롭 숄더'],
      composition: '울 54%, 재생 폴리아미드 46%. 찬물 손세탁.', fit: '여유로운 핏. 모델 186cm, M 사이즈 착용.',
      createdAt: '2026-08-11'
    },
    {
      id: 'rider-leather-jacket', sku: 'EC-M-203', name: '라이더 레더 자켓',
      gender: 'men', type: '아우터', price: 385000, compareAt: null,
      image: 'assets/images/leather-men.jpg', colors: [{ name: '블랙', hex: '#1b1815' }],
      sizes: ['S', 'M', 'L', 'XL'], stock: 3, rating: 5.0, reviewCount: 21, badge: null, isNew: false,
      description: '손마감 램스킨으로 만든 비대칭 레더 자켓. 입을수록 부드럽게 길들여집니다.',
      details: ['핸드피니시 램스킨', '비대칭 지퍼', '큐프로 안감'],
      composition: '램스킨 100%. 전문 가죽 클리닝 전용.', fit: '정사이즈. 모델 186cm, M 사이즈 착용.',
      createdAt: '2026-09-19'
    },
    {
      id: 'savile-suit-jacket', sku: 'EC-M-204', name: '서빌 수트 자켓',
      gender: 'men', type: '테일러링', price: 420000, compareAt: null,
      image: 'assets/images/suit.jpg', colors: [{ name: '코발트', hex: '#3a5c8a' }, { name: '차콜', hex: '#3c3a37' }],
      sizes: ['38', '40', '42', '44', '46'], stock: 8, rating: 4.8, reviewCount: 19, badge: null, isNew: false,
      description: '중간 두께의 울 블렌드로 만든 싱글 브레스트 자켓. 하프 캔버스 구조와 부드러운 어깨, 깔끔한 라펠이 특징입니다.',
      details: ['하프 캔버스 구조', '소프트 숄더', '기능성 커프 버튼'],
      composition: '울 98%, 엘라스테인 2%. 드라이클리닝 전용.', fit: '테일러드 핏. 모델 186cm, 40 사이즈 착용.',
      createdAt: '2026-09-25'
    },
    {
      id: 'relaxed-crew-sweatshirt', sku: 'EC-M-205', name: '릴랙스 크루 스웨트셔츠',
      gender: 'men', type: '스웨트셔츠', price: 95000, compareAt: null,
      image: 'assets/images/sweatshirt.jpg', colors: [{ name: '에크루', hex: '#e9dfcd' }, { name: '잉크', hex: '#1b1815' }],
      sizes: ['S', 'M', 'L', 'XL'], stock: 22, rating: 4.7, reviewCount: 54, badge: null, isNew: false,
      description: '안쪽을 기모로 가공한 코튼 플리스 스웨트셔츠. 여유로운 몸판과 리브 커프가 편안합니다.',
      details: ['420gsm 기모 코튼 플리스', '리브 커프와 밑단', '릴랙스 핏'],
      composition: '코튼 100%. 찬물 세탁.', fit: '여유로운 핏. 모델 186cm, M 사이즈 착용.',
      createdAt: '2026-08-05'
    },
    {
      id: 'lug-sole-boot', sku: 'EC-M-206', name: '러그 솔 부츠',
      gender: 'men', type: '슈즈', price: 215000, compareAt: null,
      image: 'assets/images/boots-men.jpg', colors: [{ name: '에스프레소', hex: '#4b3627' }],
      sizes: ['40', '41', '42', '43', '44'], stock: 10, rating: 4.8, reviewCount: 26, badge: null, isNew: false,
      description: '러그드 코만도 솔을 적용한 굿이어 웰트 가죽 부츠. 날씨와 오랜 시간을 견디도록 만들었습니다.',
      details: ['풀그레인 가죽', '굿이어 웰트', '코만도 솔'],
      composition: '가죽 갑피·안감, 고무 솔. 정기적으로 가죽 관리를 해주세요.', fit: '정사이즈. 평소 EU 사이즈를 선택하세요.',
      createdAt: '2026-09-11'
    },
    {
      id: 'suede-overshirt', sku: 'EC-M-207', name: '스웨이드 오버셔츠',
      gender: 'men', type: '아우터', price: 175000, compareAt: 210000,
      image: 'assets/images/overshirt.jpg', colors: [{ name: '코냑', hex: '#9a6440' }],
      sizes: ['S', 'M', 'L', 'XL'], stock: 7, rating: 4.6, reviewCount: 14, badge: null, isNew: false,
      description: '부드러운 고트 스웨이드로 만든 셔츠 자켓. 혼 버튼과 패치 포켓이 돋보이며, 오픈하거나 여며 입을 수 있습니다.',
      details: ['고트 스웨이드', '혼 버튼', '패치 포켓 2개'],
      composition: '고트 스웨이드 100%. 전문 가죽 클리닝 전용.', fit: '레귤러 핏. 모델 186cm, M 사이즈 착용.',
      createdAt: '2026-08-27'
    },
    {
      id: 'bauletto-top-handle-bag', sku: 'EC-A-301', name: '바울레토 탑핸들 백',
      gender: 'accessories', type: '가방', price: 245000, compareAt: null,
      image: 'assets/images/bag-red.jpg', colors: [{ name: '스칼렛', hex: '#b23a2f' }, { name: '코냑', hex: '#9a6440' }],
      sizes: ['원사이즈'], stock: 6, rating: 4.9, reviewCount: 33, badge: '신상품', isNew: true,
      description: '광택 있는 카프 가죽으로 만든 컴팩트 탑핸들 백. 스웨이드 안감과 탈착 가능한 스트랩이 포함됩니다.',
      details: ['광택 카프 가죽', '스웨이드 안감', '탈착 가능한 숄더 스트랩'],
      composition: '카프 가죽 외피, 스웨이드 안감. 더스트백에 보관하세요.', fit: '24 × 18 × 10cm. 핸들 드롭 9cm.',
      createdAt: '2026-10-22'
    },
    {
      id: 'woven-handle-bag', sku: 'EC-A-302', name: '우븐 핸들 백',
      gender: 'accessories', type: '가방', price: 265000, compareAt: 310000,
      image: 'assets/images/bag-orange.jpg', colors: [{ name: '앰버', hex: '#c47a44' }],
      sizes: ['원사이즈'], stock: 4, rating: 4.8, reviewCount: 17, badge: null, isNew: false,
      description: '손으로 엮은 가죽 핸들과 조각적인 실루엣. 이탈리아 피렌체의 작은 아틀리에에서 제작됩니다.',
      details: ['핸드우븐 가죽 핸들', '자석 잠금', '이탈리아 제조'],
      composition: '카프 가죽. 더스트백에 보관하세요.', fit: '26 × 20 × 12cm. 핸들 드롭 8cm.',
      createdAt: '2026-10-02'
    },
    {
      id: 'akoya-pearl-strand', sku: 'EC-A-303', name: '아코야 펄 스트랜드',
      gender: 'accessories', type: '주얼리', price: 145000, compareAt: null,
      image: 'assets/images/pearls.jpg', colors: [{ name: '펄', hex: '#f1e8d8' }],
      sizes: ['원사이즈'], stock: 13, rating: 4.9, reviewCount: 22, badge: null, isNew: false,
      description: '손으로 매듭지은 아코야 진주 목걸이. 스털링 실버 잠금장치로 마무리했습니다.',
      details: ['핸드매듭 아코야 진주', '스털링 실버 잠금장치', '45cm 길이'],
      composition: '양식 진주, 925 스털링 실버. 부드러운 천으로 닦아주세요.', fit: '45cm. 42cm로 조절 가능.',
      createdAt: '2026-09-06'
    },
    {
      id: 'meridian-automatic-watch', sku: 'EC-A-304', name: '메리디안 오토매틱 워치',
      gender: 'accessories', type: '시계', price: 320000, compareAt: null,
      image: 'assets/images/watch.jpg', colors: [{ name: '스틸', hex: '#b9bec2' }],
      sizes: ['원사이즈'], stock: 2, rating: 4.7, reviewCount: 11, badge: null, isNew: false,
      description: '선레이 다이얼과 사파이어 크리스탈, 브러시드 스틸 브레이슬릿을 갖춘 38mm 오토매틱 워치.',
      details: ['일본산 오토매틱 무브먼트', '사파이어 크리스탈', '38mm 브러시드 스틸 케이스'],
      composition: '316L 스테인리스 스틸. 5 ATM 생활 방수.', fit: '38mm 케이스. 손목 둘레 14–21cm.',
      createdAt: '2026-07-30'
    },
    {
      id: 'stacking-ring-set', sku: 'EC-A-305', name: '스태킹 링 세트',
      gender: 'accessories', type: '주얼리', price: 78000, compareAt: null,
      image: 'assets/images/rings.jpg', colors: [{ name: '골드', hex: '#c7a261' }],
      sizes: ['6', '7', '8'], stock: 18, rating: 4.5, reviewCount: 29, badge: null, isNew: false,
      description: '재생 14k 골드 버메일로 만든 세 개의 가는 밴드. 함께 또는 따로 착용할 수 있습니다.',
      details: ['3개 세트', '재생 14k 골드 버메일', '저자극 소재'],
      composition: '925 스털링 실버에 14k 골드 버메일 도금. 수영 전 분리하세요.', fit: 'US 6, 7, 8 사이즈.',
      createdAt: '2026-08-16'
    },
    {
      id: 'layered-pendant-necklace', sku: 'EC-A-306', name: '레이어드 펜던트 네클리스',
      gender: 'accessories', type: '주얼리', price: 68000, compareAt: 88000,
      image: 'assets/images/pendant.jpg', colors: [{ name: '골드', hex: '#c7a261' }],
      sizes: ['원사이즈'], stock: 16, rating: 4.6, reviewCount: 20, badge: null, isNew: false,
      description: '손으로 세팅한 프레시워터 펄 펜던트가 달린 섬세한 더블 체인 목걸이.',
      details: ['더블 파인 체인', '프레시워터 펄', '조절 가능한 잠금장치'],
      composition: '14k 골드 버메일, 프레시워터 펄. 평평하게 보관하세요.', fit: '38cm와 43cm 레이어.',
      createdAt: '2026-08-08'
    }
  ];

  var customerSeeds = [
    { id: 'c01', name: '박나연', email: 'nayeon.park@example.com', joined: '2025-04-12', segment: 'VIP' },
    { id: 'c02', name: '엘리아스 마이어', email: 'elias.meyer@example.com', joined: '2025-08-03', segment: 'Returning' },
    { id: 'c03', name: '김소라', email: 'sora.kim@example.com', joined: '2026-01-19', segment: 'VIP' },
    { id: 'c04', name: '아멜리아 하트', email: 'amelia.hart@example.com', joined: '2026-02-07', segment: 'Returning' },
    { id: 'c05', name: '요나스 베버', email: 'jonas.weber@example.com', joined: '2026-03-28', segment: 'New' },
    { id: 'c06', name: '클라라 모로', email: 'clara.moreau@example.com', joined: '2026-04-11', segment: 'Returning' },
    { id: 'c07', name: '테오 베넷', email: 'theo.bennett@example.com', joined: '2026-05-02', segment: 'New' },
    { id: 'c08', name: '최유나', email: 'yuna.choi@example.com', joined: '2026-05-30', segment: 'VIP' },
    { id: 'c09', name: '이자벨 로시', email: 'isabel.rossi@example.com', joined: '2026-06-17', segment: 'New' },
    { id: 'c10', name: '마커스 리드', email: 'marcus.reed@example.com', joined: '2026-07-04', segment: 'Returning' }
  ];

  var defaultSettings = {
    /* Brand ------------------------------------------------------------------ */
    siteName: 'To Lead',
    siteNameEn: 'TO LEAD',
    brandTagline: '서울에서 시작한, 오래 입는 옷.',
    logoImage: '',
    logoLightImage: '',
    logoMark: '',
    announcement: '₩150,000 이상 구매 시 무료 배송',
    announcementSide: '서울 · 뉴욕 · 파리',
    announcementRight: '고객센터',
    seoTitle: 'To Lead — 오래 입는 옷',
    seoDescription: 'To Lead는 자연 소재와 단정한 실루엣으로 오래 입을 수 있는 옷을 소량 제작합니다.',

    /* Navigation ------------------------------------------------------------- */
    navNew: '신상품',
    navWomen: '여성',
    navMen: '남성',
    navAccessories: '액세서리',
    navJournal: '저널',
    navStory: '브랜드 스토리',
    mobileNavNote: '서울 · 뉴욕 · 파리',

    /* Home — hero ------------------------------------------------------------ */
    heroEyebrow: 'FW26 — 더 조용한 옷장',
    heroTitle: '덜어낼수록,',
    heroItalic: '더 선명해집니다.',
    heroLede: '자연 소재와 단정한 실루엣, 계절이 지나도 변하지 않는 색. 소량으로 제작해 오래 입을 수 있도록 만들었습니다.',
    heroCta: '컬렉션 보기',
    heroSecondary: '룩북 살펴보기',
    heroCaptionLabel: '이번 시즌 추천',
    heroCaptionName: '아이리스 코튼 원피스',
    heroCaptionPrice: '₩189,000 — 지금 보기',
    heroProductId: 'iris-cotton-dress',
    heroImage: 'assets/images/hero.jpg',
    heroImageAlt: '돌계단 위에서 화이트 코튼 원피스를 입은 모델',
    heroScroll: '스크롤하여 만나보세요',

    /* Home — press ----------------------------------------------------------- */
    pressLabel: '함께 소개된 매체',
    press1: 'VOGUE',
    press2: 'Elle',
    press3: "HARPER'S BAZAAR",
    press4: 'GQ',
    press5: 'MONOCLE',

    /* Home — categories ------------------------------------------------------ */
    categoriesEyebrow: '01 — 둘러보기',
    categoriesTitle: '오래 입을 옷을 찾으세요.',
    categoriesNote: '하루의 모든 순간을 위한 단정한 옷. 유행이 아닌 옷장을 중심으로 구성했습니다.',
    categoriesCta: '전체 상품',
    catWomenTitle: '여성',
    catWomenMeta: '균형 잡힌 옷장',
    catWomenImage: 'assets/images/category-women.jpg',
    catWomenAlt: '아이보리 블라우스가 걸린 옷장',
    catMenTitle: '남성',
    catMenMeta: '조용한 테일러링',
    catMenImage: 'assets/images/category-men.jpg',
    catMenAlt: '화이트 헤비 코튼 티를 입은 남성',
    catAccTitle: '액세서리',
    catAccMeta: '마지막을 완성하는 오브제',
    catAccImage: 'assets/images/category-accessories.jpg',
    catAccAlt: '오렌지 컬러 우븐 레더 백',

    /* Home — new in ---------------------------------------------------------- */
    newEyebrow: '02 — 방금 도착한',
    newTitle: '신상품.',
    newCta: '신상품 전체 보기',

    /* Home — editorial ------------------------------------------------------- */
    editorialEyebrow: 'FW26 에디트',
    editorialTitle: '부드러운 구조,',
    editorialItalic: '조용한 확신.',
    editorialLede: '질감과 비율, 그리고 오래 곁에 남는 옷에 대한 탐구.',
    editorialCta: '에디트 쇼핑하기',
    editorialImage: 'assets/images/editorial.jpg',
    editorialAlt: '드라이 팜파스와 뉴트럴 컬러 의류가 걸린 랙',
    editorialIndex: 'FW26 / 03',

    /* Home — story ----------------------------------------------------------- */
    storyEyebrow: '04 — 우리의 방식',
    storyTitle: '더 적게, 더 좋게.',
    storyItalic: '의도적으로.',
    storyP1: '포르투갈, 이탈리아, 한국의 작은 메이커들과 함께 소량으로 제작합니다. 첫 착용부터 단정하고, 시간이 지날수록 더 좋아지는 옷을 만드는 것이 목표입니다.',
    storyP2: '자연 소재. 정직한 구조. 유행을 타지 않는 색.',
    storySignature: '— To Lead 스튜디오',
    storyImage: 'assets/images/story.jpg',
    storyAlt: '따뜻한 톤의 의류가 걸린 To Lead 스튜디오',
    storyStamp: '소량 제작\n2019년부터',
    storyStat1Value: '30',
    storyStat1Label: '시즌당 아이템',
    storyStat2Value: '12',
    storyStat2Label: '협업 메이커',
    storyStat3Value: '96%',
    storyStat3Label: '천연 소재',

    /* Home — values ---------------------------------------------------------- */
    value1Title: '천연 소재',
    value1Text: '울, 실크, 리넨, 유기농 코튼. 촉감과 시간에 따른 변화를 기준으로 고릅니다.',
    value2Title: '소량 생산',
    value2Text: '협업 아틀리에와 한정 수량으로 제작해 과잉 생산과 폐기를 줄입니다.',
    value3Title: '30일 반품',
    value3Text: '천천히 결정하세요. 배송 후 30일 이내 무료로 반품할 수 있습니다.',
    value4Title: '탄소중립 배송',
    value4Text: '모든 주문은 재생·재활용 포장재로 탄소중립 배송됩니다.',

    /* Home — newsletter ------------------------------------------------------ */
    newsletterEyebrow: '프라이빗 리스트',
    newsletterTitle: '조용한 리스트에',
    newsletterItalic: '함께하세요.',
    newsletterCopy: '신상품과 스튜디오 노트, 가끔의 초대를 가장 먼저 받아보세요. 한 달에 두 번을 넘지 않습니다.',
    newsletterButton: '구독하기',
    newsletterNote: '구독 시 개인정보 처리방침에 동의하게 됩니다. 언제든 해지할 수 있습니다.',
    newsletterSuccessTitle: '리스트에 등록되었습니다.',
    newsletterSuccessText: '스튜디오의 편지와 FW26 신상품 소식을 가장 먼저 보내드릴게요.',

    /* Footer ----------------------------------------------------------------- */
    footerBlurb: '소량으로 만든 단정한 옷과 오브제. 자주 입고 오래 간직할 수 있도록 디자인합니다.',
    socialInstagram: '인스타그램',
    socialPinterest: '핀터레스트',
    socialTikTok: '틱톡',
    footerShopTitle: '쇼핑',
    footerCareTitle: '고객 지원',
    footerStudioTitle: '스튜디오',
    footerContactTitle: '문의',
    footerShippingLabel: '배송 및 반품',
    footerSizeLabel: '사이즈 가이드',
    footerCareLabel: '관리 가이드',
    footerFaqLabel: '자주 묻는 질문',
    footerStoryLabel: '브랜드 스토리',
    footerJournalLabel: '저널',
    footerStockistsLabel: '판매처',
    footerCareersLabel: '채용',
    footerPrivacyLabel: '개인정보 처리방침',
    footerTermsLabel: '이용약관',
    footerAccessibilityLabel: '접근성',
    supportEmail: 'care@tolead.kr',
    supportPhone: '02-541-2019',
    contactAddress: '서울특별시 성동구 연무장길 42\nTo Lead 스튜디오',
    copyright: '© {year} To Lead. 모든 권리 보유.',

    /* Shop ------------------------------------------------------------------- */
    shopAllEyebrow: '컬렉션',
    shopAllTitle: '모든',
    shopAllItalic: '아이템.',
    shopAllDesc: '이번 시즌의 모든 아이템. 함께 입고 오래 간직할 수 있도록 디자인했습니다.',
    shopAllIndex: '03',
    shopNewEyebrow: '방금 도착한',
    shopNewTitle: '새로운',
    shopNewItalic: '도착.',
    shopNewDesc: '스튜디오 옷장에 가장 먼저 들어온 아이템. 한정 수량으로 제작했습니다.',
    shopNewIndex: '01',
    shopWomenEyebrow: '여성 에디트',
    shopWomenTitle: '조용히',
    shopWomenItalic: '선명하게.',
    shopWomenDesc: '유려한 테일러링과 부드러운 구조, 자연 소재로 일상을 위한 옷을 제안합니다.',
    shopWomenIndex: '04',
    shopMenEyebrow: '남성 에디트',
    shopMenTitle: '오래 입도록',
    shopMenItalic: '만들어진.',
    shopMenDesc: '정직한 소재와 편안한 테일러링. 더 많은 순간에 어울리는 옷장입니다.',
    shopMenIndex: '05',
    shopAccEyebrow: '마지막을 완성하는',
    shopAccTitle: '작은',
    shopAccItalic: '기쁨.',
    shopAccDesc: '가죽과 골드, 프레시워터 펄. 경쟁하지 않고 완성하는 오브제.',
    shopAccIndex: '06',
    shopSaleEyebrow: '아카이브',
    shopSaleTitle: '마지막',
    shopSaleItalic: '아이템.',
    shopSaleDesc: '지난 시즌의 마지막 수량을 조용한 가격으로. 사이즈는 한정되어 있습니다.',
    shopSaleIndex: '07',
    shopNoteEyebrow: '의도된 디자인',
    shopNoteText: '모든 아이템은 한정 수량으로 제작됩니다. 품절된 상품은 조용한 리스트에 가입하면 다음 드롭을 가장 먼저 만날 수 있습니다.',
    shopNoteCta: '리스트 가입하기',
    shopEmptyEyebrow: '아무것도 없습니다',
    shopEmptyTitle: '조건에 맞는 아이템이 없습니다.',
    shopEmptyText: '다른 카테고리를 선택하거나 검색어를 지워보세요. 전체 컬렉션은 언제나 가까이 있습니다.',
    shopEmptyCta: '전체 상품 보기',

    /* Product page ----------------------------------------------------------- */
    pdpBreadcrumbHome: '홈',
    pdpBreadcrumbCollection: '컬렉션',
    pdpGalleryLabel: '상품 이미지',
    pdpGalleryFull: '전체',
    pdpGalleryDetail: '디테일',
    pdpGalleryTexture: '질감',
    pdpGalleryNote: '스튜디오 이미지 · {sku}',
    pdpColourLabel: '컬러',
    pdpSizeLabel: '사이즈',
    pdpSizeGuideLink: '사이즈 가이드',
    pdpAddToBag: '쇼핑백에 담기',
    pdpSoldOut: '품절',
    pdpSelectSize: '사이즈 선택',
    pdpStockOut: '품절 — 조용한 리스트에 가입하면 다음 드롭을 가장 먼저 만날 수 있습니다',
    pdpStockSelect: '사이즈를 선택하면 쇼핑백에 담을 수 있습니다',
    pdpStockLow: '{count}개 남음 — 바로 발송 가능',
    pdpStockIn: '재고 있음 — 1–2 영업일 내 발송',
    pdpReviewsLink: '리뷰 {count}개',
    pdpSave: '{percent}% 할인',
    pdpSaveToWishlist: '위시리스트에 저장',
    pdpNotFoundTitle: '상품을 찾을 수 없습니다.',
    pdpNotFoundText: '아카이브로 이동되었을 수 있습니다. 나머지 컬렉션이 기다리고 있습니다.',
    pdpNotFoundCta: '컬렉션 둘러보기',
    pdpAssurance1: '{freeShipping} 이상 무료 배송',
    pdpAssurance2: '30일 무료 반품',
    pdpAssurance3: '탄소중립 포장 배송',
    pdpDetailsTitle: '상세 및 핏',
    pdpCareTitle: '소재 및 관리',
    pdpDeliveryTitle: '배송 및 반품',
    pdpDeliveryText: '주문 후 1–2 영업일 내 발송됩니다. {freeShipping} 이상 무료 배송, 그 외 배송비 {shippingFee}. 수령 후 30일 이내 미착용 상태로 반품 가능합니다. 문의: {email}',
    pdpDemoNote: '이 페이지는 프런트엔드 데모입니다. 상품 재고와 결제는 브라우저에서 시뮬레이션됩니다.',
    pdpSizeNote: '사이즈 사이에 계시다면 여유로운 핏을 위해 한 사이즈 업을 권장합니다. 개인 상담은 {email}로 문의해 주세요.',
    reviewsEyebrow: '리뷰',
    reviewsTitle: '입어보고 사랑한 옷.',
    reviewsWrite: '리뷰 작성하기',
    reviewsBasedOn: '리뷰 {count}개 기준',
    reviewVerified: '구매 인증',
    reviewCommunity: '커뮤니티 리뷰',
    reviewFormTitle: '당신의 생각을 들려주세요',
    reviewNameLabel: '이름',
    reviewRatingLabel: '평점',
    reviewTitleLabel: '한 줄 제목',
    reviewTextLabel: '리뷰 내용',
    reviewNamePlaceholder: '이름',
    reviewTitlePlaceholder: '짧은 한 줄 제목',
    reviewTextPlaceholder: '핏, 소재, 마감에 대해 들려주세요',
    reviewRating5: '5점 — 최고예요',
    reviewRating4: '4점 — 아주 좋아요',
    reviewRating3: '3점 — 좋아요',
    reviewRating2: '2점 — 보통이에요',
    reviewRating1: '1점 — 아쉬워요',
    reviewSubmit: '리뷰 등록',
    reviewNote: '리뷰는 데모를 위해 이 브라우저에 저장됩니다.',
    reviewThanks: '감사합니다 — 리뷰가 등록되었습니다.',
    relatedEyebrow: '이어서 둘러보기',
    relatedTitle: '함께 어울리는 아이템.',
    relatedCta: '전체 상품 보기',

    /* Commerce --------------------------------------------------------------- */
    freeShipping: 150000,
    shippingFee: 5000,
    currencyLabel: 'KRW ₩'
  };

  function mergeSettings(saved) {
    var merged = JSON.parse(JSON.stringify(defaultSettings));
    if (saved && typeof saved === 'object') {
      Object.keys(saved).forEach(function (key) {
        if (saved[key] !== undefined) merged[key] = saved[key];
      });
    }
    return merged;
  }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function isoDaysAgo(days) {
    var d = new Date();
    d.setHours(9 + (days % 8), 10 + (days % 40), 0, 0);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  }

  function generateOrders(list, customers) {
    var rand = mulberry32(7321);
    var statuses = ['Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Shipped', 'Shipped', 'Processing', 'Processing', 'Cancelled'];
    var orders = [];
    var totalOrders = 104;

    for (var i = 0; i < totalOrders; i++) {
      var daysAgo = Math.floor(Math.pow(rand(), 0.82) * 90);
      var customer = customers[Math.floor(rand() * customers.length)];
      var itemCount = rand() > 0.68 ? 2 : 1;
      var chosen = [];
      while (chosen.length < itemCount) {
        var candidate = list[Math.floor(rand() * list.length)];
        if (chosen.indexOf(candidate) === -1) chosen.push(candidate);
      }
      var items = chosen.map(function (p) {
        var qty = rand() > 0.88 ? 2 : 1;
        return {
          productId: p.id,
          name: p.name,
          size: p.sizes[Math.floor(rand() * p.sizes.length)],
          qty: qty,
          price: p.price
        };
      });
      var subtotal = items.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
      var status = statuses[Math.floor(rand() * statuses.length)];
      if (daysAgo < 2 && status === 'Delivered') status = 'Processing';
      var shipping = subtotal >= defaultSettings.freeShipping ? 0 : defaultSettings.shippingFee;
      orders.push({
        id: 'EC-' + (10420 + i),
        customer: { name: customer.name, email: customer.email },
        date: isoDaysAgo(daysAgo),
        items: items,
        subtotal: subtotal,
        shipping: shipping,
        total: subtotal + shipping,
        status: status,
        payment: status === 'Cancelled' ? 'Refunded' : 'Paid',
        channel: rand() > 0.76 ? 'Boutique' : 'Online'
      });
    }
    return orders.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  }

  function createSeed() {
    var seedCustomers = JSON.parse(JSON.stringify(customerSeeds));
    var seedProducts = JSON.parse(JSON.stringify(products));
    return {
      version: VERSION,
      products: seedProducts,
      orders: generateOrders(seedProducts, seedCustomers),
      customers: seedCustomers,
      reviews: {},
      settings: mergeSettings(),
      cart: [],
      wishlist: [],
      subscribers: ['hello@studio-north.com', 'mari@example.com'],
      user: null
    };
  }

  var memoryStore = null;

  function readStorage() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== VERSION) return null;
      parsed.settings = mergeSettings(parsed.settings);
      return parsed;
    } catch (err) {
      return memoryStore;
    }
  }

  var state = readStorage();

  if (!state) {
    state = createSeed();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (err) { memoryStore = state; }
  }

  function persist() {
    memoryStore = state;
    /* With Supabase connected, customer/order PII stays in Postgres: the
       localStorage mirror only caches the public storefront data. */
    var mirror = state;
    if (backendState.enabled) {
      mirror = Object.assign({}, state, { orders: [], customers: [] });
    }
    try { localStorage.setItem(KEY, JSON.stringify(mirror)); } catch (err) { /* memory fallback */ }
    document.dispatchEvent(new CustomEvent('ecru:change', { detail: { type: 'state' } }));
  }

  /* Backend ---------------------------------------------------------------
     Supabase is optional. Without config everything stays local; with config
     the store hydrates from Postgres and each admin/customer write is mirrored
     back. Writes are fire-and-forget so the synchronous window.ECRU API keeps
     working exactly as before; failures surface as `ecru:sync-error`. */
  var backend = window.ToLeadBackend || null;
  var backendState = {
    enabled: !!(backend && backend.enabled()),
    ready: false,
    error: null,
    syncError: null
  };

  function syncRemote(label, task) {
    if (!backendState.enabled) return;
    Promise.resolve().then(task).catch(function (err) {
      backendState.syncError = (err && err.message) || '알 수 없는 오류';
      document.dispatchEvent(new CustomEvent('ecru:sync-error', {
        detail: { label: label, message: backendState.syncError, status: err && err.status }
      }));
    });
  }

  function applyRemote(remote) {
    if (!remote) return;
    if (remote.products) state.products = remote.products;
    if (remote.customers) state.customers = remote.customers;
    if (remote.orders) state.orders = remote.orders;
    if (remote.reviews) state.reviews = remote.reviews;
    if (remote.subscribers) state.subscribers = remote.subscribers;
    if (remote.settings) state.settings = mergeSettings(remote.settings);
  }

  function refresh() {
    if (!backendState.enabled) return Promise.resolve(state);
    return backend.loadStore().then(function (remote) {
      applyRemote(remote);
      backendState.error = null;
      backendState.syncError = null;
      persist();
      document.dispatchEvent(new CustomEvent('ecru:ready', { detail: { mode: 'supabase', refresh: true } }));
      return state;
    });
  }

  var ready;
  if (backendState.enabled) {
    var seedOnEmpty = !(window.TOLEAD_CONFIG && window.TOLEAD_CONFIG.seedOnEmpty === false);
    ready = backend.loadStore().then(function (remote) {
      if (backend.isEmpty(remote) && seedOnEmpty) {
        return backend.resetStore(state).then(function () { return backend.loadStore(); });
      }
      return remote;
    }).then(function (remote) {
      applyRemote(remote);
      backendState.ready = true;
      backendState.error = null;
      persist();
      document.dispatchEvent(new CustomEvent('ecru:ready', { detail: { mode: 'supabase' } }));
      return state;
    }).catch(function (err) {
      backendState.ready = true;
      backendState.error = (err && err.message) || '알 수 없는 오류';
      document.dispatchEvent(new CustomEvent('ecru:ready', { detail: { mode: 'local', error: backendState.error } }));
      return state;
    });
  } else {
    ready = Promise.resolve(state);
  }

  function slugify(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function getProduct(id) {
    return state.products.filter(function (p) { return p.id === id; })[0] || null;
  }

  function getCart() {
    return state.cart.map(function (line) {
      var product = getProduct(line.productId);
      return {
        key: line.key,
        productId: line.productId,
        size: line.size,
        qty: line.qty,
        product: product
      };
    }).filter(function (line) { return line.product; });
  }

  function cartCount() {
    return state.cart.reduce(function (sum, line) { return sum + line.qty; }, 0);
  }

  function cartSubtotal() {
    return getCart().reduce(function (sum, line) { return sum + line.product.price * line.qty; }, 0);
  }

  function addToCart(productId, size, qty) {
    var product = getProduct(productId);
    if (!product) return { ok: false, message: '상품을 찾을 수 없습니다.' };
    if (product.stock < 1) return { ok: false, message: '현재 품절된 상품입니다.' };
    var validSize = product.sizes.indexOf(size) > -1 ? size : product.sizes[0];
    qty = clamp(Number(qty) || 1, 1, Math.max(1, product.stock));
    var key = productId + '::' + validSize;
    var existing = state.cart.filter(function (line) { return line.key === key; })[0];
    if (existing) {
      existing.qty = Math.min(product.stock, existing.qty + qty);
    } else {
      state.cart.push({ key: key, productId: productId, size: validSize, qty: qty });
    }
    persist();
    return { ok: true, size: validSize, product: product };
  }

  function setCartQty(key, qty) {
    var line = state.cart.filter(function (item) { return item.key === key; })[0];
    if (!line) return;
    var product = getProduct(line.productId);
    var max = product ? product.stock : 10;
    if (qty < 1) {
      state.cart = state.cart.filter(function (item) { return item.key !== key; });
    } else {
      line.qty = Math.min(qty, max);
    }
    persist();
  }

  function removeCartLine(key) {
    state.cart = state.cart.filter(function (line) { return line.key !== key; });
    persist();
  }

  function clearCart() {
    state.cart = [];
    persist();
  }

  function wishlist() {
    return state.wishlist.map(getProduct).filter(Boolean);
  }

  function isWishlisted(id) {
    return state.wishlist.indexOf(id) > -1;
  }

  function toggleWishlist(id) {
    var product = getProduct(id);
    if (!product) return { added: false };
    var index = state.wishlist.indexOf(id);
    if (index > -1) state.wishlist.splice(index, 1);
    else state.wishlist.push(id);
    persist();
    return { added: index === -1, product: product };
  }

  function updateSettings(patch) {
    Object.assign(state.settings, patch);
    persist();
    syncRemote('settings', function () { return backend.saveSettings(state.settings); });
    return state.settings;
  }

  function resetSettings() {
    state.settings = mergeSettings();
    persist();
    syncRemote('settings', function () { return backend.saveSettings(state.settings); });
    return state.settings;
  }

  function saveProduct(input) {
    var clean = {
      name: String(input.name || '').trim(),
      sku: String(input.sku || '').trim(),
      gender: input.gender || 'women',
      type: String(input.type || '기성복').trim(),
      price: Math.max(0, Number(input.price) || 0),
      compareAt: input.compareAt ? Math.max(0, Number(input.compareAt)) : null,
      image: input.image || 'assets/images/story.jpg',
      stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
      sizes: (Array.isArray(input.sizes) ? input.sizes : String(input.sizes || '원사이즈').split(','))
        .map(function (s) { return String(s).trim(); }).filter(Boolean),
      colors: Array.isArray(input.colors) && input.colors.length ? input.colors : [{ name: '내추럴', hex: '#cbb89d' }],
      description: String(input.description || '').trim(),
      details: Array.isArray(input.details) ? input.details : [],
      composition: input.composition || '관리 방법은 추후 안내됩니다.',
      fit: input.fit || '정사이즈입니다.',
      rating: Number(input.rating) || 4.7,
      reviewCount: Number(input.reviewCount) || 0,
      badge: input.badge || null,
      isNew: !!input.isNew,
      createdAt: input.createdAt || new Date().toISOString().slice(0, 10)
    };
    if (!clean.name) return { ok: false, message: '상품명을 입력해 주세요.' };
    if (!clean.sizes.length) clean.sizes = ['원사이즈'];
    if (input.id) {
      var existing = getProduct(input.id);
      if (!existing) return { ok: false, message: '상품을 찾을 수 없습니다.' };
      Object.assign(existing, clean);
      persist();
      syncRemote('product', function () { return backend.saveProduct(existing); });
      return { ok: true, product: existing };
    }
    var baseId = slugify(clean.sku) || slugify(clean.name) || ('product-' + Date.now());
    var id = baseId;
    var i = 2;
    while (getProduct(id)) { id = baseId + '-' + i; i += 1; }
    var product = Object.assign({ id: id }, clean);
    state.products.unshift(product);
    persist();
    syncRemote('product', function () { return backend.saveProduct(product); });
    return { ok: true, product: product };
  }

  function deleteProduct(id) {
    state.products = state.products.filter(function (p) { return p.id !== id; });
    state.cart = state.cart.filter(function (line) { return line.productId !== id; });
    state.wishlist = state.wishlist.filter(function (wish) { return wish !== id; });
    persist();
    syncRemote('product-delete', function () { return backend.deleteProduct(id); });
  }

  function getReviews(productId) {
    var product = getProduct(productId);
    var custom = (state.reviews[productId] || []);
    var templates = [
      { name: '김민아', rating: 5, title: '오래 입을 가치가 있어요', text: '원단에 무게감이 있고 마감이 정말 깔끔합니다. 요즘 가장 자주 손이 가는 옷이 되었어요.', date: '3주 전', verified: true },
      { name: '이엘리아', rating: 5, title: '세심하게 만든 옷', text: '사진과 똑같아요. 과하지 않게 예쁜 핏이고 색도 가진 옷들과 잘 어울립니다.', date: '1개월 전', verified: true },
      { name: '박소라', rating: 4, title: '예뻐요, 살짝 크게 나와요', text: '품질과 포장이 모두 좋았어요. 한 사이즈 줄여서 입으니 딱 맞습니다. 다시 구매하고 싶어요.', date: '2개월 전', verified: true }
    ];
    if (product && product.rating >= 4.9) templates[2].rating = 5;
    return custom.concat(templates);
  }

  function addReview(productId, review) {
    if (!getProduct(productId)) return { ok: false };
    var entry = {
      id: 'review-' + Date.now(),
      name: String(review.name || '익명').trim() || '익명',
      rating: clamp(Number(review.rating) || 5, 1, 5),
      title: String(review.title || '새로운 애정템').trim(),
      text: String(review.text || '').trim(),
      date: '방금 전',
      verified: false
    };
    if (!state.reviews[productId]) state.reviews[productId] = [];
    state.reviews[productId].unshift(entry);
    persist();
    syncRemote('review', function () { return backend.addReview(productId, entry); });
    return { ok: true, review: entry };
  }

  function subscribe(email) {
    var clean = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return { ok: false, message: '올바른 이메일 주소를 입력해 주세요.' };
    if (state.subscribers.indexOf(clean) === -1) state.subscribers.push(clean);
    persist();
    syncRemote('subscribe', function () { return backend.subscribe(clean); });
    return { ok: true };
  }

  function checkout(payload) {
    var lines = getCart();
    if (!lines.length) return { ok: false, message: '장바구니가 비어 있습니다.' };
    var outOfStock = lines.filter(function (line) { return line.qty > line.product.stock; });
    if (outOfStock.length) return { ok: false, message: '일부 상품의 재고가 부족합니다. 수량을 확인해 주세요.' };
    var email = String(payload && payload.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: '올바른 이메일 주소를 입력해 주세요.' };
    var name = String(payload && payload.name || '').trim() || email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    var subtotal = cartSubtotal();
    var shipping = subtotal >= state.settings.freeShipping ? 0 : (state.settings.shippingFee || 5000);
    var prefix = 10420;
    state.orders.forEach(function (order) {
      var numeric = Number(String(order.id).replace(/\D/g, ''));
      if (numeric > prefix) prefix = numeric;
    });
    var order = {
      id: 'EC-' + (prefix + 1),
      customer: { name: name, email: email },
      date: new Date().toISOString(),
      items: lines.map(function (line) {
        return { productId: line.productId, name: line.product.name, size: line.size, qty: line.qty, price: line.product.price };
      }),
      subtotal: subtotal,
      shipping: shipping,
      total: subtotal + shipping,
      status: 'Processing',
      payment: 'Paid',
      channel: 'Online'
    };
    lines.forEach(function (line) {
      var product = getProduct(line.productId);
      if (product) product.stock = Math.max(0, product.stock - line.qty);
    });
    var customer = state.customers.filter(function (c) { return c.email === email; })[0];
    if (!customer) {
      state.customers.unshift({ id: 'c' + Date.now(), name: name, email: email, joined: new Date().toISOString().slice(0, 10), segment: 'New' });
    }
    state.orders.unshift(order);
    state.cart = [];
    persist();
    syncRemote('checkout', function () { return backend.placeOrder(order); });
    return { ok: true, order: order };
  }

  function updateOrderStatus(id, status) {
    var order = state.orders.filter(function (o) { return o.id === id; })[0];
    if (!order) return { ok: false };
    order.status = status;
    order.payment = status === 'Cancelled' ? 'Refunded' : (order.payment === 'Refunded' ? 'Paid' : order.payment);
    persist();
    syncRemote('order-status', function () {
      return backend.updateOrder(id, { status: order.status, payment: order.payment });
    });
    return { ok: true, order: order };
  }

  function stats(days) {
    days = Number(days) || 30;
    var now = Date.now();
    var cutoff = now - days * 86400000;
    var prevCutoff = cutoff - days * 86400000;
    function inRange(order, from, to) {
      var time = new Date(order.date).getTime();
      return time >= from && time <= to;
    }
    function summarize(list) {
      var active = list.filter(function (o) { return o.status !== 'Cancelled'; });
      var revenue = active.reduce(function (sum, o) { return sum + o.total; }, 0);
      var orders = active.length;
      var units = active.reduce(function (sum, o) {
        return sum + o.items.reduce(function (n, item) { return n + item.qty; }, 0);
      }, 0);
      return { revenue: revenue, orders: orders, units: units, aov: orders ? revenue / orders : 0 };
    }
    var current = summarize(state.orders.filter(function (o) { return inRange(o, cutoff, now); }));
    var previous = summarize(state.orders.filter(function (o) { return inRange(o, prevCutoff, cutoff); }));
    function delta(a, b) { return b ? ((a - b) / b) * 100 : 0; }
    current.deltaRevenue = delta(current.revenue, previous.revenue);
    current.deltaOrders = delta(current.orders, previous.orders);
    current.deltaAov = delta(current.aov, previous.aov);
    current.deltaUnits = delta(current.units, previous.units);

    var daily = [];
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    for (var i = 0; i < days; i++) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      daily.push({ date: d, revenue: 0, orders: 0 });
    }
    var index = {};
    daily.forEach(function (entry) { index[entry.date.toISOString().slice(0, 10)] = entry; });
    state.orders.forEach(function (order) {
      if (order.status === 'Cancelled') return;
      var key = new Date(order.date).toISOString().slice(0, 10);
      if (index[key]) {
        index[key].revenue += order.total;
        index[key].orders += 1;
      }
    });
    current.daily = daily;

    var productMap = {};
    state.orders.forEach(function (order) {
      if (order.status === 'Cancelled' || !inRange(order, cutoff, now)) return;
      order.items.forEach(function (item) {
        if (!productMap[item.productId]) productMap[item.productId] = { productId: item.productId, name: item.name, units: 0, revenue: 0 };
        productMap[item.productId].units += item.qty;
        productMap[item.productId].revenue += item.qty * item.price;
      });
    });
    current.topProducts = Object.keys(productMap).map(function (key) { return productMap[key]; })
      .sort(function (a, b) { return b.revenue - a.revenue; }).slice(0, 5);
    current.previous = previous;
    return current;
  }

  function exportData() {
    return JSON.stringify(state, null, 2);
  }

  function reset() {
    state = createSeed();
    persist();
    syncRemote('reset', function () { return backend.resetStore(state); });
    return state;
  }

  function signIn(email, password) {
    if (String(email).trim().toLowerCase() === 'demo@tolead.kr' && password === 'demo1234') {
      state.user = { name: '박나연', email: 'demo@tolead.kr' };
      persist();
      return { ok: true, user: state.user };
    }
    return { ok: false, message: '데모 계정 정보와 일치하지 않습니다.' };
  }

  function signOut() {
    state.user = null;
    persist();
  }

  var api = {
    state: function () { return state; },
    ready: ready,
    refresh: refresh,
    backendStatus: function () {
      return {
        enabled: backendState.enabled,
        ready: backendState.ready,
        mode: !backendState.enabled ? 'local' : (backendState.error ? 'offline' : 'supabase'),
        error: backendState.error,
        lastSyncError: backendState.syncError,
        authenticated: !!(backend && backend.isAuthenticated()),
        email: backend ? backend.userEmail() : null
      };
    },
    adminSignIn: function (email, password) {
      if (!backendState.enabled) return Promise.resolve({ ok: false, message: 'local' });
      return backend.signIn(email, password);
    },
    adminSignOut: function () {
      return backend ? backend.signOut() : Promise.resolve();
    },
    products: function () { return state.products.slice(); },
    getProduct: getProduct,
    getCart: getCart,
    cartCount: cartCount,
    cartSubtotal: cartSubtotal,
    addToCart: addToCart,
    setCartQty: setCartQty,
    removeCartLine: removeCartLine,
    clearCart: clearCart,
    wishlist: wishlist,
    isWishlisted: isWishlisted,
    toggleWishlist: toggleWishlist,
    getSettings: function () { return state.settings; },
    updateSettings: updateSettings,
    resetSettings: resetSettings,
    saveProduct: saveProduct,
    deleteProduct: deleteProduct,
    getReviews: getReviews,
    addReview: addReview,
    subscribe: subscribe,
    checkout: checkout,
    orders: function () { return state.orders.slice(); },
    customers: function () { return state.customers.slice(); },
    updateOrderStatus: updateOrderStatus,
    stats: stats,
    exportData: exportData,
    reset: reset,
    signIn: signIn,
    signOut: signOut,
    user: function () { return state.user; },
    money: function (n) { return moneyFmt.format(Number(n) || 0); },
    formatDate: function (date, opts) {
      return new Intl.DateTimeFormat('ko-KR', opts || { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date));
    },
    formatDateTime: function (date) {
      return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date));
    },
    slugify: slugify
  };

  window.ECRU = api;
})();
