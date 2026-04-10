import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-50">
      <header class="px-6 py-4 border-b border-slate-200 bg-white/90 backdrop-blur-md z-10 shadow-sm">
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <mat-icon class="text-indigo-600">style</mat-icon>
          Flashcards
        </h2>
        <p class="text-sm text-slate-500 font-medium">Quick revision for MSCE subjects</p>
      </header>

      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (card of flashcards(); track card.id) {
              <div class="group h-64 [perspective:1000px]">
                <div class="relative h-full w-full rounded-3xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] cursor-pointer">
                  <!-- Front -->
                  <div class="absolute inset-0 h-full w-full rounded-3xl bg-white p-8 flex flex-col items-center justify-center text-center [backface-visibility:hidden] border border-slate-100">
                    <span class="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                      {{card.category}}
                    </span>
                    <h3 class="text-xl font-bold text-slate-900">{{card.front}}</h3>
                    <p class="mt-auto text-xs text-slate-400 font-bold uppercase tracking-widest">Hover to see answer</p>
                  </div>
                  <!-- Back -->
                  <div class="absolute inset-0 h-full w-full rounded-3xl bg-indigo-600 p-8 flex flex-col items-center justify-center text-center text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <mat-icon class="mb-4 scale-125">lightbulb</mat-icon>
                    <p class="text-lg font-medium leading-relaxed">{{card.back}}</p>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="col-span-full text-center py-12 text-gray-500">
                <mat-icon class="!w-12 !h-12 !text-[48px] mb-4 opacity-50">style</mat-icon>
                <p>No flashcards available yet.</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class FlashcardsComponent {
  flashcards = signal<Flashcard[]>([
    {
      id: '1',
      category: 'Biology',
      front: 'What is Osmosis?',
      back: 'The movement of water molecules from a region of higher water potential to a region of lower water potential through a partially permeable membrane.'
    },
    {
      id: '2',
      category: 'Physics',
      front: 'State Ohm\'s Law',
      back: 'The current flowing through a conductor is directly proportional to the potential difference across its ends, provided temperature and other physical conditions remain constant.'
    },
    {
      id: '3',
      category: 'Chemistry',
      front: 'What is an Isotope?',
      back: 'Atoms of the same element with the same number of protons but different number of neutrons.'
    },
    {
      id: '4',
      category: 'Geography',
      front: 'What is the Rift Valley?',
      back: 'A linear shaped lowland between several highlands or mountain ranges created by the action of a geologic rift or fault.'
    }
  ]);
}
