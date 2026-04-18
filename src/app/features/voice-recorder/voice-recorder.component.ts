import { ChangeDetectionStrategy, Component, inject, signal, OnDestroy, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { VoiceRecorderService } from '../../core/services/voice-recorder.service';

@Component({
  selector: 'app-voice-recorder',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2">
      <!-- Recording State -->
      @if (isRecording()) {
        <button (click)="toggleRecording()" class="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center animate-pulse">
          <mat-icon>stop</mat-icon>
        </button>
        <span class="font-bold text-rose-600 tabular-nums">{{ formatTimer(timer()) }}</span>
      } 
      <!-- Preview State -->
      @else if (audioBlob()) {
        <button (click)="play()" class="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
          <mat-icon>{{ isPlaying() ? 'pause' : 'play_arrow' }}</mat-icon>
        </button>
        <button (click)="cancel()" class="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
          <mat-icon>close</mat-icon>
        </button>
        <button (click)="upload()" [disabled]="isUploading()" class="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center">
            <mat-icon>send</mat-icon>
        </button>
      }
      <!-- Default State -->
      @else {
        <button (click)="toggleRecording()" class="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all">
          <mat-icon>mic</mat-icon>
        </button>
      }
    </div>
  `
})
export class VoiceRecorderComponent implements OnDestroy {
  private authService = inject(AuthService);
  private voiceService = inject(VoiceRecorderService);

  uploaded = output<string>();
  
  isRecording = signal(false);
  timer = signal(0);
  audioBlob = signal<Blob | null>(null);
  audioUrl = signal<string | null>(null);
  isPlaying = signal(false);
  isUploading = signal(false);
  
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private audioPlayer: HTMLAudioElement | null = null;

  async toggleRecording() {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async startRecording() {
    this.audioBlob.set(null);
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, noiseSuppression: true } });
      const options = { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 16000 };
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      
      const chunks: Blob[] = [];
      this.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      this.mediaRecorder.onstop = () => {
        console.log('MediaRecorder onstop fired, chunks count:', chunks.length);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        console.log('Blob created, size:', blob.size);
        this.audioBlob.set(blob);
        this.audioUrl.set(URL.createObjectURL(blob));
      };
      
      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.timerInterval = setInterval(() => this.timer.update(t => t + 1), 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Could not access microphone.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording()) {
      this.mediaRecorder.stop();
      this.stream?.getTracks().forEach(track => track.stop());
      this.isRecording.set(false);
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
    }
  }

  play() {
    if (this.isPlaying()) {
      this.audioPlayer?.pause();
      this.isPlaying.set(false);
      return;
    }
    if (!this.audioUrl()) return;
    this.audioPlayer = new Audio(this.audioUrl()!);
    this.audioPlayer.onended = () => this.isPlaying.set(false);
    this.audioPlayer.play();
    this.isPlaying.set(true);
  }

  cancel() {
    this.audioBlob.set(null);
    this.timer.set(0);
  }

  async upload() {
    const blob = this.audioBlob();
    const user = this.authService.currentUser();
    console.log('Uploading audio, blob size:', blob?.size);
    if (!blob || !user) {
      console.log('Upload aborted: No blob or user found.');
      return;
    }

    this.isUploading.set(true);
    try {
      const url = await this.voiceService.uploadVoiceNote(user.uid, blob);
      console.log('Voice note uploaded, URL:', url);
      this.uploaded.emit(url);
      console.log('Event emitted.');
      this.cancel();
    } catch (error) {
      console.error('Error uploading voice note:', error);
      alert('Failed to upload voice note. Please try again.');
    } finally {
      this.isUploading.set(false);
    }
  }

  formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    this.stopRecording();
    this.audioPlayer?.pause();
  }
}
