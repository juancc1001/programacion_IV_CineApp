import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { InputComponent } from '../../ui/input/input';
import { Button } from '../../ui/button/button';
import { GrupoSanguineoLabel } from '../../../types/grupo-sanguineo';
import { ColorOjosLabel } from '../../../types/color-ojos';
import { Register } from '../register/register';

@Component({
  imports: [FormsModule, ReactiveFormsModule, InputComponent, Button],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly registerModal = Register;

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
  
  toggleMode(): void {
    this.changeModalToRegister();
  }

  onSubmit(): void {
    if (this.email.invalid) return;

    const request = this.authService.signIn(this.email.value, this.password.value);

    request.then(() => this.close());
  }

  close(): void {
    this.modalService.close();
  }

  changeModalToRegister(): void {
      this.modalService.close();
      this.modalService.open(this.registerModal);    
  }

}
