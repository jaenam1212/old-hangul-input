import { OldHangulInputOptions } from '../types';

export interface IInputHandler {
  insertText(text: string, replaceLast?: boolean, replaceCharCount?: number): void;
  copyToClipboard(text: string): void;
  getLastInsertedLength(): number;
}

export class InputHandler implements IInputHandler {
  private targetElement: HTMLElement | null = null;
  private onInsert?: (text: string) => void;
  private savedSelectionStart: number = 0;
  private savedSelectionEnd: number = 0;
  private lastInsertedText: string = ''; // 마지막으로 삽입된 텍스트
  private lastInsertedLength: number = 0; // 마지막으로 삽입된 텍스트의 길이

  constructor(options: OldHangulInputOptions) {
    this.initializeTarget(options.target);
    this.onInsert = options.onInsert;
    this.setupSelectionTracking();
  }

  // 커서 위치 추적 설정
  private setupSelectionTracking(): void {
    if (!this.targetElement) return;

    if (this.targetElement instanceof HTMLInputElement || this.targetElement instanceof HTMLTextAreaElement) {
      const inputElement = this.targetElement;

      // 포커스, 클릭, 키 입력 시 커서 위치 저장
      const updateSelection = () => {
        this.savedSelectionStart = inputElement.selectionStart || 0;
        this.savedSelectionEnd = inputElement.selectionEnd || 0;
      };

      inputElement.addEventListener('focus', updateSelection);
      inputElement.addEventListener('click', updateSelection);
      inputElement.addEventListener('keyup', updateSelection);

      // input 이벤트에서 커서 위치 업데이트
      inputElement.addEventListener('input', updateSelection);

      // 초기 위치 저장
      updateSelection();
    }
  }

  private initializeTarget(target: string | HTMLElement): void {
    if (typeof target === 'string') {
      this.targetElement = document.querySelector(target) as HTMLElement;
    } else {
      this.targetElement = target;
    }

    if (!this.targetElement) {
      throw new Error('Target element not found');
    }
  }

  insertText(text: string, replaceLast: boolean = false, replaceCharCount: number = 0): void {
    if (!this.targetElement) return;

    // 입력 필드에 포커스 복원
    if (this.targetElement instanceof HTMLInputElement || this.targetElement instanceof HTMLTextAreaElement) {
      this.targetElement.focus();
    }

    let finalText = text;

    // input, textarea인 경우
    if (this.targetElement instanceof HTMLInputElement || this.targetElement instanceof HTMLTextAreaElement) {
      // 저장된 커서 위치 사용 (포커스가 사라졌을 수 있으므로)
      let start = this.targetElement.selectionStart ?? this.savedSelectionStart;
      let end = this.targetElement.selectionEnd ?? this.savedSelectionEnd;

      // 포커스 복원 후 다시 확인
      if (this.targetElement === document.activeElement) {
        start = this.targetElement.selectionStart || start;
        end = this.targetElement.selectionEnd || end;
      }

      const value = this.targetElement.value;

      // 조합된 텍스트를 그대로 입력 (조합은 CompositionManager에서 처리됨)
      finalText = text;

      // 이전 글자 교체가 필요한 경우 (초성+중성, 초성+중성+종성 조합)
      let replaceStart = start;
      if (replaceLast && start > 0) {
        if (replaceCharCount > 0) {
          // 특정 개수의 문자를 교체 (초성, 초성+중성 등)
          replaceStart = Math.max(0, start - replaceCharCount);
        } else {
          // 마지막 문자(또는 조합형 글자)를 교체
          // 조합형 자모는 여러 문자로 구성될 수 있으므로 역방향으로 확인
          let i = start - 1;

          // 한글 완성형 글자인지 확인 (U+AC00-U+D7A3)
          const lastCharCode = value.charCodeAt(i);
          if (lastCharCode >= 0xac00 && lastCharCode <= 0xd7a3) {
            // 완성형 한글 글자는 1글자만 삭제
            replaceStart = i;
          } else if (lastCharCode >= 0x1100 && lastCharCode <= 0x11ff) {
            // 조합형 자모면 이전 문자들도 확인하여 전체 조합형 글자 찾기
            // 종성(U+11A8-U+11FF) → 중성(U+1160-U+11A7) → 초성(U+1100-U+115F) 순서로 찾기
            while (i > 0) {
              const prevCharCode = value.charCodeAt(i - 1);
              if (prevCharCode >= 0x1100 && prevCharCode <= 0x11ff) {
                i--;
              } else {
                break;
              }
            }
            replaceStart = i;
          } else {
            // 일반 문자면 한 글자만 교체
            replaceStart = start - 1;
          }
        }
      }

      this.targetElement.value = value.substring(0, replaceStart) + finalText + value.substring(end);

      // 커서 위치 조정
      const newPosition = replaceStart + finalText.length;
      this.targetElement.setSelectionRange(newPosition, newPosition);
      this.savedSelectionStart = newPosition;
      this.savedSelectionEnd = newPosition;

      // 삽입된 텍스트 업데이트
      this.lastInsertedText = finalText;
      this.lastInsertedLength = finalText.length;

      // input 이벤트 발생
      this.targetElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // contenteditable인 경우
    else if (this.targetElement.contentEditable === 'true') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // 조합된 텍스트를 그대로 입력 (조합은 CompositionManager에서 처리됨)
        range.deleteContents();
        const newTextNode = document.createTextNode(finalText);
        range.insertNode(newTextNode);
        range.setStartAfter(newTextNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    if (this.onInsert) {
      this.onInsert(finalText);
    }
  }

  getLastInsertedLength(): number {
    return this.lastInsertedLength;
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          if (this.onInsert) {
            this.onInsert(text);
          }
        })
        .catch((err) => {
          console.error('Failed to copy:', err);
          this.fallbackCopy(text);
        });
    } else {
      this.fallbackCopy(text);
    }
  }

  private fallbackCopy(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      if (this.onInsert) {
        this.onInsert(text);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textArea);
  }
}
