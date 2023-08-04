import { CanActivate, ExecutionContext, mixin } from '@nestjs/common';
import { Observable } from 'rxjs';

export const HasRoleGuard = (...roles: string[]) => {
  class HasRoleGuard implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const userRole = context.switchToHttp().getRequest()?.user?.roles;
      return roles.includes(userRole);
    }
  }

  const hasRole = mixin(HasRoleGuard);
  return hasRole;
};
