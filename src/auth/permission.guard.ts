import {
  Injectable,
  CanActivate,
  ExecutionContext,
  mixin,
  Type,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { List, ListProtection } from 'src/lists/entities/list.entity';
import { Request } from 'express';
import { ListService } from 'src/lists/services/lists.service';

export const PermissionGuard = (
  protectionRequired: ListProtection,
): Type<CanActivate> => {
  @Injectable()
  class PermissionGuardMixin extends AuthGuard implements CanActivate {
    constructor(
      protected reflector: Reflector,
      protected jwtService: JwtService,
      @Inject(ListService)
      private readonly listService: ListService,
    ) {
      super(jwtService);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request: Request = context.switchToHttp().getRequest();
      const isAuthenticated = await super.canActivate(context);
      if (isAuthenticated) {
        const listInJwt = request['list'] as Partial<List>;

        if (listInJwt.uniqueUrl === request.params.uniqueUrl) {
          return true;
        }
      }

      const list = await this.listService.findOne(request.params.uniqueUrl);

      if (
        (protectionRequired === ListProtection.FullAccess &&
          list.protection === ListProtection.FullAccess) ||
        (protectionRequired === ListProtection.ViewAccess &&
          list.protection !== ListProtection.PasswordProtected)
      ) {
        return true;
      }

      throw new UnauthorizedException();
    }
  }

  return mixin(PermissionGuardMixin);
};
