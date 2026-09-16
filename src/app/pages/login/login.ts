import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { InputComponent } from '../../ui/input/input';
import { Button } from '../../ui/button/button';

@Component({
  imports: [FormsModule, InputComponent, Button],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);

  email = '';
  password = '';

  onSubmit(): void {
    this.authService.signIn(this.email, this.password).then(() => this.close());
  }

  close(): void {
    this.modalService.close();
  }
}
