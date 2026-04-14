import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  async transform(value: string): Promise<string> {
    if (!value) return '';
    const { marked } = await import('marked');
    return marked.parse(value) as string;
  }
}
