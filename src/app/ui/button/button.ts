import { Component, Input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-button',
  styleUrl: './button.scss',
  templateUrl: './button.html',
})
export class Button {
  @Input() bg = 'primary';
  @Input() type: 'button' | 'submit' = 'button';

  get backgroundColor(): string {
    if (this.bg === 'primary') {
      return 'var(--color-primary)';
    }

    if (this.bg === 'secondary') {
      return 'var(--color-secondary)';
    }

    return this.bg;
  }
}
