import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { cumpleEdad } from '../utils/edad';

@Directive({
  selector: '[edadMinima]',
})
export class EdadMinima {
  private readonly authService = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly edadMinima = input<number | null>(null);

  constructor() {
    effect(() => {
      this.viewContainerRef.clear();

      if (this.puedeVer()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    });
  }

  private puedeVer(): boolean {
    const edadMinima = this.edadMinima();
    const usuario = this.authService.userInformation();
    if (!edadMinima || !usuario) {
      return true;
    }

    return cumpleEdad(usuario.birthdate, edadMinima);
  }
}
