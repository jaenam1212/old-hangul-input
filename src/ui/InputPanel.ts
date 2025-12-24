import { oldHangulData } from "../data/oldHangulData";
import { IInputHandler } from "../core/InputHandler";
import { OldHangulInputOptions } from "../types";
import { CompositionManager } from "../core/CompositionState";

export class InputPanel {
  private container: HTMLElement;
  private inputHandler: IInputHandler;
  private onCopy?: (text: string) => void;
  private compositionManager: CompositionManager;

  constructor(
    container: HTMLElement,
    inputHandler: IInputHandler,
    options: OldHangulInputOptions
  ) {
    this.container = container;
    this.inputHandler = inputHandler;
    this.onCopy = options.onCopy;
    this.compositionManager = new CompositionManager();
    this.render();
  }

  private render(): void {
    this.container.innerHTML = "";
    this.container.className = "old-hangul-input-panel";

    // 초성 섹션
    const initialsSection = this.createSection(
      "초성",
      oldHangulData.initials,
      "initial"
    );
    this.container.appendChild(initialsSection);

    // 중성 섹션
    const medialsSection = this.createSection(
      "중성",
      oldHangulData.medials,
      "medial"
    );
    this.container.appendChild(medialsSection);

    // 종성 섹션
    const finalsSection = this.createSection(
      "종성",
      oldHangulData.finals,
      "final"
    );
    this.container.appendChild(finalsSection);

    // 단어 섹션
    const wordsSection = this.createSection("단어", oldHangulData.words);
    this.container.appendChild(wordsSection);

    // 스타일 적용
    this.applyStyles();
  }

  private createSection(
    title: string,
    items: string[],
    type?: "initial" | "medial" | "final"
  ): HTMLElement {
    const section = document.createElement("div");
    section.className = "old-hangul-section";

    const titleEl = document.createElement("h3");
    titleEl.className = "old-hangul-section-title";
    titleEl.textContent = title;
    section.appendChild(titleEl);

    const grid = document.createElement("div");
    grid.className = "old-hangul-grid";

    items.forEach((item) => {
      const button = document.createElement("button");
      button.className = "old-hangul-item";
      button.textContent = item;
      button.setAttribute("data-text", item);

      // 클릭 시 입력 (포커스 유지를 위해 mousedown 사용)
      button.addEventListener("mousedown", (e) => {
        e.preventDefault(); // 포커스가 버튼으로 이동하지 않도록
        // 약간의 지연을 두고 입력 (포커스 복원 시간 확보)
        setTimeout(() => {
          let text = item;
          let shouldReplace = false;
          let replaceCharCount = 0;
          const state = this.compositionManager.getState();

          // 초성/중성/종성 조합 처리
          if (type === "initial") {
            // 이미 조합 중이면 완성하고 새로 시작
            if (state.initial || state.medial || state.final) {
              shouldReplace = true;
              // 이전에 삽입된 텍스트의 길이만큼 삭제
              replaceCharCount = this.inputHandler.getLastInsertedLength() || 1;
            }
            text = this.compositionManager.addInitial(item);
          } else if (type === "medial") {
            // 초성이 있으면 조합 (기존 초성 삭제 후 초성+중성 조합)
            if (state.initial) {
              shouldReplace = true;
              // 이전에 삽입된 초성의 길이만큼 삭제 (일반적으로 1글자)
              replaceCharCount = this.inputHandler.getLastInsertedLength() || 1;
              text = this.compositionManager.addMedial(item);
            } else {
              // 초성이 없으면 중성만 입력
              text = item;
            }
          } else if (type === "final") {
            // 초성+중성이 있으면 조합 (기존 초성+중성 삭제 후 초성+중성+종성 조합)
            if (state.initial && state.medial) {
              shouldReplace = true;
              // 이전에 삽입된 초성+중성 조합 글자의 길이만큼 삭제
              // 조합형 자모일 수도 있고 완성형 글자일 수도 있으므로 실제 삽입된 길이 사용
              replaceCharCount = this.inputHandler.getLastInsertedLength() || 1;
              text = this.compositionManager.addFinal(item);
            } else {
              // 초성+중성이 없으면 종성만 입력
              text = item;
            }
          }

          this.inputHandler.insertText(text, shouldReplace, replaceCharCount);
        }, 0);
      });

      // 우클릭 시 복사
      button.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.inputHandler.copyToClipboard(item);
        if (this.onCopy) {
          this.onCopy(item);
        }
      });

      grid.appendChild(button);
    });

    section.appendChild(grid);
    return section;
  }

  private applyStyles(): void {
    if (document.getElementById("old-hangul-input-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "old-hangul-input-styles";
    style.textContent = `
      .old-hangul-input-panel {
        padding: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        max-width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        color: #1a1a1a;
        font-family: 'Pretendard', 'YetHangul', '맑은고딕', '나눔고딕', '돋움', dotum, '새굴림', sans-serif;
      }

      .old-hangul-section {
        margin-bottom: 24px;
      }

      .old-hangul-section-title {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .old-hangul-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
        gap: 8px;
      }

      .old-hangul-item,
      button.old-hangul-item {
        padding: 12px;
        font-size: 18px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #fff;
        color: #1a1a1a;
        cursor: pointer;
        transition: all 0.2s;
        user-select: none;
        font-family: 'Pretendard', 'YetHangul', '맑은고딕', '나눔고딕', '돋움', dotum, '새굴림', sans-serif;
      }

      .old-hangul-item:hover,
      button.old-hangul-item:hover {
        background: #f0f0f0;
        border-color: #999;
        transform: translateY(-1px);
        color: #1a1a1a;
      }

      .old-hangul-item:active,
      button.old-hangul-item:active {
        background: #e0e0e0;
        transform: translateY(0);
        color: #1a1a1a;
      }
      
      .old-hangul-input-panel button.old-hangul-item {
        color: #1a1a1a;
      }
    `;

    document.head.appendChild(style);
  }

  destroy(): void {
    this.container.innerHTML = "";
  }
}
