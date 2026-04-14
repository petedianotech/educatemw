import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'animate-pulse bg-slate-200 rounded ' + className"></div>
  `
})
export class SkeletonComponent {
  @Input() className = 'w-full h-4';
}
