import { Component, inject, signal } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { Button } from '../../ui/button/button';
import { VoucherService } from '../../services/voucher.service';

@Component({
  imports: [Button],
  selector: 'app-welcome-modal',
  styleUrl: './welcome-modal.scss',
  templateUrl: './welcome-modal.html',
})
export class WelcomeModal {
  private readonly modalService = inject(ModalService);
  private readonly voucherService = inject(VoucherService);

  discount = signal(20);

  constructor() {
    this.loadDiscount();
  }

  async loadDiscount() {
    const voucher = await this.voucherService.getVoucherByCode('WELCOME');
    if (voucher?.discount_percentage) this.discount.set(voucher.discount_percentage);
  }

  close() {
    this.modalService.close();
  }
}
