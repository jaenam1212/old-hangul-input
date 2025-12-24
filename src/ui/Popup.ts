import { InputHandler, IInputHandler } from '../core/InputHandler';
import { OldHangulInputOptions } from '../types';
import { oldHangulData } from '../data/oldHangulData';

export class Popup {
  private popupWindow: Window | null = null;
  private inputHandler: InputHandler;
  private options: OldHangulInputOptions;
  private messageHandler?: (event: MessageEvent) => void;

  constructor(inputHandler: InputHandler, options: OldHangulInputOptions) {
    this.inputHandler = inputHandler;
    this.options = options;
  }

  open(): void {
    if (this.popupWindow && !this.popupWindow.closed) {
      this.popupWindow.focus();
      return;
    }

    const width = 700;
    const height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    this.popupWindow = window.open(
      '',
      'oldHangulInput',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!this.popupWindow) {
      alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
      return;
    }

    // 팝업 창에 HTML 렌더링
    this.renderPopupContent();

    // 부모 창에서 메시지 수신
    this.messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'insertText') {
        this.inputHandler.insertText(
          event.data.text,
          event.data.replaceLast || false,
          event.data.replaceCharCount || 0
        );
      }
    };
    window.addEventListener('message', this.messageHandler);

    // 팝업 창이 닫힐 때 정리
    const checkClosed = setInterval(() => {
      if (this.popupWindow?.closed) {
        clearInterval(checkClosed);
        this.popupWindow = null;
        if (this.messageHandler) {
          window.removeEventListener('message', this.messageHandler);
        }
      }
    }, 100);
  }

  private renderPopupContent(): void {
    if (!this.popupWindow) return;

    const doc = this.popupWindow.document;
    const initials = JSON.stringify(oldHangulData.initials);
    const medials = JSON.stringify(oldHangulData.medials);
    const finals = JSON.stringify(oldHangulData.finals);
    const words = JSON.stringify(oldHangulData.words);

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>옛한글 입력기</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Pretendard', 'YetHangul', '맑은고딕', '나눔고딕', '돋움', dotum, '새굴림', sans-serif;
            background: #f5f5f5;
          }
          .old-hangul-input-panel {
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 100%;
            max-height: calc(100vh - 40px);
            overflow-y: auto;
            font-family: 'Pretendard', 'YetHangul', '맑은고딕', '나눔고딕', '돋움', dotum, '새굴림', sans-serif;
          }
          .old-hangul-section {
            margin-bottom: 24px;
          }
          .old-hangul-section-title {
            margin: 0 0 12px 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
          .old-hangul-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
            gap: 8px;
          }
          .old-hangul-item {
            padding: 12px;
            font-size: 18px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fff;
            cursor: pointer;
            transition: all 0.2s;
            user-select: none;
            font-family: 'Pretendard', 'YetHangul', '맑은고딕', '나눔고딕', '돋움', dotum, '새굴림', sans-serif;
          }
          .old-hangul-item:hover {
            background: #f0f0f0;
            border-color: #999;
            transform: translateY(-1px);
          }
          .old-hangul-item:active {
            background: #e0e0e0;
            transform: translateY(0);
          }
        </style>
      </head>
      <body>
        <div id="old-hangul-popup-container" class="old-hangul-input-panel"></div>
        <script>
          (function() {
            const initials = ${initials};
            const medials = ${medials};
            const finals = ${finals};
            const words = ${words};
            
            const container = document.getElementById('old-hangul-popup-container');
            
            // 조합 상태 관리
            let compositionState = { initial: '', medial: '', final: '' };
            
            function combine() {
              if (!compositionState.initial) return '';
              if (!compositionState.medial) return compositionState.initial;
              
              const INITIALS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
              const MEDIALS = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
              const FINALS = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
              
              // 코드 포인트로 기본 자모 범위 확인
              const initialCode = compositionState.initial.charCodeAt(0);
              const medialCode = compositionState.medial.charCodeAt(0);
              const finalCode = compositionState.final ? compositionState.final.charCodeAt(0) : 0;
              
              // 기본 자모 범위인지 확인 (초성: U+1100~U+1112, 중성: U+1161~U+1175, 종성: U+11A8~U+11C2)
              const isBasicInitial = initialCode >= 0x1100 && initialCode <= 0x1112;
              const isBasicMedial = medialCode >= 0x1161 && medialCode <= 0x1175;
              const isBasicFinal = !compositionState.final || (finalCode >= 0x11a8 && finalCode <= 0x11c2);
              
              // 기본 자모만 사용하는 경우 완성형으로 조합
              if (isBasicInitial && isBasicMedial && isBasicFinal) {
                // 옛한글을 현대 한글로 변환 (간단한 매핑)
                const normalizeConsonant = (char) => {
                  const map = { 'ㆁ': 'ㅇ', 'ㆆ': 'ㅎ', 'ㅿ': 'ㅅ' };
                  return map[char] || char;
                };
                const normalizeVowel = (char) => {
                  const map = { 'ㆍ': 'ㅏ', 'ㆎ': 'ㅐ' };
                  return map[char] || char;
                };
                
                const normalizedInitial = normalizeConsonant(compositionState.initial);
                const normalizedMedial = normalizeVowel(compositionState.medial);
                
                const initialIndex = INITIALS.indexOf(normalizedInitial);
                const medialIndex = MEDIALS.indexOf(normalizedMedial);
                
                if (initialIndex === -1 || medialIndex === -1) {
                  return compositionState.initial + compositionState.medial + (compositionState.final || '');
                }
                
                let finalIndex = 0;
                if (compositionState.final) {
                  const normalizedFinal = normalizeConsonant(compositionState.final);
                  finalIndex = FINALS.indexOf(normalizedFinal);
                  if (finalIndex === -1) finalIndex = 0;
                }
                
                const code = 0xAC00 + (initialIndex * 588) + (medialIndex * 28) + finalIndex;
                return String.fromCharCode(code);
              }
              
              // 확장 자모인 경우 직접 연결
              return compositionState.initial + compositionState.medial + (compositionState.final || '');
            }
            
            function createSection(title, items, type) {
              const section = document.createElement('div');
              section.className = 'old-hangul-section';
              
              const titleEl = document.createElement('h3');
              titleEl.className = 'old-hangul-section-title';
              titleEl.textContent = title;
              section.appendChild(titleEl);
              
              const grid = document.createElement('div');
              grid.className = 'old-hangul-grid';
              
              items.forEach(item => {
                const button = document.createElement('button');
                button.className = 'old-hangul-item';
                button.textContent = item;
                
                button.addEventListener('click', function(e) {
                  e.preventDefault();
                  let text = item;
                  let shouldReplace = false;
                  let replaceCharCount = 0;
                  
                  if (type === 'initial') {
                    // 이미 조합 중이면 완성하고 새로 시작
                    if (compositionState.initial || compositionState.medial || compositionState.final) {
                      const completed = combine();
                      compositionState = { initial: item, medial: '', final: '' };
                      text = completed + item;
                      shouldReplace = false; // 새 글자 추가
                    } else {
                      compositionState.initial = item;
                      text = item;
                      shouldReplace = false;
                    }
                  } else if (type === 'medial') {
                    if (!compositionState.initial) {
                      text = item;
                      shouldReplace = false;
                    } else if (compositionState.medial) {
                      // 이미 중성이 있으면 완성하고 새로 시작
                      const completed = combine();
                      compositionState = { initial: '', medial: item, final: '' };
                      text = completed + item;
                      shouldReplace = false;
                    } else {
                      // 초성 + 중성 조합 (기존 초성 삭제)
                      compositionState.medial = item;
                      text = combine();
                      shouldReplace = true;
                      replaceCharCount = 1; // 초성 1글자 삭제
                    }
                  } else if (type === 'final') {
                    if (!compositionState.initial || !compositionState.medial) {
                      text = item;
                      shouldReplace = false;
                    } else if (compositionState.final) {
                      // 이미 종성이 있으면 완성하고 새로 시작
                      const completed = combine();
                      compositionState = { initial: '', medial: '', final: item };
                      text = completed + item;
                      shouldReplace = false;
                    } else {
                      // 초성 + 중성 + 종성 조합 (기존 글자 삭제)
                      compositionState.final = item;
                      text = combine();
                      shouldReplace = true;
                      replaceCharCount = 1; // 초성+중성 조합 글자 1글자 삭제
                    }
                  }
                  
                  if (window.opener) {
                    window.opener.postMessage({
                      type: 'insertText',
                      text: text,
                      replaceLast: shouldReplace,
                      replaceCharCount: replaceCharCount
                    }, '*');
                  }
                });
                
                button.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(item);
                  } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = item;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                  }
                });
                
                grid.appendChild(button);
              });
              
              section.appendChild(grid);
              return section;
            }
            
            container.appendChild(createSection('초성', initials, 'initial'));
            container.appendChild(createSection('중성', medials, 'medial'));
            container.appendChild(createSection('종성', finals, 'final'));
            container.appendChild(createSection('단어', words));
          })();
        </script>
      </body>
      </html>
    `);
    doc.close();
  }

  close(): void {
    if (this.popupWindow && !this.popupWindow.closed) {
      this.popupWindow.close();
      this.popupWindow = null;
    }
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
    }
  }

  destroy(): void {
    this.close();
  }
}
