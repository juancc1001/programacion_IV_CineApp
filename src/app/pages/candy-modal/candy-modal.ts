import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { Button } from '../../ui/button/button';

@Component({
  imports: [Button],
  selector: 'app-candy-modal',
  styleUrl: './candy-modal.scss',
  templateUrl: './candy-modal.html',
})
export class CandyModal {
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);

  irAPagar() {
    this.close();
    this.router.navigate(['/carrito']);
  }

  close() {
    this.modalService.close();
  }
}
