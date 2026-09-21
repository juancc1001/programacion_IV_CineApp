import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { IsAdmin } from '../../directives/is-admin';
import { Login } from '../../pages/login/login';

@Component({
  imports: [IsAdmin, RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly modalService = inject(ModalService);
  protected readonly authService = inject(AuthService);
  protected readonly loginModal = Login;
}
