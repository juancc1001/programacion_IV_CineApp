import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Roles } from '../../types/roles';

export function roleGuard(role: Roles): CanActivateFn {
  return async () => {
    const authService = inject(AuthService);
    const information = await authService.getUserInformation();
    
    return information?.role === role;
  };
}
