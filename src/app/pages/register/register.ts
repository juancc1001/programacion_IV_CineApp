import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { GrupoSanguineoLabel } from '../../../types/grupo-sanguineo';
import { ColorOjosLabel } from '../../../types/color-ojos';
import { Login } from '../login/login';
import { InputComponent } from '../../ui/input/input';
import { Button } from '../../ui/button/button';
import { FechaInput } from '../../ui/fecha-input/fecha-input';

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

  email = new FormControl('', { nonNullable: true, validators: Validators.email });
  password = new FormControl('', { nonNullable: true, validators: Validators.required });
  confirmPassword = new FormControl('', { nonNullable: true, validators: [Validators.required,  Validators.pattern(this.password.value)]});
  name = new FormControl('', { nonNullable: true, validators: [ Validators.required, Validators.pattern(/^[a-zA-Z]+$/) ]});
  surname = new FormControl('', { nonNullable: true, validators: [ Validators.required, Validators.pattern(/^[a-zA-Z]+$/) ]});
  birthdate = new FormControl('', {validators: Validators.required });
  bloodType = new FormControl<number | null>(null, { nonNullable: true, validators: Validators.required });
  eyesColor = new FormControl<number | null>(null, { nonNullable: true, validators: Validators.required });
  vacationDays = new FormControl('', { nonNullable: true });

  toggleMode(): void {
    this.changeModalToLogin();
  }

  onSubmit(): void {
    if (this.email.invalid || this.password.invalid || this.confirmPassword.invalid || this.name.invalid || this.surname.invalid || this.birthdate.invalid || this.bloodType.invalid || this.eyesColor.invalid) return;

    const request = this.authService.signUp(this.email.value, this.password.value, {
          name: this.name.value || null,
          surname: this.surname.value || null,
          birthdate: this.birthdate.value || null,
          blood_type: this.bloodType.value || null,
          eyes_color: this.eyesColor.value || null,
          vacation_days: this.vacationDays.value === '' ? null : Number(this.vacationDays.value),
        });

    request.then(() => this.close());
  }

  close(): void {
    this.modalService.close();
  }

  changeModalToLogin(): void {
      this.modalService.close();
      this.modalService.open(this.registerModal);    
  }

}