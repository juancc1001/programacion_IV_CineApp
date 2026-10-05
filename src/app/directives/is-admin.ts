import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Roles } from '../../types/roles';

@Directive({
  selector: '[isAdmin]',
})
export class IsAdmin {
  private readonly authService = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const isAdmin = this.authService.userInformation()?.role === Roles.Admin;

      this.viewContainerRef.clear();

      if (isAdmin) {
        //de dominio agrega al container el contenido de templateRef, que es el tag donde está
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    });
  }
}
