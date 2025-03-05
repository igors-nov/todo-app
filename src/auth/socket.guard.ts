import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { List, ListProtection } from 'src/lists/entities/list.entity';
import { ListService } from 'src/lists/services/lists.service';

export const SocketGuard = (
  protectionRequired: ListProtection,
): Type<CanActivate> => {
  @Injectable()
  class SocketGuardMixin implements CanActivate {
    constructor(
      private jwtService: JwtService,
      @Inject(ListService)
      private readonly listService: ListService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const client: Socket = context.switchToWs().getClient();
      const token = client?.handshake?.auth?.accessToken as string;

      const request: { listId: string } = context.switchToWs().getData();

      try {
        const payload: Partial<List> = await this.jwtService.verifyAsync(
          token,
          {
            secret: process.env.JWT_SECRET || 'secret',
          },
        );

        if (payload.id === request.listId) {
          return true;
        }

        throw new UnauthorizedException();
      } catch {
        const list = await this.listService.findOneById(request.listId);

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
  }

  return mixin(SocketGuardMixin);
};
