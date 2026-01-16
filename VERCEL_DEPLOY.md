# Vercel 배포 가이드

## 사전 준비

1. **GitHub 저장소 연결**
   - 이 프로젝트를 GitHub에 push하세요
   - Vercel에서 해당 저장소를 import합니다

2. **Vercel 계정 생성**
   - https://vercel.com 에서 계정을 생성하세요
   - GitHub 계정과 연동하면 편리합니다

## 배포 방법

### 방법 1: Vercel Dashboard 사용

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 다음 설정을 확인/수정:
   - **Framework Preset**: Vite
   - **Build Command**: `cd client && npm run build` 또는 Vite 자동 감지
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

5. "Deploy" 클릭

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel
```

## 프로젝트 구조

Vercel 배포를 위해 다음 파일들이 생성되었습니다:

```
/api
  ├── storage.ts          # 공유 스토리지 (인메모리)
  ├── facilities.ts       # GET /api/facilities
  ├── facilities/[id].ts  # GET /api/facilities/:id
  ├── waiting.ts          # GET/POST/DELETE /api/waiting
  ├── history.ts          # GET /api/history
  ├── orders.ts           # GET/POST /api/orders
  └── orders/
      └── [orderId].ts    # GET /api/orders/:orderId
      └── [orderId]/
          ├── activate-qr.ts  # POST /api/orders/:orderId/activate-qr
          ├── cancel.ts       # POST /api/orders/:orderId/cancel
          └── complete.ts     # POST /api/orders/:orderId/complete
```

## 주의사항

### 서버리스 함수 제한사항

1. **인메모리 스토리지**: 현재 인메모리 저장소를 사용하므로 각 함수 호출마다 상태가 초기화됩니다. 프로덕션에서는 데이터베이스(Vercel Postgres, Supabase 등)로 교체해야 합니다.

2. **WebSocket 미지원**: Vercel 서버리스 함수는 WebSocket을 지원하지 않습니다. 실시간 업데이트가 필요한 경우:
   - Polling 방식으로 변경
   - Vercel과 함께 별도 WebSocket 서버 운영
   - Pusher, Ably 같은 실시간 서비스 사용

3. **세션 관리**: 세션 쿠키 대신 `x-session-id` 헤더 또는 인증 토큰 사용을 권장합니다.

### 환경 변수 설정

Vercel Dashboard > Project Settings > Environment Variables에서 설정:

```
# 필요시 추가할 환경 변수
DATABASE_URL=postgresql://...  # 데이터베이스 사용 시
```

## 로컬 테스트

Vercel 함수를 로컬에서 테스트하려면:

```bash
# Vercel CLI로 개발 서버 실행
vercel dev
```

## 프로덕션 배포 체크리스트

- [ ] 인메모리 스토리지를 데이터베이스로 교체
- [ ] 환경 변수 설정 완료
- [ ] 도메인 연결 (선택사항)
- [ ] API 엔드포인트 테스트

## 문제 해결

### 빌드 실패 시

1. `vercel.json` 설정 확인
2. TypeScript 컴파일 에러 확인
3. 의존성 패키지 확인

### API 호출 실패 시

1. 브라우저 개발자 도구 > Network 탭 확인
2. Vercel Dashboard > Functions 로그 확인
3. CORS 설정 확인

## 지원

문제가 있으시면 다음을 확인하세요:
- [Vercel 문서](https://vercel.com/docs)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
