// 한글 조합 유틸리티

// 초성 (자음) - 19개
const INITIALS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// 중성 (모음) - 21개
const MEDIALS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

// 종성 (자음) - 28개 (받침)
const FINALS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// 옛한글 자음 매핑 (현대 한글 자음으로 변환 - 조합형 자모가 아닌 경우만)
const OLD_CONSONANT_MAP: Record<string, string> = {
  'ㆁ': 'ㅇ',
  'ㆆ': 'ㅎ',
  'ㅿ': 'ㅅ'
};

// 옛한글 모음 매핑 (조합형 자모가 아닌 경우만)
const OLD_VOWEL_MAP: Record<string, string> = {
  'ㆍ': 'ㅏ',
  'ㆎ': 'ㅐ'
};

// 조합형 자모인지 확인 (옛한글 조합형 자모)
// 초성: U+1100-U+115F
// 중성: U+1160-U+11A7  
// 종성: U+11A8-U+11FF
function isCompatibilityJamo(char: string): boolean {
  const code = char.charCodeAt(0);
  // 조합형 자모 범위
  return (code >= 0x1100 && code <= 0x11FF);
}

// 조합형 자모인 경우 그대로 반환 (변환하지 않음)
function isOldHangulJamo(char: string): boolean {
  return isCompatibilityJamo(char);
}

// 조합형 자모의 타입 확인
function getJamoType(char: string): 'initial' | 'medial' | 'final' | null {
  if (!isOldHangulJamo(char)) return null;
  const code = char.charCodeAt(0);
  if (code >= 0x1100 && code <= 0x115F) return 'initial'; // 초성
  if (code >= 0x1160 && code <= 0x11A7) return 'medial';  // 중성
  if (code >= 0x11A8 && code <= 0x11FF) return 'final';   // 종성
  return null;
}

// 자음인지 확인
export function isConsonant(char: string): boolean {
  return INITIALS.includes(char) || Object.keys(OLD_CONSONANT_MAP).includes(char);
}

// 모음인지 확인
export function isVowel(char: string): boolean {
  return MEDIALS.includes(char) || Object.keys(OLD_VOWEL_MAP).includes(char);
}

// 옛한글 자음을 현대 한글 자음으로 변환
function normalizeConsonant(char: string): string {
  // 조합형 자모는 변환하지 않음 (그대로 사용)
  if (isOldHangulJamo(char)) {
    return char;
  }
  // 옛한글 자음이면 변환
  if (OLD_CONSONANT_MAP[char]) {
    return OLD_CONSONANT_MAP[char];
  }
  // 이미 현대 한글 자음이면 그대로 반환
  return char;
}

// 옛한글 모음을 현대 한글 모음으로 변환
function normalizeVowel(char: string): string {
  // 조합형 자모는 변환하지 않음 (그대로 사용)
  if (isOldHangulJamo(char)) {
    return char;
  }
  // 옛한글 모음이면 변환
  if (OLD_VOWEL_MAP[char]) {
    return OLD_VOWEL_MAP[char];
  }
  // 이미 현대 한글 모음이면 그대로 반환
  return char;
}

// 한글 글자에서 초성, 중성, 종성 분리
function decomposeHangul(char: string): { initial: string; medial: string; final: string } | null {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return null;
  
  const base = code - 0xAC00;
  const initialIndex = Math.floor(base / 588);
  const medialIndex = Math.floor((base % 588) / 28);
  const finalIndex = base % 28;
  
  return {
    initial: INITIALS[initialIndex] || '',
    medial: MEDIALS[medialIndex] || '',
    final: FINALS[finalIndex] || ''
  };
}

// 초성, 중성, 종성으로 한글 글자 조합
export function composeHangul(initial: string, medial: string, final: string = ''): string {
  if (!initial) return '';
  
  // 중성이 없으면 초성만 반환
  if (!medial) {
    return initial;
  }
  
  // 코드 포인트로 기본 자모 범위 확인
  const initialCode = initial.charCodeAt(0);
  const medialCode = medial.charCodeAt(0);
  const finalCode = final ? final.charCodeAt(0) : 0;
  
  // 기본 자모 범위인지 확인
  // 초성: U+1100~U+1112 (기본 초성)
  // 중성: U+1161~U+1175 (기본 중성)
  // 종성: U+11A8~U+11C2 (기본 종성) 또는 없음
  const isBasicInitial = initialCode >= 0x1100 && initialCode <= 0x1112;
  const isBasicMedial = medialCode >= 0x1161 && medialCode <= 0x1175;
  const isBasicFinal = !final || (finalCode >= 0x11a8 && finalCode <= 0x11c2);
  
  // 기본 자모만 사용하는 경우 완성형으로 조합
  if (isBasicInitial && isBasicMedial && isBasicFinal) {
    // 옛한글을 현대 한글로 변환
    const normalizedInitial = normalizeConsonant(initial);
    const normalizedMedial = normalizeVowel(medial);
    
    const initialIndex = INITIALS.indexOf(normalizedInitial);
    const medialIndex = MEDIALS.indexOf(normalizedMedial);
    
    // 인덱스를 찾지 못하면 그대로 연결
    if (initialIndex === -1 || medialIndex === -1) {
      return initial + medial + (final || '');
    }
    
    // 종성 처리
    let finalIndex = 0;
    if (final) {
      const normalizedFinal = normalizeConsonant(final);
      finalIndex = FINALS.indexOf(normalizedFinal);
      if (finalIndex === -1) {
        finalIndex = 0; // 종성을 찾을 수 없으면 종성 없음
      }
    }
    
    // 한글 유니코드 공식: (초성 × 588) + (중성 × 28) + 종성 + 0xAC00
    const code = 0xAC00 + (initialIndex * 588) + (medialIndex * 28) + finalIndex;
    return String.fromCharCode(code);
  }
  
  // 확장 자모인 경우 직접 연결 (조합형 자모 또는 옛한글)
  return initial + medial + (final || '');
}

// 자음과 모음을 조합하여 한글 글자 생성
export function combineHangul(lastChar: string, newChar: string): { text: string; shouldReplace: boolean } {
  // 조합형 자모 처리
  const lastJamoType = getJamoType(lastChar);
  const newJamoType = getJamoType(newChar);
  
  // 마지막 문자가 여러 자모로 구성된 조합형인 경우 (예: ᄀᆞ)
  const lastCharLastJamo = lastChar.length > 0 ? lastChar[lastChar.length - 1] : '';
  const lastCharLastJamoType = getJamoType(lastCharLastJamo);
  
  if (lastJamoType || newJamoType || lastCharLastJamoType) {
    // 조합형 자모가 포함된 경우
    if (lastJamoType === 'initial' && newJamoType === 'medial') {
      // 초성 + 중성 = 조합형으로 연결
      return { text: lastChar + newChar, shouldReplace: true };
    }
    if (lastJamoType === 'medial' && newJamoType === 'final') {
      // 중성 + 종성 = 조합형으로 연결
      return { text: lastChar + newChar, shouldReplace: true };
    }
    // 이미 조합형이 완성된 경우 (초성+중성 또는 초성+중성+종성) + 종성 추가
    if (lastCharLastJamoType === 'medial' && newJamoType === 'final') {
      // 초성+중성 조합 + 종성
      return { text: lastChar + newChar, shouldReplace: true };
    }
    if (lastJamoType === 'initial' && newJamoType === 'final') {
      // 초성 + 종성 (중성 없음) = 그대로 추가
      return { text: newChar, shouldReplace: false };
    }
  }
  
  // 마지막 문자가 한글 글자인 경우 분해
  const decomposed = decomposeHangul(lastChar);
  
  if (decomposed) {
    // 이미 완성된 글자가 있고, 새 문자가 자음이면 종성으로 추가
    if (isConsonant(newChar)) {
      if (!decomposed.final) {
        // 종성이 없으면 종성 추가
        const normalized = normalizeConsonant(newChar);
        const composed = composeHangul(decomposed.initial, decomposed.medial, normalized);
        if (composed) {
          return { text: composed, shouldReplace: true };
        }
      }
    }
    // 이미 완성된 글자이므로 그대로 추가
    return { text: newChar, shouldReplace: false };
  }
  
  // 마지막 문자가 자음인 경우
  if (isConsonant(lastChar)) {
    if (isVowel(newChar)) {
      // 자음 + 모음 = 새 글자 조합
      const normalizedConsonant = normalizeConsonant(lastChar);
      const normalizedVowel = normalizeVowel(newChar);
      const composed = composeHangul(normalizedConsonant, normalizedVowel);
      if (composed) {
        return { text: composed, shouldReplace: true };
      }
    }
  }
  
  // 마지막 문자가 모음인 경우 (이건 일반적이지 않지만 처리)
  if (isVowel(lastChar)) {
    if (isConsonant(newChar)) {
      // 모음 + 자음은 조합 불가 (초성이 필요)
      return { text: newChar, shouldReplace: false };
    }
  }
  
  // 조합 불가능하면 그대로 추가
  return { text: newChar, shouldReplace: false };
}

