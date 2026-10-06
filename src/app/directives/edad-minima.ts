import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthService } from '../services/auth.service';

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

    const [anio, mes, dia] = usuario.birthdate.split('-').map(Number);
    const cumpleEdadMinima = new Date(anio + edadMinima, mes - 1, dia);
    // compara la fecha de edad minima con la fecha actual
    return cumpleEdadMinima <= new Date();
  }
}
