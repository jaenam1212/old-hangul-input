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
    
    // 패널 생성
    const panelContainer = document.createElement('div');
    panelContainer.className = 'old-hangul-modal-panel';
    
    // 닫기 버튼
    const closeBtn = document.createElement('button');
    closeBtn.className = 'old-hangul-modal-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.close());
    panelContainer.appendChild(closeBtn);
    
    // 상단 입력창 영역
    const inputSection = document.createElement('div');
    inputSection.className = 'old-hangul-modal-input-section';
    
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'old-hangul-modal-input-wrapper';
    
    this.modalInput = document.createElement('input');
    this.modalInput.type = 'text';
    this.modalInput.className = 'old-hangul-modal-input';
    this.modalInput.readOnly = true;
    this.modalInput.placeholder = '입력 내용이 여기에 표시됩니다';
    
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
    
    // 입력 동기화를 위한 수정된 옵션
    const syncOptions = {
      mode: this.options.mode || 'modal',
      target: this.options.target,
      onInsert: (text: string) => {
        // 모달 입력창에 반영
        this.updateModalInput();
        // 원래 콜백 호출
        if (this.options.onInsert) {
          this.options.onInsert(text);
        }
      },
      onCopy: this.options.onCopy,
    };
    
    // target 입력창 변경 감지 (polling으로 동기화)
    const syncInterval = setInterval(() => {
      this.updateModalInput();
    }, 100);
    
    // 모달이 닫힐 때 interval 정리
    const originalClose = this.close.bind(this);
    this.close = () => {
      clearInterval(syncInterval);
      originalClose();
    };
    
    this.panel = new InputPanel(panelContent, this.inputHandler, syncOptions);

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
    this.applyModalStyles();
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
      navigator.clipboard.writeText(text).then(() => {
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
      }).catch((err) => {
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

  private applyModalStyles(): void {
    if (document.getElementById('old-hangul-modal-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'old-hangul-modal-styles';
    style.textContent = `
      .old-hangul-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s;
      }

      .old-hangul-modal-panel {
        position: relative;
        background: #fff;
        border-radius: 8px;
        width: 95vw;
        max-width: 1200px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: slideUp 0.3s;
        color: #1a1a1a;
      }
      
      .old-hangul-modal-input-section {
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        background: #fff;
      }

      .old-hangul-modal-input-wrapper {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .old-hangul-modal-input {
        flex: 1;
        padding: 10px 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        font-family: 'Pretendard', 'YetHangul', '맑은고딕', '나눔고딕', '돋움', dotum, '새굴림', sans-serif;
        background: #f9f9f9;
        color: #1a1a1a;
      }

      .old-hangul-modal-input:focus {
        outline: none;
        border-color: #999;
        background: #fff;
      }

      .old-hangul-modal-copy-btn {
        padding: 10px 20px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #fff;
        color: #1a1a1a;
        cursor: pointer;
        font-size: 14px;
        font-family: 'Pretendard', 'YetHangul', '맑은고딕', '나눔고딕', '돋움', dotum, '새굴림', sans-serif;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .old-hangul-modal-copy-btn:hover {
        background: #f0f0f0;
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
        background: #fff;
        color: #1a1a1a;
      }

      .old-hangul-modal-close {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        border: none;
        background: transparent;
        font-size: 24px;
        cursor: pointer;
        color: #999;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }

      .old-hangul-modal-close:hover {
        background: #f0f0f0;
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

