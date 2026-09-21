import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { InputComponent } from '../../ui/input/input';
import { Button } from '../../ui/button/button';
import { GrupoSanguineoLabel } from '../../../types/grupo-sanguineo';
import { ColorOjosLabel } from '../../../types/color-ojos';

@Component({
  imports: [FormsModule, InputComponent, Button],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);

  gruposSanguineos = Object.entries(GrupoSanguineoLabel).map(([value, placeholder]) => ({
    value: Number(value),
    label: placeholder,
  }));
  coloresOjos = Object.entries(ColorOjosLabel).map(([value, placeholder]) => ({
    value: Number(value),
    label: placeholder,
  }));

  email = '';
  password = '';
  isRegister = false;
  name = '';
  surname = '';
  birthdate = '';
  bloodType: number | null = null;
  eyesColor: number | null = null;
  vacationDays = '';

  toggleMode(): void {
    this.isRegister = !this.isRegister;
  }

  onSubmit(): void {
    const request = this.isRegister
      ? this.authService.signUp(this.email, this.password, {
          name: this.name || null,
          surname: this.surname || null,
          birthdate: this.birthdate || null,
          blood_type: this.bloodType,
          eyes_color: this.eyesColor,
          vacation_days: this.vacationDays === '' ? null : Number(this.vacationDays),
        })
      : this.authService.signIn(this.email, this.password);

    request.then(() => this.close());
  }

  close(): void {
    this.modalService.close();
  }
}
