# To Lead — 패션 스토어 데모 (정적 프런트엔드 + Supabase 백엔드)

프런트엔드는 HTML, CSS, 바닐라 JavaScript만 사용하며 빌드 단계와 런타임 의존성이 없습니다. 기본 상태에서는 모든 데이터가 `localStorage`에 저장되어 서버 없이 전체 흐름을 살펴볼 수 있고, `assets/js/config.js`에 Supabase 프로젝트 값을 넣으면 상품·고객·주문·계정·리뷰·콘텐츠가 Postgres에 저장되는 실제 백엔드로 전환됩니다. 관리자에서 수정한 내용은 즉시 데이터베이스에 기록됩니다.

비주얼 방향은 따뜻한 에디토리얼 미니멀리즘입니다. 크림 페이퍼 톤, 세리프 디스플레이 타이포그래피, 스크립트 로고 워드마크, 그리고 충분한 여백을 사용합니다.

---

## 실행 방법

**방법 A — 파일 직접 열기**

`index.html`을 브라우저에서 바로 열면 됩니다. 클래식(비모듈) 스크립트로 작성되어 `file://`에서도 동작합니다.

**방법 B — 로컬 서버 (권장)**

이 폴더에서:

```bash
npx serve .
# 또는
python -m http.server 4173
```

그다음 `http://localhost:4173`을 방문합니다.

> 로컬 서버가 실제 서비스 환경에 더 가깝고, 파일 직접 열기 시 발생할 수 있는 저장소·fetch 제약을 피할 수 있습니다.

---

## 데모 계정

| 영역 | 아이디 | 비밀번호 |
| --- | --- | --- |
| 스토어프런트 계정 | `demo@tolead.kr` | `demo1234` |
| 관리자 스튜디오 | `admin` | `admin` |

관리자 계정은 Supabase가 설정되지 않았을 때 데모용으로 코드에 하드코딩되어 있으며 로그인 화면에 미리 입력되어 있습니다. **실제 서비스에는 절대 그대로 사용하지 마세요.** Supabase를 연결하면 Supabase Auth에 만든 관리자 이메일/비밀번호로 로그인합니다.

---

## Supabase 백엔드

GitHub Pages 같은 정적 호스팅을 그대로 유지하면서 Supabase(관리형 Postgres + REST + Auth)를 백엔드로 사용합니다. 서버 코드를 따로 배포할 필요가 없습니다.

### 1. 프로젝트 만들기

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다(무료 플랜으로 충분).
2. **Project Settings → API**에서 **Project URL**과 **anon / public** 키를 복사합니다.
3. `assets/js/config.js`에 입력합니다:

```js
window.TOLEAD_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT-ref.supabase.co',
  supabaseAnonKey: 'eyJhbGciOi...공개 anon 키...',
  storeId: 'main',
  seedOnEmpty: true
};
```

> anon 키는 RLS가 켜져 있으면 공개되어도 됩니다. **service_role 키는 절대 커밋하지 마세요.**

### 2. 스키마와 시드

가장 간단한 방법은 Supabase Dashboard → **SQL Editor**에서 `supabase/setup.sql`을 한 번 실행하는 것입니다. 이 파일은 스키마와 데모 데이터를 모두 포함합니다.

개별 실행을 원하면 순서대로:

1. `supabase/schema.sql` — 테이블, 트리거, 뷰, RLS 정책, 체크아웃 RPC.
2. `supabase/seed.sql` — 데모 상품 21개, 고객 10명, 주문 104건, 콘텐츠 설정을 그대로 이식합니다. (선택)

`seedOnEmpty: true`이면 스키마만 있고 데이터가 전혀 없는 DB에서 첫 방문 시 번들 데모를 넣으려고 시도합니다. RLS가 켜진 상태에서는 인증된 세션 또는 `demo-policies.sql`이 필요하므로, 보통은 `setup.sql`로 시드까지 함께 넣는 편이 확실합니다. 빈 스토어로 시작하려면 `seedOnEmpty`를 `false`로 바꾸세요.

| 테이블 | 용도 |
| --- | --- |
| `products` | 상품, 색상(jsonb), 사이즈(text[]), 재고, 이미지 |
| `customers` | 고객 프로필 + `order_count`, `total_spent`, `last_order_at` |
| `accounts` | Supabase Auth 사용자와 고객 프로필/역할을 연결. 관리자 로그인 시 프로필이 자동으로 upsert됩니다. |
| `orders` / `order_items` | 주문과 주문 상품(가격·수량·사이즈 스냅샷) |
| `reviews` | 상품 리뷰 |
| `settings` | 스토어프런트 콘텐츠 208개 필드 |
| `subscribers` | 뉴스레터 구독자 |

고객의 구매 이력과 누적 구매액은 `orders` 트리거가 `customers.total_spent` / `order_count` / `last_order_at`에 자동 반영하며, `customer_purchase_history` 뷰에서 주문별 상품 내역을 바로 조회할 수 있습니다.

### 3. 관리자 인증

- Supabase Dashboard → **Authentication → Users → Add user**로 관리자 이메일과 비밀번호를 만듭니다(**Auto Confirm** 선택).
- `admin.html`에서 그 이메일/비밀번호로 로그인하면 RLS를 통과해 주문·고객을 읽고 모든 변경을 DB에 쓸 수 있습니다.
- 공개 데모에서 기존 `admin / admin` 로그인으로도 DB에 쓰려면 `supabase/demo-policies.sql`을 실행합니다. ⚠ anon 키를 가진 누구나 읽고 쓸 수 있으므로 **데모 프로젝트 전용**입니다. 출시 전에는 `supabase/production-policies.sql`로 되돌리세요.

### 4. 동작 방식

- `window.ECRU`의 동기 API는 그대로 유지됩니다. `ECRU.ready`(Promise)가 DB 하이드레이션 완료 시점을 알려주고, 페이지 스크립트는 `ecru:ready` 이벤트에서 다시 렌더링합니다.
- 관리자 저장(콘텐츠·상품·주문 상태·리뷰·구독)은 즉시 Postgres로 전송됩니다. 실패하면 `ecru:sync-error` 이벤트로 토스트에 안내합니다.
- 체크아웃은 `place_order` RPC가 서버의 가격과 재고를 다시 검증한 뒤 주문·주문 상품·재고 차감을 한 트랜잭션으로 처리합니다.
- Supabase가 설정되지 않았거나 네트워크가 끊기면 자동으로 `localStorage` 폴백으로 동작합니다.

### 5. 비용과 확장

무료 플랜은 데모·소규모 트래픽에 충분합니다. 트래픽이 늘면 Supabase 유료 플랜으로 올리거나 동일한 Postgres를 다른 호스트로 이전할 수 있습니다. 스키마는 표준 Postgres이므로 데이터 이전이 어렵지 않고, 읽기 부하가 커지면 인덱스·캐시·읽기 복제본을 추가하면 됩니다. 이미지 업로드는 현재 브라우저에서 압축한 data URL로 저장되므로, 상품 사진이 많아지면 Supabase Storage나 CDN으로 옮기는 것을 권장합니다.

---

## GitHub Pages 배포

1. 저장소 **Settings → Pages**에서 Source를 **Deploy from a branch**, 브랜치를 `main`, 폴더를 **/(root)**로 지정합니다.
2. 잠시 후 `https://animefordaysXD.github.io/ShoppingMallWeb/`에서 열립니다.
3. 빌드 단계가 없으므로 `main`에 푸시하면 그대로 반영됩니다. `assets/js/config.js`의 Supabase 값도 함께 배포되며, anon 키는 RLS 전제로 공개해도 됩니다.
4. `admin.html`은 `noindex`이며 정적 페이지입니다. 실제 운영에서는 Supabase Auth 관리자 계정과 `production-policies.sql`을 사용하세요.

---

## 페이지

| 파일 | 역할 |
| --- | --- |
| `index.html` | 랜딩 페이지: 히어로, 프레스 로고 줄, 카테고리 카드, 신상품, 에디토리얼 밴드, 브랜드 스토리, 가치, 뉴스레터. |
| `shop.html` | 컬렉션 목록: 카테고리/타입 필터, 정렬, 검색어 및 URL 상태 지원. |
| `product.html` | 상품 상세: 갤러리 뷰, 컬러/사이즈 선택, 수량, 쇼핑백 담기, 위시리스트, 아코디언, 리뷰, 관련 상품, 모바일 구매 바. |
| `admin.html` | 관리자 스튜디오: 개요, 주문, 상품, 고객, 콘텐츠, 설정. |

공통 크롬(헤더, 푸터, 쇼핑백 드로어, 위시리스트 드로어, 검색 오버레이, 퀵애드, 계정 모달, 체크아웃 모달)은 `assets/js/ui.js`가 주입하므로 모든 스토어프런트 페이지가 일관되게 유지됩니다.

---

## 구현된 기능

**스토어프런트**
- 여성·남성·액세서리 21개 상품. 재고, 평점, 배지, 컬러/사이즈 옵션 포함.
- 수량 변경, 무료 배송 기준(₩150,000), 배송비(₩5,000), 체크아웃 시뮬레이션이 있는 쇼핑백.
- 주문 번호가 생성되는 주문 확인 화면. 주문은 즉시 관리자에 반영됩니다.
- 체크아웃 후에도 유지되는 위시리스트.
- 상품 검색 오버레이와 컬렉션 검색.
- 별점 입력과 작성 폼이 있는 상품 리뷰.
- 뉴스레터 구독.
- 데모 로그인/로그아웃과 미리 채워진 체크아웃 흐름.
- 반응형 레이아웃, 모바일 내비게이션, 모션 감소 설정 지원, 다이얼로그 포커스 관리와 키보드 처리.

**관리자**
- `sessionStorage` 세션(`tolead.admin`) 기반 로그인 게이트와 로그아웃. Supabase 설정 시 Supabase Auth로 인증합니다.
- **개요** — 매출/주문/평균 주문 금액/판매 수량 KPI, 이전 기간 대비, 스파크라인, 일별 매출 차트, 인기 상품, 최근 주문, 재고 부족 목록.
- **주문** — 상태 필터, 검색, CSV 내려받기, 주문 상세 모달, 상태 변경(대시보드 통계에 반영).
- **상품** — 필터, 상품명/SKU 검색, 사이즈/컬러/이미지/재고를 포함한 추가·수정·삭제, 확인 모달. 이미지 업로드 시 브라우저에서 자동 압축.
- **고객** — 등급 통계, 검색, 고객 프로필 모달, CSV 내려받기.
- **콘텐츠** — 스토어프런트에 보이는 모든 문구와 이미지를 스키마 기반 폼으로 수정. 15개 그룹, 208개 필드, 9개 이미지 슬롯. 로고 이미지, 히어로, 프레스, 카테고리, 신상품, 에디토리얼, 스토리, 가치, 뉴스레터, 푸터, 컬렉션 페이지, 상품 페이지, 커머스 설정을 모두 포함합니다. 히어로 실시간 미리보기와 기본값 복원 기능이 있습니다.
- **설정** — 스토어/고객센터 정보, 데이터 저장소(Supabase/localStorage) 상태, 데이터 내려받기(JSON/CSV), 데모 전체 초기화.
- 관리자 변경 사항의 Supabase write-through 저장(콘텐츠, 상품, 주문 상태, 리뷰, 구독자, 재고)과 실패 시 동기화 오류 안내.
- 주문·상품·고객 통합 검색(상단 검색창에서 **Enter**).
- 알림 패널, 모바일 사이드바, 토스트, 접근성 있는 모달.

---

## 구조

```
ShoppingMallWeb/
├── index.html              랜딩 페이지
├── shop.html               컬렉션 페이지
├── product.html            상품 상세 페이지
├── admin.html              관리자 스튜디오
├── assets/
│   ├── favicon.svg
│   ├── css/
│   │   ├── base.css        토큰, 리셋, 공통 컴포넌트
│   │   ├── home.css        랜딩 페이지
│   │   ├── shop.css        컬렉션 페이지
│   │   ├── product.css     상품 페이지
│   │   └── admin.css       관리자 스튜디오
│   ├── images/             로컬 데모 사진
│   └── js/
│       ├── config.js       Supabase URL/anon key 설정 (비어 있으면 로컬 데모)
│       ├── backend.js      Supabase REST/Auth 어댑터, 행↔앱 데이터 매핑
│       ├── store.js        데이터 계층: 카탈로그, 장바구니, 주문, 리뷰, 설정, 통계
│       ├── ui.js           공통 헤더/푸터, 드로어, 모달, 체크아웃
│       ├── home.js         랜딩 동작
│       ├── shop.js         필터, 정렬, 검색
│       ├── product.js      PDP 동작
│       └── admin.js        관리자 셸, 라우팅, 모든 뷰
├── supabase/
│   ├── setup.sql           스키마 + 시드 한 번에 실행 (권장)
│   ├── schema.sql          테이블·트리거·뷰·RLS·체크아웃 RPC
│   ├── seed.sql            데모 데이터 이식용 SQL
│   ├── demo-policies.sql   공개 데모용 anon 쓰기 정책 (선택)
│   ├── production-policies.sql  데모 정책 제거
│   └── generate-seed.mjs   seed.sql 재생성 스크립트
└── README.md
```

### 데이터 모델

`store.js`는 `window.ECRU`에 작은 API를 노출합니다:

- `products()`, `getProduct(id)`, `saveProduct(input)`, `deleteProduct(id)`
- `getCart()`, `addToCart()`, `setCartQty()`, `removeCartLine()`, `clearCart()`
- `wishlist()`, `toggleWishlist()`, `isWishlisted()`
- `getReviews()`, `addReview()`, `subscribe()`
- `checkout(payload)`, `orders()`, `updateOrderStatus()`, `customers()`
- `getSettings()`, `updateSettings()`, `resetSettings()`, `stats()`, `exportData()`, `reset()`
- `signIn()`, `signOut()`, `user()`
- `ready` (Promise), `refresh()`, `backendStatus()`, `adminSignIn()`, `adminSignOut()` — Supabase 연결/인증
- `money()`, `formatDate()`, `formatDateTime()`, `slugify()`

저장 방식:

- 저장 키: `tolead.store.v1` (오프라인 캐시/폴백)
- 시드 버전: `5`
- 시드는 오늘을 기준으로 104개의 데모 주문을 결정론적으로 생성하므로 차트가 항상 채워져 있습니다.
- 관리자 세션 키: `sessionStorage.tolead.admin`, Supabase 세션: `localStorage.tolead.auth.v1`
- Supabase가 설정되면 `ecru:ready` 시점에 상품·고객·주문·리뷰·설정·구독자를 DB에서 덮어쓰고, 이후 변경은 write-through로 DB에 저장합니다. 장바구니·위시리스트는 기기별 로컬 상태로 유지됩니다.
- `localStorage`를 사용할 수 없으면 현재 페이지 동안 메모리 객체로 대체됩니다.
- 통화는 KRW(`ko-KR`) 기준이며 가격은 원 단위입니다.

---

## 디자인 노트

- 타입: **Fraunces / Noto Serif KR** (디스플레이, 이탤릭 포함) + **Manrope / Noto Sans KR** (UI 및 본문) + **Pinyon Script** (To Lead 워드마크). Google Fonts에서 로드합니다.
- 핵심 토큰은 `assets/css/base.css` 상단에 있습니다. 색상, 간격, 모서리, 타입 스케일, 모션을 여기서 바꾸면 전체 브랜드가 변경됩니다.
- 로고는 관리자 **콘텐츠 → 브랜드 & SEO**에서 이미지를 업로드하면 헤더/푸터/파비콘에 반영됩니다. 이미지가 없으면 스크립트 워드마크 “To Lead”가 대체 표시됩니다.
- 사진은 `assets/images/`에 로컬 저장되어 있습니다(Unsplash/Pexels 데모 이미지). 실제 서비스 전에는 라이선스가 있는 브랜드 사진으로 교체하세요.
- 이 저장소는 사이트 소스만 포함합니다. 루트의 `index.html`을 바로 열거나 GitHub Pages 같은 정적 호스팅에 그대로 배포할 수 있습니다.

---

## 실제 서비스 전 연결할 항목

프런트엔드는 각 데모 경계가 실제 연동 지점에 대응하도록 구성되어 있습니다:

1. **API / 데이터 계층** — 기본 Supabase REST 어댑터가 포함되어 있습니다. 더 큰 트래픽에서는 `assets/js/backend.js`를 서버리스 함수나 전용 API로 옮기고 `window.ECRU` 인터페이스를 유지하세요.
2. **데이터베이스 및 서버 저장** — 상품·고객·계정·주문은 Supabase Postgres에 저장됩니다. 장바구니·위시리스트·최근 본 상품은 기기별 로컬 상태이므로, 로그인 계정과 동기화하려면 `accounts` 테이블과 Auth를 연결하세요.
3. **인증 및 권한** — 관리자는 Supabase Auth 세션과 RLS로 보호됩니다. 하드코딩된 `admin`/`admin`은 Supabase 미설정 시의 로컬 데모 전용이며, 공개 데모에서 `demo-policies.sql`을 실행했다면 출시 전 반드시 제거하세요.
4. **결제** — 토스페이먼츠·포트원·Stripe 등의 결제 인텐트, 간편결제, 서버 측 금액 계산, 부가세 계산, 웹훅 기반 주문 생성.
5. **배송 및 풀필먼트** — 배송비 계산, 주소 검증, 운송장 링크, 택배사 연동, 반품 흐름.
6. **재고** — 실시간 재고 예약, 사이즈별 가용 수량, 재고 부족 알림, 재입고 알림, 결제 시 초과 판매 방지.
7. **이메일** — 주문 확인·배송 안내·비밀번호 재설정 등 트랜잭션 메일, 뉴스레터 동기화(예: Klaviyo/Mailchimp), 수신 거부 처리.
8. **미디어** — 상품 이미지 업로드, 상품당 여러 이미지, CDN 전송, 반응형 `srcset`/AVIF/WebP, 동영상.
9. **검색** — 오타 허용, 패싯, 동의어, 검색 분석을 위한 Algolia/Typesense/Elasticsearch 도입. 현재의 클라이언트 필터를 교체합니다.
10. **리뷰** — 구매 인증 확인, 검수 대기열, 포토 리뷰, 스팸 방지.
11. **관리자 보안 강화** — 서버에서 강제되는 권한, CSRF 보호, 입력 검증, 요청 제한, 실제 파일 업로드, 활동 로그.
12. **분석 및 동의** — GA4 또는 프라이버시 친화적 대안, 이커머스 이벤트(`view_item`, `add_to_cart`, `purchase`), 쿠키 동의 배너.
13. **SEO 및 성능** — 상품/컬렉션 페이지의 SSR 또는 정적 생성, 표준 URL, 구조화 데이터(`Product`, `Offer`, `BreadcrumbList`), 사이트맵, robots, 이미지 최적화.
14. **현지화** — 다중 통화, 사이즈 체계 변환, 번역 콘텐츠, 로케일 기반 포맷팅.
15. **운영** — 오류 모니터링(Sentry), 가동 시간 점검, 백업, 개인정보 처리방침/이용약관/쿠키 페이지, WCAG 2.2 AA 기준 접근성 감사.

현재 데모에서 제거하거나 교체해야 할 단축 요소: 시드 주문/고객 데이터, 시뮬레이션 체크아웃, 미리 채워진 계정, 소셜·법적 링크의 `data-soon` 플레이스홀더, 브라우저 전용 관리자 세션.

---

## 데모 초기화

관리자 → **설정** → **전체 초기화**. Supabase가 연결되어 있으면 데이터베이스의 상품·주문·고객·리뷰와 콘텐츠도 함께 초기화됩니다(관리자 인증/데모 정책 필요). 로컬 모드에서는 아무 페이지의 브라우저 콘솔에서:

```js
localStorage.removeItem('tolead.store.v1');
location.reload();
```

시드 자체를 바꾸려면 `assets/js/store.js`의 `createSeed()`를 수정하고 `VERSION`을 올린 뒤, `node supabase/generate-seed.mjs`로 SQL 시드를 다시 생성하세요.
