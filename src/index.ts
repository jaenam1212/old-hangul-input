import { OldHangulInputOptions, OldHangulInputInstance } from './types';
import { InputHandler } from './core/InputHandler';
import { Modal } from './ui/Modal';
import { Popup } from './ui/Popup';
import { InputPanel } from './ui/InputPanel';

// Named export로 사용 가능 (export class이므로)
export class OldHangulInput implements OldHangulInputInstance {
  private inputHandler: InputHandler;
  private modal?: Modal;
  private popup?: Popup;
  private inlinePanel?: InputPanel;
  private options: OldHangulInputOptions;
  private container?: HTMLElement;

  constructor(options: OldHangulInputOptions) {
    this.options = options;
    this.inputHandler = new InputHandler(options);

    // 모드에 따라 UI 초기화
    if (options.mode === 'modal') {
      this.modal = new Modal(this.inputHandler, options);
    } else if (options.mode === 'popup') {
      this.popup = new Popup(this.inputHandler, options);
    } else if (options.mode === 'inline') {
      this.initializeInline();
    }
  }

  private initializeInline(): void {
    if (!this.options.container) {
      throw new Error('Container is required for inline mode');
    }

    let container: HTMLElement;
    if (typeof this.options.container === 'string') {
      container = document.querySelector(this.options.container) as HTMLElement;
    } else {
      container = this.options.container;
    }

    if (!container) {
      throw new Error('Container element not found');
    }

    this.container = container;
    this.inlinePanel = new InputPanel(container, this.inputHandler, this.options);
  }

  open(): void {
    if (this.options.mode === 'modal' && this.modal) {
      this.modal.open();
    } else if (this.options.mode === 'popup' && this.popup) {
      this.popup.open();
    }
    // inline 모드는 항상 표시되므로 open 불필요
  }

  close(): void {
    if (this.modal) {
      this.modal.close();
    }
    if (this.popup) {
      this.popup.close();
    }
  }

  destroy(): void {
    if (this.modal) {
      this.modal.destroy();
    }
    if (this.popup) {
      this.popup.destroy();
    }
    if (this.inlinePanel) {
      this.inlinePanel.destroy();
    }
  }
}

// Default export (하위 호환성을 위해 유지)
export default OldHangulInput;

// 타입 export
export * from './types';
export * from './data/oldHangulData';

