import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('🛡️ JwtAuthGuard.canActivate() called');
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log(
      '🔑 Authorization header:',
      authHeader?.substring(0, 50) + '...',
    );

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.log('🚫 Authentication failed!');
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}
