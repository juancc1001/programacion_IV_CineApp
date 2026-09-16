import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Roles } from '../../../types/roles';

@Component({
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home {
  private readonly authService = inject(AuthService);

  readonly userInformation = this.authService.userInformation;

  get userFullName(): string {
    const information = this.userInformation();

    if (!information) {
      return 'Usuario';
    }

    const name = information.name ?? 'Usuario';
    const surname = information.surname ?? '';

    return `${name}${surname ? ` ${surname}` : ''}`.trim();
  }

  get roleLabel(): string {
    const information = this.userInformation();

    if (!information) {
      return 'Sin rol';
    }

    return information.role === Roles.Admin ? 'Administrador' : 'Cliente';
  }
}
