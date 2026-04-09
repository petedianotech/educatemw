import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../core/services/gemini.service';
import { MatIconModule } from '@angular/material/icon';
import { marked } from 'marked';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-white">
      <!-- Header -->
      <header class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white z-10">
        <div>
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <mat-icon class="text-emerald-500">smart_toy</mat-icon>
            AI Tutor
          </h2>
          <p class="text-sm text-gray-500">Your personal learning assistant</p>
        </div>
        <button (click)="gemini.clearHistory()" class="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50">
          <mat-icon class="text-sm">delete_outline</mat-icon>
          Clear Chat
        </button>
      </header>

      <!-- Chat Area -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50" #scrollContainer>
        @if (gemini.messages().length === 0) {
          <div class="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <mat-icon class="!w-8 !h-8 !text-[32px]">school</mat-icon>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">How can I help you learn today?</h3>
            <p class="text-gray-500">Ask me to explain a concept, help with a math problem, or quiz you on a topic.</p>
          </div>
        }

        @for (msg of gemini.messages(); track msg.id) {
          <div class="flex gap-4 max-w-3xl mx-auto" [class.flex-row-reverse]="msg.role === 'user'">
            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
                 [class.bg-emerald-100]="msg.role === 'model'"
                 [class.text-emerald-600]="msg.role === 'model'"
                 [class.bg-gray-200]="msg.role === 'user'"
                 [class.text-gray-600]="msg.role === 'user'">
              <mat-icon class="text-sm">{{msg.role === 'model' ? 'smart_toy' : 'person'}}</mat-icon>
            </div>
            <div class="flex-1 px-4 py-3 rounded-2xl shadow-sm"
                 [class.bg-white]="msg.role === 'model'"
                 [class.border]="msg.role === 'model'"
                 [class.border-gray-200]="msg.role === 'model'"
                 [class.bg-emerald-600]="msg.role === 'user'"
                 [class.text-white]="msg.role === 'user'">
              @if (msg.role === 'model') {
                <div class="prose prose-sm max-w-none prose-emerald" [innerHTML]="parseMarkdown(msg.content)"></div>
              } @else {
                <p class="whitespace-pre-wrap">{{msg.content}}</p>
              }
            </div>
          </div>
        }

        @if (gemini.isLoading()) {
          <div class="flex gap-4 max-w-3xl mx-auto">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mt-1">
              <mat-icon class="text-sm">smart_toy</mat-icon>
            </div>
            <div class="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm flex items-center gap-2">
              <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white border-t border-gray-200">
        <div class="max-w-3xl mx-auto relative">
          <textarea 
            [(ngModel)]="inputText"
            (keydown.enter)="handleEnter($event)"
            placeholder="Ask your tutor anything..."
            class="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none outline-none transition-all"
            rows="1"
            style="min-height: 48px; max-height: 120px;"
          ></textarea>
          <button 
            (click)="sendMessage()"
            [disabled]="!inputText().trim() || gemini.isLoading()"
            class="absolute right-2 bottom-2 p-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
            <mat-icon class="text-sm">send</mat-icon>
          </button>
        </div>
        <p class="text-center text-xs text-gray-400 mt-2">AI can make mistakes. Verify important information.</p>
      </div>
    </div>
  `
})
export class ChatComponent {
  gemini = inject(GeminiService);
  inputText = signal('');
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    effect(() => {
      // Trigger scroll when messages change
      this.gemini.messages();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  parseMarkdown(content: string): string {
    // marked.parse returns a string or Promise. We assume string for basic usage.
    return marked.parse(content) as string;
  }

  handleEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (!e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    if (!this.inputText().trim() || this.gemini.isLoading()) return;
    this.gemini.sendMessage(this.inputText());
    this.inputText.set('');
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
