# 개발 가이드

## 처음 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 빌드

```bash
npm run build
```

이 명령어를 실행하면 `dist/` 폴더에 빌드된 파일들이 생성됩니다:

- `dist/index.js` - CommonJS 버전
- `dist/index.esm.js` - ES Module 버전
- `dist/index.d.ts` - TypeScript 타입 정의

### 3. 예제 실행

#### 방법 1: 간단한 HTTP 서버 사용 (권장)

```bash
npm run serve
```

브라우저가 자동으로 열리며 `examples/index.html`이 실행됩니다.

#### 방법 2: 다른 서버 사용

```bash
# Python이 설치되어 있다면
python -m http.server 8080

# 또는 Node.js의 http-server
npx http-server . -p 8080
```

그 다음 브라우저에서 `http://localhost:8080/examples/index.html` 접속

### 4. 개발 중 수정하기

코드를 수정하면서 실시간으로 확인하려면:

**터미널 1**: Watch 모드로 빌드

```bash
npm run dev
```

**터미널 2**: 서버 실행

```bash
npm run serve
```

이렇게 하면 코드를 수정할 때마다 자동으로 다시 빌드되고, 브라우저를 새로고침하면 변경사항을 확인할 수 있습니다.

## 테스트 방법

1. **모달 모드**: "모달 열기" 버튼 클릭 → 옛한글 클릭 → 입력창에 자동 입력 확인
2. **팝업 모드**: "팝업 열기" 버튼 클릭 → 새 창에서 옛한글 클릭 → 입력창에 자동 입력 확인
3. **인라인 모드**: 페이지 로드 시 자동으로 표시됨 → 옛한글 클릭 → 입력창에 자동 입력 확인
4. **복사 기능**: 옛한글 버튼 우클릭 → 클립보드에 복사됨

## 문제 해결

### 빌드 에러가 나는 경우

- TypeScript 에러 확인: `tsc --noEmit`
- node_modules 재설치: `rm -rf node_modules && npm install`

### 예제가 작동하지 않는 경우

- `dist/` 폴더가 있는지 확인
- 브라우저 콘솔에서 에러 확인 (F12)
- ES Module을 지원하는 브라우저인지 확인 (최신 브라우저 필요)

### CORS 에러가 나는 경우

- 반드시 HTTP 서버를 통해 실행해야 합니다 (file:// 프로토콜로는 작동하지 않음)
