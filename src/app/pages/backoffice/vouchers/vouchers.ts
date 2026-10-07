import { Component, inject, signal } from '@angular/core';
import { Voucher, VoucherService } from '../../../services/voucher.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from '../../../ui/button/button';
import { Multiselect } from '../../../ui/multiselect/multiselect';

@Component({
  imports: [CommonModule, FormsModule, Button, Multiselect],
  selector: 'app-vouchers',
  templateUrl: './vouchers.html',
})
export class Vouchers {
  protected readonly voucherService = inject(VoucherService);
  private readonly authService = inject(AuthService);

  vouchers = signal<Voucher[]>([]);
  usuarioOptions = signal<string[]>([]);
  private userIdByLabel = new Map<string, string>();
  private labelByUserId = new Map<string, string>();

  newVoucher = this.emptyVoucher();
  usuario: string[] = [];
  editingId: number | null = null;
  showForm = false;

  constructor() {
    this.loadVouchers();
    this.loadUsuarios();
  }

  toggleForm() {
    if (this.editingId !== null) {
      this.newVoucher = this.emptyVoucher();
      this.usuario = [];
      this.editingId = null;
    }
    this.showForm = !this.showForm;
  }

  async loadVouchers() {
    this.vouchers.set(await this.voucherService.getVouchers());
  }

  async loadUsuarios() {
    for (const user of await this.authService.getUsers()) {
      if (!user.user_id) continue;
      const label = `${user.name ?? ''} ${user.surname ?? ''}`.trim();
      this.userIdByLabel.set(label, user.user_id);
      this.labelByUserId.set(user.user_id, label);
    }
    this.usuarioOptions.set([...this.userIdByLabel.keys()]);
  }

  usuarioLabel(userId: string | null) {
    return userId ? (this.labelByUserId.get(userId) ?? userId) : '';
  }

  // el multiselect permite varios, acá se fuerza uno como máximo
  selectUsuario(selected: string[]) {
    const last = selected.filter((option) => !this.usuario.includes(option)).at(-1);
    this.usuario = last ? [last] : selected;
  }

  editVoucher(voucher: Voucher) {
    if (this.editingId !== null) {
      this.newVoucher = this.emptyVoucher();
      this.usuario = [];
      this.editingId = null;
      this.showForm = false;
      return;
    }
    this.editingId = voucher.id;
    this.newVoucher = {
      code: voucher.code ?? '',
      discount_percentage: voucher.discount_percentage,
      max_discount: voucher.max_discount,
      min_age: voucher.min_age,
    };
    this.usuario = voucher.user_id ? [this.usuarioLabel(voucher.user_id)] : [];
    this.showForm = true;
  }

  async saveVoucher() {
    const voucher = { ...this.newVoucher, user_id: this.usuario.length ? this.userIdByLabel.get(this.usuario[0])! : null };

    if (this.editingId === null) {
      await this.voucherService.createVoucher(voucher);
    } else {
      await this.voucherService.updateVoucher(this.editingId, voucher);
    }

    this.newVoucher = this.emptyVoucher();
    this.usuario = [];
    this.editingId = null;
    await this.loadVouchers();
  }

  private emptyVoucher() {
    return {
      code: '',
      discount_percentage: 0,
      max_discount: null as number | null,
      min_age: null as number | null,
    };
  }
}
