import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extraire le token du header 
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    // Verifier et decoder le token
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      //  Attacher l'utilisateur decode a la requete pour que RolesGuard puisse lire request.user.role
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token invalide ou expire');
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}