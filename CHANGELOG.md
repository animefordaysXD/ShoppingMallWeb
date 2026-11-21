# 변경 사항 요약 — To Lead

> ÉCRU 데모를 **To Lead** 브랜드의 한국어 패션 스토어로 리브랜딩하고, 관리자에서 스토어프런트 전체를 편집할 수 있도록 확장한 작업 기록입니다.
>
> - 작업일: 2026-11-21
> - 저장소: <https://github.com/animefordaysXD/ShoppingMallWeb>
> - 성격: 프런트엔드 전용 데모 (HTML / CSS / Vanilla JS, 빌드 도구 없음)

---

## 1. 브랜드 리브랜딩

- 사이트 이름을 **ÉCRU → To Lead**로 전면 교체했습니다.
  - 브라우저 제목, SEO 메타 설명, 헤더·푸터·모바일 메뉴, 관리자 타이틀
  - 파비콘을 TL 모노그램 SVG로 교체 (`assets/favicon.svg`)
- 로고는 다음 우선순위로 표시됩니다.
  1. 관리자에서 업로드한 로고 이미지 (`logoImage`, `logoLightImage`, `logoMark`)
  2. 이미지가 없을 때 **Pinyon Script** 기반 “To Lead” 워드마크
- 워드마크 스타일을 추가했습니다.
  - `.wordmark--script`, `.wordmark--image`, `.wordmark.is-light`
  - 밝은 배경용 / 어두운 배경용 로고 분리
- 홈·뉴스레터의 장식 글리프를 `É` / `ÉCRU`에서 `TL` / `To Lead`로 변경했습니다.

## 2. 한국어화

- 스토어프런트 전체를 한국어로 번역했습니다.
  - 헤더·내비게이션·검색·계정·위시리스트·쇼핑백·사이즈 가이드
  - 체크아웃·주문 확인·토스트·aria-label
  - 홈, 컬렉션, 상품 상세, 리뷰, 뉴스레터, 푸터
- 관리자 전체를 한국어화했습니다.
  - 로그인, 내비게이션, 대시보드, 주문, 상품, 고객, 콘텐츠, 설정
  - 상태·결제·채널·고객 등급 레이블 (`STATUS_KO`, `ko()`)
  - 날짜/시간 `ko-KR`, 금액 `KRW`
- 한글 타이포그래피를 위해 폰트 스택과 자간을 조정했습니다.
  - `Noto Sans KR`, `Noto Serif KR`, `Pinyon Script` 추가
  - `.eyebrow`, `.micro`, `.link-underline`, `.btn`, `.field label` 등의 자간 완화
- 내부 코드값(`women`, `men`, `accessories`, `Processing` 등)은 유지하고 화면에서만 한국어로 매핑했습니다.

## 3. 가격·통화

- USD → **KRW**로 전환했습니다.
  - 시드 상품 가격 × 1,000
  - `Intl.NumberFormat('ko-KR', { currency: 'KRW' })`
  - 예: `₩158,000`
- 무료 배송 기준 **₩150,000**, 기본 배송비 **₩5,000**을 설정값으로 분리했습니다.
- 관리자 상품 편집기의 가격 입력도 원 단위로 변경했습니다.

## 4. 스토어프런트

- 홈(`index.html` + `home.js`)
  - 한국어 히어로, 프레스 로고 줄, 카테고리 카드, 신상품, 에디토리얼, 스토리, 가치, 뉴스레터
  - `data-content-*` 바인딩으로 설정값을 실시간 반영
  - 히어로 캡션 상품 링크/이름/가격을 설정에서 동적으로 연결
  - 카테고리별 상품 수 표시
- 컬렉션(`shop.html` + `shop.js`)
  - 컬렉션별 제목·설명·라벨을 설정에서 로드
  - 한국어 정렬/필터 레이블, 빈 상태·하단 노트 문구 바인딩
  - `?gender=women`, `?collection=new`, `?sale=1` URL 상태 유지
- 상품 상세(`product.html` + `product.js`)
  - 한국어 PDP 라벨, 배송 안내, 리뷰, 관련 상품
  - `{freeShipping}`, `{shippingFee}`, `{email}` 치환자 지원
  - 컬러/사이즈/갤러리/수량/리뷰 작성 플로우 유지
  - **수정:** 존재하지 않는 상품 ID로 접근하면 첫 상품으로 폴백하던 문제를 고쳐 “상품을 찾을 수 없습니다” 화면을 표시하도록 변경
- 공통 UI(`ui.js`)
  - 모든 페이지의 헤더·푸터·드로어·모달을 한국어로 재작성
  - `UI.brandHTML`, `UI.applyContent`, `UI.settingText`, `UI.syncFavicon` 노출
  - 설정 기반 로고·파비콘·문구 동기화

## 5. 관리자

### 인증
- 데모용 하드코딩 계정을 **`admin` / `admin`**으로 변경했습니다.
  - 실제 서비스에서는 반드시 서버 인증으로 교체해야 합니다.
- 세션 키를 `tolead.admin`으로 변경하고 로그인/로그아웃/오류 메시지를 한국어화했습니다.

### 콘텐츠 편집기 (핵심 추가)
- 스토어프런트에 보이는 **모든 문구와 이미지**를 스키마 기반 폼으로 편집할 수 있습니다.
  - **15개 그룹 / 208개 필드 / 9개 이미지 슬롯**
  - 그룹: 브랜드 & SEO, 공지 바, 내비게이션, 홈 히어로, 프레스, 카테고리, 신상품, 에디토리얼, 스토리, 가치, 뉴스레터, 푸터, 컬렉션 페이지, 상품 페이지, 커머스
- 필드 타입: 텍스트, 여러 줄 텍스트, 숫자, 이미지, 상품 선택
- 이미지 업로드
  - 브라우저에서 자동 압축
  - PNG/SVG는 투명 배경 유지, 사진은 JPEG 압축
  - 이미지 비우기, 미리보기 지원
- 히어로 실시간 미리보기
- **기본값으로 되돌리기** 확인 모달 (`resetSettings`)
- 저장 즉시 스토어프런트에 반영

### 상품 관리
- 상품 추가·수정·삭제
- 컬러를 `이름:#HEX` 형식으로 입력해 파싱
- 사이즈, 재고, 배지, 설명, 소재, 핏, 신상품 여부 편집
- 대표 이미지 선택 또는 새 이미지 업로드
- 삭제 확인 모달, 재고 부족/품절 필터

### 주문·고객·설정
- 주문 상태 필터, 검색, 상세 모달, 상태 변경, CSV 내려받기
- 고객 등급/누적 구매/최근 주문, 프로필 모달, CSV 내려받기
- 통합 검색(상품·주문·고객)
- 알림 패널, 모바일 사이드바
- 데이터 내려받기(JSON/CSV), 데모 전체 초기화
- 설정 화면에 토스페이먼츠·포트원·Stripe 등 실제 연동 체크리스트 정리

## 6. 데이터·저장소

- 저장 키: **`tolead.store.v1`** (기존 `ecru.store.v1` 데이터는 의도적으로 무시)
- 시드 버전: **5**
- `mergeSettings(saved)`로 새 기본 키를 자동 병합
- `resetSettings()` 추가 (콘텐츠만 기본값 복원)
- 카탈로그·고객·설정 기본값을 한국어/KRW로 재작성
- 시드는 오늘 기준 104개 데모 주문을 결정론적으로 생성
- `localStorage`를 사용할 수 없을 때 메모리 폴백 유지
- 상품 기본값: `기성복`, `내추럴` 컬러 등 한국어 기본값

## 7. 스타일

- 관리자 콘텐츠 편집기 UI 추가
  - 아코디언형 그룹, 필드 그리드, 이미지 업로드/미리보기, 저장 액션 바
  - 모바일에서 1열로 전환
- 한국어 텍스트에 맞춰 버튼·라벨·eyebrow 자간 조정
- `prefers-reduced-motion` 대응 유지

## 8. 검증한 항목

- [x] 모든 페이지 콘솔 에러 없음, 가로 스크롤 없음
- [x] `node --check` 6개 JS 파일 전체 통과
- [x] 관리자 `admin` / `admin` 로그인, 잘못된 비밀번호 오류 메시지
- [x] 콘텐츠 수정 → 저장 → 스토어프런트 반영
- [x] 콘텐츠 기본값 복원
- [x] 상품 생성(컬러 파싱 포함) → PDP/컬렉션 노출 → 수정 → 삭제
- [x] 로고 PNG 업로드 시 투명 배경 유지 및 헤더 반영
- [x] 장바구니 → 체크아웃 → 관리자 주문 목록 반영
- [x] 주문 상태 변경, 통합 검색, CSV 내려받기
- [x] 컬렉션 필터/정렬, 상품 없음 화면
- [x] 데모 전체 초기화

## 9. 파일별 변경

| 파일 | 변경 |
| --- | --- |
| `index.html` | 한국어 랜딩, `data-content-*` 바인딩, SEO |
| `shop.html` / `assets/js/shop.js` | 한국어 컬렉션, 설정 기반 메타, 필터/정렬 |
| `product.html` / `assets/js/product.js` | 한국어 PDP, 설정 기반 라벨, 상품 없음 처리 수정 |
| `admin.html` | 한국어 로그인/앱 셸, `admin`/`admin` 프리필 |
| `assets/js/admin.js` | 관리자 전체 한국어화, 스키마 콘텐츠 편집기, 상품 컬러/이미지, 주문/고객/설정 |
| `assets/js/store.js` | 한국어 카탈로그, KRW, 저장 키/버전, 기본 설정, `resetSettings`, Supabase 하이드레이션/write-through |
| `assets/js/config.js` | Supabase URL/anon key/시드 옵션 (신규) |
| `assets/js/backend.js` | Supabase REST/Auth 어댑터, 행↔앱 매핑, 체크아웃 RPC (신규) |
| `supabase/schema.sql` | 테이블·트리거·뷰·RLS·`place_order` RPC (신규) |
| `supabase/setup.sql` | 스키마+시드 통합 실행 파일 (신규) |
| `supabase/seed.sql` | 데모 데이터 SQL (신규, `generate-seed.mjs`로 생성) |
| `supabase/demo-policies.sql` / `production-policies.sql` | 데모용 anon 정책 적용/해제 (신규) |
| `supabase/generate-seed.mjs` | `seed.sql` 재생성 스크립트 (신규) |
| `.github/workflows/pages.yml` | 비공개 경로 GitHub Pages 자동 배포 (신규) |
| `robots.txt` | 전체 크롤링 차단 (신규) |
| `assets/js/ui.js` | 공통 크롬 한국어화, 로고/파비콘/콘텐츠 동기화 |
| `assets/js/home.js` | 히어로 상품 연결, 카테고리 수, 뉴스레터 |
| `assets/css/base.css` | 한국어 폰트/자간, 스크립트·이미지 워드마크 |
| `assets/css/home.css` | 장식 글리프, 가치 카드 타이포 |
| `assets/css/admin.css` | 콘텐츠 편집기, 이미지 업로드, 반응형 |
| `assets/favicon.svg` | TL 모노그램 |
| `README.md` | 브랜드/한국어/계정/저장소/연동 가이드 갱신 |

## 10. 알려진 제한 사항 / 다음 단계

- **로고 원본 파일 미포함**: 채팅으로 받은 로고 이미지는 파일로 접근할 수 없어 아직 저장소에 없습니다. `assets/images/`에 저장하거나 관리자 **콘텐츠 → 브랜드 & SEO**에서 업로드해야 합니다.
- **Supabase 라이브 검증 완료**: 실제 프로젝트(`wbkwxhhgjwubrbdusucn`)에서 상품/콘텐츠 읽기, 관리자 로그인, 상품·콘텐츠·주문 상태 저장, 체크아웃, 고객 누적 구매액 트리거를 확인했습니다. 테스트 주문·고객·재고는 원상 복구했습니다.
- **관리자 계정 하드코딩(로컬 모드)**: `admin` / `admin`은 Supabase 미설정 시 데모 전용입니다. Supabase 연결 후에는 Auth 관리자 계정으로 로그인하세요. 현재 라이브 프로젝트에는 테스트 관리자 계정이 등록되어 있으며, 운영 전 실제 관리자 계정으로 교체/삭제하세요.
- **다중 탭 동기화 없음**: Supabase 모드에서는 관리자 로그인/새로고침 시 DB에서 다시 읽습니다. 다른 기기의 변경은 새로고침 또는 `ECRU.refresh()`에서 반영됩니다.
- **이미지 저장**: 상품/콘텐츠 이미지는 data URL로 `products.image`·`settings.data`에 저장됩니다. 사진이 많아지면 Supabase Storage/CDN 이전이 필요합니다.
- 실제 서비스 전 연동 항목은 `README.md`의 “실제 서비스 전 연결할 항목”을 참고하세요.

## 11. Supabase 백엔드 통합

### 추가된 것
- **선택형 백엔드**: `assets/js/config.js`에 URL과 anon 키가 있으면 Supabase, 없으면 기존 localStorage 데모. `window.ECRU`의 동기 API는 그대로 유지했습니다.
- **하이드레이션**: 첫 로드에서 상품·고객·주문(+주문 상품)·리뷰·콘텐츠·구독자를 DB에서 읽어 덮어쓰고, `ECRU.ready` / `ecru:ready`로 완료를 알립니다. 홈·컬렉션·PDP·관리자는 이 이벤트에서 다시 렌더링합니다.
- **write-through**: 관리자 콘텐츠 저장, 상품 추가/수정/삭제, 주문 상태 변경, 리뷰, 구독, 체크아웃, 전체 초기화가 Supabase REST(또는 RPC)로 즉시 전송됩니다. 실패는 `ecru:sync-error` → 토스트.
- **체크아웃 RPC**: `place_order`가 서버의 상품 가격을 다시 계산하고 재고를 확인·차감한 뒤 주문/주문 상품을 한 트랜잭션으로 저장합니다.
- **고객 이력**: `orders` 트리거가 `customers.total_spent`, `order_count`, `last_order_at`을 자동 갱신하고, `customer_purchase_history` 뷰가 주문별 상품 내역을 제공합니다.
- **계정**: `accounts` 테이블이 Supabase Auth 사용자(`auth.users`)와 고객 프로필·역할(`customer`/`admin`)을 연결합니다.
- **관리자 인증**: Supabase 설정 시 Supabase Auth 이메일/비밀번호로 로그인. 미설정 시에만 `admin`/`admin` 로컬 데모.
- **RLS**: 공개 읽기는 상품·콘텐츠·리뷰만, 쓰기는 인증된 관리자만. 공개 데모를 위해 `demo-policies.sql`을 선택적으로 적용할 수 있습니다.
- **시드 SQL**: 현재 데모와 동일한 상품 21개·고객 10명·주문 104건·콘텐츠를 `seed.sql`로 이식. DB가 비어 있으면 첫 방문 시 자동 시드(`seedOnEmpty`).
- **GitHub Pages 준비**: 빌드 없이 루트 배포 그대로 동작하며, `README.md`에 Pages 설정과 Supabase 설정 절차를 정리했습니다.

### 라이브 연결 후 확인 체크리스트
- [x] PGlite(실제 Postgres WASM)에서 `schema.sql` / `seed.sql` / `setup.sql` 실행 — 테이블 8개, 상품 21개, 고객 10명, 주문 104건, 주문 항목 135건 생성
- [x] `place_order` RPC 호출 — 주문·항목 생성, 재고 차감, 고객 `total_spent`/`order_count` 트리거 갱신, `customer_purchase_history` 뷰 확인
- [x] `demo-policies.sql` / `production-policies.sql` 실행 확인
- [x] 모의 Supabase REST/Auth 서버로 하이드레이션, 관리자 로그인, 상품·콘텐츠·주문 상태 write-through, 체크아웃 RPC, 전체 초기화, 토큰 갱신 검증
- [x] Supabase 미설정 및 연결 실패 시 localStorage 폴백, 관리자 오류 토스트 확인
- [x] 실제 Supabase 프로젝트(`wbkwxhhgjwubrbdusucn`) 연결 — `setup.sql` 실행 후 상품 21개·설정 행 로드 확인
- [x] anon(공개) 키로 상품/설정만 읽히고 고객·주문·구독자는 RLS로 숨겨지는지 확인
- [x] Supabase Auth 관리자 계정으로 `admin.html` 로그인 후 주문 104건·고객 10명 로드
- [x] 고객 `total_spent`/`order_count`가 실제 주문 합계와 일치하는지 확인
- [x] 콘텐츠 저장 → DB `settings.data` 반영 → 원래 값 복원 확인
- [x] 상품 가격 수정 → DB `products.price` 반영 → 원래 값 복원 확인
- [x] 주문 상태 변경 → DB 반영 및 고객 누적 구매액 트리거 갱신/복원 확인
- [x] 체크아웃 → `orders`/`order_items` 생성, 재고 차감, 신규 고객 `total_spent` 증가 확인 (테스트 주문·고객·재고는 정리 완료)
- [x] Supabase 모드에서 고객·주문 PII를 localStorage에 저장하지 않는지 확인
- [ ] `demo-policies.sql` 적용 시 `admin`/`admin` 로컬 세션에서도 쓰기 가능한지 (데모 전용, 미적용)

## 12. GitHub Pages 비공개 링크 배포

- **Actions 기반 배포**: `.github/workflows/pages.yml`이 `main` 푸시마다 사이트를 `dist/`로 모아 Pages에 배포합니다.
- **비공개 경로**: 실제 스토어 파일은 `PAGES_PATH` 저장소 시크릿(임의의 24자리 hex) 아래에 복사됩니다. Pages 루트에는 링크 없는 “Not found.” 페이지만 남습니다.
- **검색 차단**: 모든 HTML에 `<meta name="robots" content="noindex, nofollow">`, 루트에 `robots.txt`(`Disallow: /`)를 추가했습니다.
- **자동 갱신**: `main`에 푸시하면 새 경로 그대로 재배포됩니다. 경로 교체는 `PAGES_PATH` 시크릿 변경 후 워크플로를 다시 실행하면 됩니다.
- **검증**:
  - [x] Pages 루트 `https://animefordaysxd.github.io/ShoppingMallWeb/` → 200, “Not found.” 플레이스홀더만 표시
  - [x] 비공개 경로 스토어프런트 → 상품 21개, 카드 8개, Supabase 하이드레이션, 콘솔 오류 없음
  - [x] 비공개 경로 관리자 → 테스트 관리자 로그인, 주문 104건·고객 10명 로드
  - [x] CSS·JS·이미지가 하위 경로에서 정상 로드
  - [x] 잘못된 경로(`/s/not-the-link/`, `/s/`) → 404
  - [x] 모든 페이지 `noindex`, `robots.txt` 크롤링 차단
- **한계**: 이는 URL 비공개(obscurity)이지 인증이 아닙니다. 링크를 아는 사람은 스토어프런트를 볼 수 있고, 공개 저장소의 Actions 아티팩트를 통해 경로를 확인할 수도 있습니다. 실제 접근 제어가 필요하면 Cloudflare Access·비밀번호 보호 호스팅·GitHub Enterprise Pages 접근 제어를 사용하세요.
