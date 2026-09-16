import { Injectable, Type, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  readonly activeModal = signal<Type<unknown> | null>(null);

  open(modal: Type<unknown>): void {
    this.activeModal.set(modal);
  }

  close(): void {
    this.activeModal.set(null);
  }
}
