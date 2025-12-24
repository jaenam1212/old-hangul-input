import { InputPanel } from './InputPanel';
import { InputHandler } from '../core/InputHandler';
import { OldHangulInputOptions } from '../types';

export class Modal {
  private overlay: HTMLElement | null = null;
  private panel: InputPanel | null = null;
  private inputHandler: InputHandler;
  private options: OldHangulInputOptions;
  private modalInput: HTMLInputElement | null = null;

  constructor(inputHandler: InputHandler, options: OldHangulInputOptions) {
    this.inputHandler = inputHandler;
    this.options = options;
  }

  open(): void {
    if (this.overlay) return;

    // 오버레이 생성
    this.overlay = document.createElement('div');
    this.overlay.className = 'old-hangul-modal-overlay';

    // 모달 커스터마이징 옵션
    const modalOptions = this.options.modal || {};

    // 패널 생성
    const panelContainer = document.createElement('div');
    panelContainer.className = 'old-hangul-modal-panel';

    // 닫기 버튼
    const closeBtn = document.createElement('button');
    closeBtn.className = 'old-hangul-modal-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.close());

    // 닫기 버튼 위치 설정
    const closePosition = modalOptions.closeButtonPosition || 'top-right';
    const closeBtnStyle: Partial<CSSStyleDeclaration> = {
      position: 'absolute',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
    };

    if (closePosition.includes('top')) {
      closeBtnStyle.top = '10px';
    } else {
      closeBtnStyle.bottom = '10px';
    }

    if (closePosition.includes('left')) {
      closeBtnStyle.left = '10px';
      closeBtnStyle.right = 'auto';
    } else {
      closeBtnStyle.right = '10px';
      closeBtnStyle.left = 'auto';
    }

    if (modalOptions.closeButtonSize) {
      closeBtnStyle.width = modalOptions.closeButtonSize;
      closeBtnStyle.height = modalOptions.closeButtonSize;
    } else {
      closeBtnStyle.width = '30px';
      closeBtnStyle.height = '30px';
    }

    if (modalOptions.closeButtonColor) {
      closeBtnStyle.color = modalOptions.closeButtonColor;
    } else {
      closeBtnStyle.color = '#999';
    }

    if (modalOptions.fontSize) {
      closeBtnStyle.fontSize = modalOptions.fontSize;
    } else {
      closeBtnStyle.fontSize = '24px';
    }

    Object.assign(closeBtn.style, closeBtnStyle);
    panelContainer.appendChild(closeBtn);

    // 상단 입력창 영역
    const inputSection = document.createElement('div');
    inputSection.className = 'old-hangul-modal-input-section';

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'old-hangul-modal-input-wrapper';

    this.modalInput = document.createElement('input');
    this.modalInput.type = 'text';
    this.modalInput.className = 'old-hangul-modal-input';

    // target이 없거나 document.body인 경우 모달 내부 입력창에 직접 입력
    const useModalInput = !this.options.target || this.options.target === document.body;
    if (useModalInput) {
      this.modalInput.placeholder = '옛한글을 입력하세요';
    } else {
      this.modalInput.readOnly = true;
      this.modalInput.placeholder = '입력 내용이 여기에 표시됩니다';
    }

    const copyBtn = document.createElement('button');
    copyBtn.className = 'old-hangul-modal-copy-btn';
    copyBtn.textContent = '복사';
    copyBtn.addEventListener('click', () => {
      if (this.modalInput && this.modalInput.value) {
        this.copyToClipboard(this.modalInput.value);
      }
    });

    inputWrapper.appendChild(this.modalInput);
    inputWrapper.appendChild(copyBtn);
    inputSection.appendChild(inputWrapper);
    panelContainer.appendChild(inputSection);

    // InputPanel 컨테이너
    const panelContent = document.createElement('div');
    panelContainer.appendChild(panelContent);

    // target이 없거나 document.body인 경우 모달 내부 입력창을 target으로 사용
    const actualTarget = useModalInput ? this.modalInput : this.options.target;

    // target이 없거나 document.body인 경우 모달 내부 입력창을 target으로 사용하기 위해 InputHandler 재생성
    let modalInputHandler = this.inputHandler;
    if (useModalInput) {
      modalInputHandler = new InputHandler({
        ...this.options,
        target: actualTarget,
        onInsert: (text: string) => {
          // 원래 콜백 호출
          if (this.options.onInsert) {
            this.options.onInsert(text);
          }
        },
      });
    }

    // 입력 동기화를 위한 수정된 옵션
    const syncOptions = {
      mode: this.options.mode || 'modal',
      target: actualTarget,
      onInsert: (text: string) => {
        // target이 외부인 경우에만 모달 입력창에 반영
        if (!useModalInput) {
          this.updateModalInput();
        }
        // 원래 콜백 호출
        if (this.options.onInsert) {
          this.options.onInsert(text);
        }
      },
      onCopy: this.options.onCopy,
    };

    // target이 외부인 경우에만 입력창 변경 감지 (polling으로 동기화)
    let syncInterval: NodeJS.Timeout | null = null;
    if (!useModalInput) {
      syncInterval = setInterval(() => {
        this.updateModalInput();
      }, 100);

      // 모달이 닫힐 때 interval 정리를 위해 저장
      (this as any).syncInterval = syncInterval;
    }

    this.panel = new InputPanel(panelContent, modalInputHandler, syncOptions);

    this.overlay.appendChild(panelContainer);
    document.body.appendChild(this.overlay);

    // 오버레이 클릭 시 닫기
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // ESC 키로 닫기
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // 스타일 적용
    this.applyModalStyles(modalOptions);

    // 커스터마이징 스타일을 패널에 직접 적용
    if (modalOptions.width) {
      panelContainer.style.width = modalOptions.width;
    }
    if (modalOptions.maxWidth) {
      panelContainer.style.maxWidth = modalOptions.maxWidth;
    }
    if (modalOptions.height) {
      panelContainer.style.height = modalOptions.height;
    }
    if (modalOptions.maxHeight) {
      panelContainer.style.maxHeight = modalOptions.maxHeight;
    }
    if (modalOptions.backgroundColor) {
      panelContainer.style.backgroundColor = modalOptions.backgroundColor;
    }
    if (modalOptions.textColor) {
      panelContainer.style.color = modalOptions.textColor;
    }
    if (modalOptions.borderRadius) {
      panelContainer.style.borderRadius = modalOptions.borderRadius;
    }
    if (modalOptions.boxShadow) {
      panelContainer.style.boxShadow = modalOptions.boxShadow;
    }

    // 오버레이 색상 설정
    if (modalOptions.overlayColor) {
      this.overlay.style.backgroundColor = modalOptions.overlayColor;
    }
  }

  close(): void {
    if ((this as any).syncInterval) {
      clearInterval((this as any).syncInterval);
      (this as any).syncInterval = null;
    }
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
      this.panel = null;
      this.modalInput = null;
    }
  }

  private copyToClipboard(text: string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          // 복사 성공 피드백
          if (this.modalInput) {
            const originalPlaceholder = this.modalInput.placeholder;
            this.modalInput.placeholder = '복사되었습니다!';
            setTimeout(() => {
              if (this.modalInput) {
                this.modalInput.placeholder = originalPlaceholder;
              }
            }, 1000);
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
      if (this.modalInput) {
        const originalPlaceholder = this.modalInput.placeholder;
        this.modalInput.placeholder = '복사되었습니다!';
        setTimeout(() => {
          if (this.modalInput) {
            this.modalInput.placeholder = originalPlaceholder;
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textArea);
  }

  private updateModalInput(): void {
    if (!this.modalInput) return;

    // target에 입력된 최신 값 가져오기
    let targetValue = '';
    if (typeof this.options.target === 'string') {
      const targetEl = document.querySelector(this.options.target) as HTMLInputElement | HTMLTextAreaElement;
      if (targetEl) {
        targetValue = targetEl.value;
      }
    } else {
      const targetEl = this.options.target as HTMLInputElement | HTMLTextAreaElement;
      if (targetEl && 'value' in targetEl) {
        targetValue = targetEl.value;
      }
    }

    this.modalInput.value = targetValue;
  }

  private applyModalStyles(modalOptions: any = {}): void {
    // 기존 스타일이 있으면 제거
    const existingStyle = document.getElementById('old-hangul-modal-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'old-hangul-modal-styles';

    // 기본값
    const bgColor = modalOptions.backgroundColor || '#fff';
    const textColor = modalOptions.textColor || '#1a1a1a';
    const overlayColor = modalOptions.overlayColor || 'rgba(0, 0, 0, 0.5)';
    const borderColor = modalOptions.borderColor || '#ddd';
    const buttonColor = modalOptions.buttonColor || '#fff';
    const buttonHoverColor = modalOptions.buttonHoverColor || '#f0f0f0';
    const fontSize = modalOptions.fontSize || '16px';
    const titleFontSize = modalOptions.titleFontSize || '16px';
    const buttonFontSize = modalOptions.buttonFontSize || '14px';
    const inputFontSize = modalOptions.inputFontSize || '16px';
    const borderRadius = modalOptions.borderRadius || '8px';
    const padding = modalOptions.padding || '20px';

    style.textContent = `
      .old-hangul-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: ${overlayColor};
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s;
      }

      .old-hangul-modal-panel {
        position: relative;
        background: ${bgColor};
        border-radius: ${borderRadius};
        width: 95vw;
        max-width: 1200px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: slideUp 0.3s;
        color: ${textColor};
      }
      
      .old-hangul-modal-input-section {
        padding: ${padding};
        border-bottom: 1px solid ${borderColor};
        background: ${bgColor};
      }

      .old-hangul-modal-input-wrapper {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .old-hangul-modal-input {
        flex: 1;
        padding: 10px 15px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        font-size: ${inputFontSize};
        font-family: 'Pretendard', 'YetHangul', '맑은고딕', '나눔고딕', '돋움', dotum, '새굴림', sans-serif;
        background: #f9f9f9;
        color: ${textColor};
      }

      .old-hangul-modal-input:focus {
        outline: none;
        border-color: #999;
        background: #fff;
      }

      .old-hangul-modal-copy-btn {
        padding: 10px 20px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        background: ${buttonColor};
        color: ${textColor};
        cursor: pointer;
        font-size: ${buttonFontSize};
        font-family: 'Pretendard', 'YetHangul', '맑은고딕', '나눔고딕', '돋움', dotum, '새굴림', sans-serif;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .old-hangul-modal-copy-btn:hover {
        background: ${buttonHoverColor};
        border-color: #999;
      }

      .old-hangul-modal-copy-btn:active {
        background: #e0e0e0;
      }
      
      .old-hangul-modal-panel .old-hangul-input-panel {
        max-width: 100%;
        max-height: calc(90vh - 120px);
        overflow-y: auto;
        flex: 1;
        background: ${bgColor};
        color: ${textColor};
        font-size: ${fontSize};
      }
      
      .old-hangul-modal-panel .old-hangul-section-title {
        font-size: ${titleFontSize} !important;
      }
      
      .old-hangul-modal-panel .old-hangul-item {
        font-size: ${fontSize} !important;
      }

      .old-hangul-modal-close:hover {
        background: ${buttonHoverColor};
        color: #333;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;

    document.head.appendChild(style);
  }

  destroy(): void {
    this.close();
  }
}
