import { Component, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { GrupoSanguineoLabel } from '../../../types/grupo-sanguineo';
import { ColorOjosLabel } from '../../../types/color-ojos';
import { Login } from '../login/login';
import { InputComponent } from '../../ui/input/input';
import { Button } from '../../ui/button/button';
import { FechaInput } from '../../ui/fecha-input/fecha-input';
import { WelcomeModal } from '../welcome-modal/welcome-modal';

@Component({
  imports: [InputComponent, FormsModule, ReactiveFormsModule, Button, FechaInput],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly registerModal = Login;

  gruposSanguineos = Object.entries(GrupoSanguineoLabel).map(([value, placeholder]) => ({
    value: Number(value),
    label: placeholder,
  }));
  coloresOjos = Object.entries(ColorOjosLabel).map(([value, placeholder]) => ({
    value: Number(value),
    label: placeholder,
  }));

  email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  password = new FormControl('', { nonNullable: true, validators: Validators.required });
  confirmPassword = new FormControl('', { nonNullable: true, validators: Validators.required });
  name = new FormControl('', { nonNullable: true, validators: [ Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/) ]});
  surname = new FormControl('', { nonNullable: true, validators: [ Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/) ]});
  birthdate = new FormControl('', { nonNullable: true, validators: [ Validators.required ]});
  bloodType = new FormControl<number | null>(null, { nonNullable: true, validators: Validators.required });
  eyesColor = new FormControl<number | null>(null, { nonNullable: true, validators: Validators.required });
  vacationDays = new FormControl('', { nonNullable: true });
  error = signal<string | null>(null);

  toggleMode(): void {
    this.changeModalToLogin();
  }

  onSubmit(): void {
    if (this.email.invalid || this.password.invalid || this.confirmPassword.invalid || this.name.invalid || this.surname.invalid || this.birthdate.invalid || this.bloodType.invalid || this.eyesColor.invalid) {
      this.error.set('Completá todos los campos correctamente');
      return;
    }
    if (this.confirmPassword.value !== this.password.value) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }
    let fecha = new Date(this.birthdate.value);
    if (new Date(fecha) > new Date() || fecha < new Date('1900-01-01')) {
      this.error.set('La fecha de nacimiento no puede ser futura o anterior al 1900');
      return;
    }

    this.error.set(null);

    const request = this.authService.signUp(this.email.value, this.password.value, {
          name: this.name.value || null,
          surname: this.surname.value || null,
          birthdate: this.birthdate.value,
          blood_type: this.bloodType.value || null,
          eyes_color: this.eyesColor.value || null,
          vacation_days: this.vacationDays.value === '' ? null : Number(this.vacationDays.value),
        });

    request.then(({ error }) => {
      if (error) {
        this.error.set(error.message);
        return;
      }
      this.modalService.open(WelcomeModal);
    });
  }

  close(): void {
    this.modalService.close();
  }

  changeModalToLogin(): void {
      this.modalService.close();
      this.modalService.open(this.registerModal);    
  }

}