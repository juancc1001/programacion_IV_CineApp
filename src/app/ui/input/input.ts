import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  imports: [],
  selector: 'app-input',
  styleUrl: './input.scss',
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() borderColor = 'primary';
  @Input() type = 'text';

  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => {};
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

  onInput(value: string): void {
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
