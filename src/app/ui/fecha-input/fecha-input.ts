import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  imports: [],
  selector: 'app-fecha-input',
  styleUrl: './fecha-input.scss',
  templateUrl: './fecha-input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FechaInput),
      multi: true,
    },
  ],
})
export class FechaInput implements ControlValueAccessor {
  @Input() tipo: 'fecha' | 'hora' = 'fecha';

  texto = '';
  disabled = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  get placeholder(): string {
    return this.tipo === 'fecha' ? 'dd/mm/aaaa' : 'hh:mm';
  }

  onInput(input: HTMLInputElement): void {
    const largo = this.tipo === 'fecha' ? 8 : 4;
    //borra texto y deja digitos hasta largo máximo
    const digitos = input.value.replace(/\D/g, '').slice(0, largo);

    this.texto = this.tipo === 'fecha' ? formatearFecha(digitos) : formatearHora(digitos);
    input.value = this.texto;
    this.onChange(this.tipo === 'fecha' ? aFechaBase(digitos) : aHoraBase(digitos));
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string | null): void {
    if (!value) {
      this.texto = '';
      return;
    }

    if (this.tipo === 'fecha') {
      const [anio, mes, dia] = value.split('-');
      this.texto = `${dia}/${mes}/${anio}`;
    } else {
      this.texto = value.slice(0, 5);
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

function formatearFecha(digitos: string): string {
  if (digitos.length > 4) {
    return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
  }

  if (digitos.length > 2) {
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  }

  return digitos;
}

function formatearHora(digitos: string): string {
  return digitos.length > 2 ? `${digitos.slice(0, 2)}:${digitos.slice(2)}` : digitos;
}

function aFechaBase(digitos: string): string | null {
  if (digitos.length < 8) {
    return null;
  }

  const dia = Number(digitos.slice(0, 2));
  const mes = Number(digitos.slice(2, 4));
  const fecha = new Date(Number(digitos.slice(4)), mes - 1, dia);

  // descarta fechas como 31/02
  if (fecha.getDate() !== dia || fecha.getMonth() !== mes - 1) {
    return null;
  }

  return `${digitos.slice(4)}-${digitos.slice(2, 4)}-${digitos.slice(0, 2)}`;
}

function aHoraBase(digitos: string): string | null {
  if (digitos.length < 4) {
    return null;
  }

  if (Number(digitos.slice(0, 2)) > 23 || Number(digitos.slice(2)) > 59) {
    return null;
  }

  return `${digitos.slice(0, 2)}:${digitos.slice(2)}`;
}
