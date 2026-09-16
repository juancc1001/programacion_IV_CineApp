import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { IsAdmin } from '../../directives/is-admin';
import { Login } from '../../pages/login/login';

@Component({
  imports: [IsAdmin],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly modalService = inject(ModalService);
  protected readonly loginModal = Login;
}
