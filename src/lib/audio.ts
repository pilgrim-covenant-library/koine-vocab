/**
 * Greek Audio Pronunciation using Web Speech API
 */

let speechSynthesis: SpeechSynthesis | null = null;
let greekVoice: SpeechSynthesisVoice | null = null;

/**
 * Initialize speech synthesis and find Greek voice
 */
export function initializeSpeech(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    speechSynthesis = window.speechSynthesis;

    const findGreekVoice = () => {
      const voices = speechSynthesis?.getVoices() || [];

      // Try to find a Greek voice
      greekVoice = voices.find(
        (voice) =>
          voice.lang.startsWith('el') || // Greek
          voice.lang === 'el-GR' ||
          voice.name.toLowerCase().includes('greek')
      ) || null;

      // If no Greek voice, use a fallback that handles Unicode well
      if (!greekVoice) {
        greekVoice = voices.find(
          (voice) => voice.lang === 'en-US' || voice.lang === 'en-GB'
        ) || voices[0] || null;
      }

      resolve(!!greekVoice);
    };

    // Voices may not be loaded immediately
    if (speechSynthesis?.getVoices().length) {
      findGreekVoice();
    } else {
      speechSynthesis?.addEventListener('voiceschanged', findGreekVoice, {
        once: true,
      });
      // Timeout fallback
      setTimeout(() => {
        if (!greekVoice) findGreekVoice();
      }, 1000);
    }
  });
}

/**
 * Speak Greek text using Web Speech API
 */
export function speakGreek(text: string, rate = 0.8): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!speechSynthesis) {
      reject(new Error('Speech synthesis not available'));
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (greekVoice) {
      utterance.voice = greekVoice;
    }

    // Configure for Greek pronunciation
    utterance.lang = 'el-GR';
    utterance.rate = rate; // Slower for learning
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(event.error));

    speechSynthesis.speak(utterance);
  });
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  speechSynthesis?.cancel();
}

/**
 * Greek letter to approximate English pronunciation guide
 */
const GREEK_PRONUNCIATION_MAP: Record<string, string> = {
  'α': 'ah',
  'β': 'b',
  'γ': 'g',
  'δ': 'd',
  'ε': 'eh',
  'ζ': 'z',
  'η': 'ay',
  'θ': 'th',
  'ι': 'ee',
  'κ': 'k',
  'λ': 'l',
  'μ': 'm',
  'ν': 'n',
  'ξ': 'ks',
  'ο': 'o',
  'π': 'p',
  'ρ': 'r',
  'σ': 's',
  'ς': 's',
  'τ': 't',
  'υ': 'oo',
  'φ': 'ph',
  'χ': 'ch',
  'ψ': 'ps',
  'ω': 'oh',
};

/**
 * Get simple pronunciation guide for a Greek word
 */
export function getPronunciationGuide(greek: string): string {
  return greek
    .toLowerCase()
    .split('')
    .map((char) => GREEK_PRONUNCIATION_MAP[char] || char)
    .join('');
}

/**
 * Audio state management for components
 */
export interface AudioState {
  isPlaying: boolean;
  isAvailable: boolean;
  error: string | null;
}

export function createAudioState(): AudioState {
  return {
    isPlaying: false,
    isAvailable: isSpeechAvailable(),
    error: null,
  };
}
