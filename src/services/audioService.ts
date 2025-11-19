// Audio Service - Multilingual TTS Support
// Clean, simple audio service for questions, answers, and explanations

type Language = 'en' | 'nl' | 'ar';

class AudioService {
  private synth = window.speechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isEnabled = true;
  private volume = 0.9;
  private rate = 0.85;

  speak(text: string, language: Language): void {
    if (!this.isEnabled) return;
    
    this.stop();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.getLangCode(language);
    utterance.voice = this.getVoice(language);
    utterance.rate = this.rate;
    utterance.pitch = 1.0;
    utterance.volume = this.volume;

    utterance.onerror = (e) => {
      console.error('Audio error:', e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop(): void {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setRate(rate: number): void {
    this.rate = Math.max(0.5, Math.min(2, rate));
  }

  private getLangCode(lang: Language): string {
    const codes: Record<Language, string> = {
      en: 'en-GB',
      nl: 'nl-NL',
      ar: 'ar-SA'
    };
    return codes[lang] || 'en-GB';
  }

  private getVoice(lang: Language): SpeechSynthesisVoice | null {
    const voices = this.synth.getVoices();
    const langCode = this.getLangCode(lang);
    
    // Try to find native female voice
    let voice = voices.find(v => {
      const isLang = v.lang.startsWith(langCode);
      const isFemale = v.name.toLowerCase().includes('female') ||
                      v.name.toLowerCase().includes('samantha') ||
                      v.name.toLowerCase().includes('claire') ||
                      v.name.toLowerCase().includes('sarah') ||
                      v.name.toLowerCase().includes('lisa') ||
                      v.name.toLowerCase().includes('anna') ||
                      v.name.toLowerCase().includes('nora') ||
                      v.name.toLowerCase().includes('ellen');
      return isLang && isFemale;
    });

    // Fallback to any voice in language
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(langCode));
    }

    return voice || null;
  }
}

export const audioService = new AudioService();

