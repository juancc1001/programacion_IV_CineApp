import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  imports: [],
  selector: 'app-multiselect',
  styleUrl: './multiselect.scss',
  templateUrl: './multiselect.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Multiselect),
      multi: true,
    },
  ],
})
export class Multiselect implements ControlValueAccessor {
  @Input() options: string[] = [];
  @Input() placeholder = '';
  @Input() borderColor = 'primary';

  value: string[] = [];
  open = false;
  disabled = false;

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  get borderColorValue(): string {
    if (this.borderColor === 'primary') {
      return 'var(--color-primary)';
    }

    if (this.borderColor === 'secondary') {
      return 'var(--color-secondary)';
    }

    return this.borderColor;
  }

  get label(): string {
    return this.value.length ? this.value.join(', ') : this.placeholder;
  }

  toggleOpen(): void {
    this.open = !this.open;
    this.onTouched();
  }

  toggleOption(option: string): void {
    this.value = this.value.includes(option)
      ? this.value.filter((selected) => selected !== option)
      : [...this.value, option];
    this.onChange(this.value);
  }

  writeValue(value: string[]): void {
    this.value = value ?? [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
