export type InputMode = 'modal' | 'popup' | 'inline';

export interface OldHangulInputOptions {
  mode: InputMode;
  target: string | HTMLElement; // 입력 대상 요소
  container?: string | HTMLElement; // 인라인 모드일 때 컨테이너
  onInsert?: (text: string) => void; // 텍스트 삽입 시 콜백
  onCopy?: (text: string) => void; // 복사 시 콜백
}

export interface OldHangulInputInstance {
  open: () => void;
  close: () => void;
  destroy: () => void;
}

