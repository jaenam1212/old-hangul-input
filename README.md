# Old Hangul Input

옛 한글 입력기 npm 라이브러리 - React, Vue, Vanilla JS에서 사용 가능

## 기능

- 모달, 새창, 인라인에서 옛한글 입력 지원
- 초성+중성+종성 조합 기능
- 현대 한글 및 옛한글 조합형 자모 지원
- 자음, 모음, 단어 클릭 시 자동 입력
- 복사/붙여넣기 지원

## 설치

```bash
npm install old-hangul-input
```

## 사용법

### Vanilla JavaScript / TypeScript

```javascript
import { OldHangulInput } from 'old-hangul-input';

// 모달로 열기
const input = new OldHangulInput({
  mode: 'modal',
  target: '#my-input',
});

// 새창으로 열기
const input = new OldHangulInput({
  mode: 'popup',
  target: '#my-input',
});

// 인라인으로 표시
const input = new OldHangulInput({
  mode: 'inline',
  target: '#my-input',
  container: '#input-container',
});
```

### React

#### 인라인 모드 (항상 표시)

```jsx
import { useEffect, useRef, useState } from 'react';
import { OldHangulInput } from 'old-hangul-input';

function MyComponent() {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const keyboardRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && containerRef.current) {
      keyboardRef.current = new OldHangulInput({
        mode: 'inline',
        target: inputRef.current,
        container: containerRef.current,
        onInsert: (text) => {
          console.log('입력됨:', text);
        },
      });
    }

    return () => {
      keyboardRef.current?.destroy();
    };
  }, []);

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="옛한글을 입력하세요" />
      <div ref={containerRef}></div>
    </div>
  );
}
```

#### 모달 모드 (버튼 클릭 시 열기)

```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { OldHangulInput } from 'old-hangul-input';

export default function Home() {
  const inputRef = useRef < HTMLInputElement > null;
  const keyboardRef = (useRef < OldHangulInput) | (null > null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      keyboardRef.current = new OldHangulInput({
        mode: 'modal',
        target: inputRef.current,
        onInsert: (text) => {
          console.log('입력됨:', text);
        },
      });
    }

    return () => {
      keyboardRef.current?.destroy();
    };
  }, []);

  const handleOpen = () => {
    keyboardRef.current?.open();
    setIsOpen(true);
  };

  const handleClose = () => {
    keyboardRef.current?.close();
    setIsOpen(false);
  };

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="옛한글을 입력하세요" />
      <button onClick={handleOpen}>옛한글 입력기 열기</button>
      {isOpen && <button onClick={handleClose}>닫기</button>}
    </div>
  );
}
```

### Vue

```vue
<template>
  <div>
    <input ref="inputRef" />
    <div ref="containerRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { OldHangulInput } from 'old-hangul-input';

const inputRef = ref(null);
const containerRef = ref(null);
let keyboard = null;

onMounted(() => {
  if (inputRef.value && containerRef.value) {
    keyboard = new OldHangulInput({
      mode: 'inline',
      target: inputRef.value,
      container: containerRef.value,
    });
  }
});

onUnmounted(() => {
  keyboard?.destroy();
});
</script>
```

## 폰트 설정

옛한글 입력기가 올바르게 표시되도록 다음 폰트를 사용하시기 바랍니다:

```css
font-family: 'Pretendard', 'YetHangul', '맑은고딕', '나눔고딕', '돋움', dotum, '새굴림', sans-serif;
```

라이브러리는 자동으로 위 폰트 스택을 적용하지만, 프로젝트 전체에서 옛한글을 표시하려면 전역 스타일에 위 폰트 설정을 추가하는 것을 권장합니다.

## API

### OldHangulInput(options)

옛한글 입력기 인스턴스를 생성합니다.

#### options

- `mode: 'modal' | 'popup' | 'inline'` - 입력기 모드
- `target: string | HTMLElement` - 입력 대상 요소 (선택자 또는 DOM 요소)
- `container?: string | HTMLElement` - 인라인 모드일 때 패널이 표시될 컨테이너
- `onInsert?: (text: string) => void` - 텍스트가 삽입될 때 호출되는 콜백
- `onCopy?: (text: string) => void` - 텍스트가 복사될 때 호출되는 콜백

#### 메서드

- `open()` - 모달/팝업 모드에서 입력기를 엽니다
- `close()` - 모달/팝업 모드에서 입력기를 닫습니다
- `destroy()` - 입력기 인스턴스를 제거합니다

## 조합 방식

1. **초성 클릭**: 초성만 입력됩니다
2. **중성 클릭**: 초성이 이미 있으면 초성을 삭제하고 초성+중성 조합 글자를 삽입합니다
3. **종성 클릭**: 초성+중성이 이미 있으면 초성+중성을 삭제하고 초성+중성+종성 조합 글자를 삽입합니다

## 개발

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 개발 모드 (파일 변경 감지)
npm run dev

# 예제 실행
npm run serve
```

## npm 배포

```bash
# 빌드
npm run build

# npm 로그인 (처음만)
npm login

# 배포
npm publish
```

## 라이선스

Copyright (c) Padolabs. All rights reserved.
