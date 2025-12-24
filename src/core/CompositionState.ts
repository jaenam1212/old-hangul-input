// 초성/중성/종성 조합 상태 관리
import { composeHangul } from '../utils/hangulComposer';

export interface CompositionState {
  initial: string; // 현재 입력 중인 초성
  medial: string; // 현재 입력 중인 중성
  final: string; // 현재 입력 중인 종성
}

export class CompositionManager {
  private state: CompositionState = {
    initial: '',
    medial: '',
    final: '',
  };

  // 초성 추가
  addInitial(initial: string): string {
    // 이미 조합이 시작된 경우 완성하고 새로 시작
    if (this.state.initial || this.state.medial || this.state.final) {
      const completed = this.complete();
      this.reset();
      this.state.initial = initial;
      // 완성된 글자 + 새 초성
      return completed + initial;
    }
    this.state.initial = initial;
    // 초성만 입력 (아직 조합 안 함)
    return initial;
  }

  // 중성 추가
  addMedial(medial: string): string {
    if (!this.state.initial) {
      // 초성이 없으면 중성만 입력
      return medial;
    }

    if (this.state.medial) {
      // 이미 중성이 있으면 완성하고 새로 시작
      const completed = this.complete();
      this.reset();
      this.state.initial = '';
      this.state.medial = medial;
      return completed + medial;
    }

    this.state.medial = medial;
    // 초성 + 중성 조합 (기존 초성 교체)
    const result = this.combine();
    return result;
  }

  // 종성 추가
  addFinal(final: string): string {
    if (!this.state.initial || !this.state.medial) {
      // 초성+중성이 없으면 종성만 입력
      return final;
    }

    if (this.state.final) {
      // 이미 종성이 있으면 완성하고 새로 시작
      const completed = this.complete();
      this.reset();
      this.state.initial = '';
      this.state.final = final;
      return completed + final;
    }

    this.state.final = final;
    // 초성 + 중성 + 종성 조합 (기존 글자 교체)
    const result = this.combine();
    return result;
  }

  // 현재 상태로 조합
  private combine(): string {
    if (!this.state.initial) return '';

    // 중성이 없으면 초성만 반환
    if (!this.state.medial) {
      return this.state.initial;
    }

    // composeHangul 함수가 기본 자모는 완성형으로, 확장 자모는 연결로 처리
    const composed = composeHangul(this.state.initial, this.state.medial, this.state.final || '');
    return composed || this.state.initial + (this.state.medial || '') + (this.state.final || '');
  }

  // 조합 완성
  complete(): string {
    const result = this.combine();
    this.reset();
    return result;
  }

  // 상태 초기화
  reset(): void {
    this.state = {
      initial: '',
      medial: '',
      final: '',
    };
  }

  // 현재 조합 상태 가져오기
  getState(): CompositionState {
    return { ...this.state };
  }
}
