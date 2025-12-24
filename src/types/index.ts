export type InputMode = 'modal' | 'popup' | 'inline';

export interface ModalCustomizationOptions {
  // 색상
  backgroundColor?: string; // 모달 배경색
  overlayColor?: string; // 오버레이 배경색 (rgba)
  textColor?: string; // 텍스트 색상
  borderColor?: string; // 테두리 색상
  buttonColor?: string; // 버튼 배경색
  buttonHoverColor?: string; // 버튼 hover 색상

  // 닫기 버튼
  closeButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; // 닫기 버튼 위치
  closeButtonSize?: string; // 닫기 버튼 크기 (예: '30px')
  closeButtonColor?: string; // 닫기 버튼 색상

  // 크기
  width?: string; // 모달 너비 (예: '90vw', '800px')
  maxWidth?: string; // 최대 너비
  height?: string; // 모달 높이
  maxHeight?: string; // 최대 높이

  // 글자 크기
  fontSize?: string; // 기본 글자 크기
  titleFontSize?: string; // 섹션 제목 글자 크기
  buttonFontSize?: string; // 버튼 글자 크기
  inputFontSize?: string; // 입력창 글자 크기

  // 기타
  borderRadius?: string; // 모서리 둥글기
  padding?: string; // 패딩
  boxShadow?: string; // 그림자
}

export interface OldHangulInputOptions {
  mode: InputMode;
  target?: string | HTMLElement; // 입력 대상 요소 (지정하지 않으면 모달 내부 입력창 사용)
  container?: string | HTMLElement; // 인라인 모드일 때 컨테이너
  onInsert?: (text: string) => void; // 텍스트 삽입 시 콜백
  onCopy?: (text: string) => void; // 복사 시 콜백
  modal?: ModalCustomizationOptions; // 모달 커스터마이징 옵션 (modal 모드일 때만 적용)
}

export interface OldHangulInputInstance {
  open: () => void;
  close: () => void;
  destroy: () => void;
}
