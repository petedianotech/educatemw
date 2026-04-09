import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-gray-50">
      <header class="px-6 py-4 border-b border-gray-200 bg-white z-10">
        <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
          <mat-icon class="text-gray-700">admin_panel_settings</mat-icon>
          Admin Dashboard
        </h2>
        <p class="text-sm text-gray-500">Manage platform content</p>
      </header>

      <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-3xl mx-auto">
          
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <mat-icon class="text-blue-500">add_circle</mat-icon>
              Upload New Material
            </h3>
            
            <div class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input id="title" type="text" [(ngModel)]="title" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select id="category" [(ngModel)]="category" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Past Paper">Past Paper</option>
                  </select>
                </div>
                
                <div class="flex items-center pt-6">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" [(ngModel)]="isProOnly" class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                    <span class="text-sm font-medium text-gray-700">Pro Only Content</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Content (Markdown supported)</label>
                <textarea id="content" [(ngModel)]="content" rows="8" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"></textarea>
              </div>
              
              <div class="flex justify-end pt-2">
                <button 
                  (click)="createNote()"
                  [disabled]="!title().trim() || !content().trim() || isSubmitting()"
                  class="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                  <mat-icon class="text-sm">cloud_upload</mat-icon>
                  Publish Material
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class AdminComponent {
  dataService = inject(DataService);
  
  title = signal('');
  category = signal('Mathematics');
  content = signal('');
  isProOnly = signal(false);
  isSubmitting = signal(false);

  async createNote() {
    if (!this.title().trim() || !this.content().trim() || this.isSubmitting()) return;
    
    this.isSubmitting.set(true);
    try {
      await this.dataService.createNote({
        title: this.title(),
        category: this.category(),
        content: this.content(),
        isProOnly: this.isProOnly()
      });
      
      // Reset form
      this.title.set('');
      this.content.set('');
      this.isProOnly.set(false);
      alert('Material published successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to publish material.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
