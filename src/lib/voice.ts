// Voice input/output utilities
// Note: This is a basic implementation. For production, consider using Web Speech API or dedicated services

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting voice recording:', error);
      throw new Error('Unable to access microphone. Please check permissions.');
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
      this.stream?.getTracks().forEach(track => track.stop());
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

export class VoicePlayer {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  async playAudio(audioData: string): Promise<void> {
    try {
      // Stop any currently playing audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      // Create audio element and play
      const audio = new Audio(audioData);
      this.currentAudio = audio;
      
      return new Promise((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Audio playback failed'));
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      throw new Error('Unable to play audio');
    }
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  isPlaying(): boolean {
    return !!(this.currentAudio && !this.currentAudio.paused);
  }
}

// Text-to-Speech using Web Speech API
export class TextToSpeech {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices(): void {
    this.voices = this.synth.getVoices();
    
    // Reload voices if not available initially
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  speak(text: string, language: string = 'en'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select appropriate voice based on language
      const voice = this.voices.find(v => 
        v.lang.startsWith(language) || 
        (language === 'hi' && v.lang.includes('hi'))
      );
      
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synth.speak(utterance);
    });
  }

  stop(): void {
    this.synth.cancel();
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }
}

// Speech-to-Text using Web Speech API
export class SpeechToText {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(language: string = 'en-US'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isListeningTo(): boolean {
    return this.isListening;
  }
}
