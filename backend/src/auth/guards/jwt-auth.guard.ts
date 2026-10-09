import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request =
      context.switchToHttp().getRequest();

    const authorization =
      request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        "Authentication token is required",
      );
    }

    const [type, token] =
      authorization.split(" ");

    if (
      type !== "Bearer" ||
      !token
    ) {
      throw new UnauthorizedException(
        "Invalid authorization header",
      );
    }

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET is not configured",
      );
    }

    try {
      const payload =
        jwt.verify(token, secret);

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        "Invalid or expired authentication token",
      );
    }
  }
}