import { Injectable, Logger } from '@nestjs/common';
import { users } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly userLogger = new Logger(UsersService.name);
  constructor(private prisma: PrismaService) {}

  async get_by_orcid(orcid_id: string): Promise<users | null> {
    try {
      return await this.prisma.users.findUnique({
        where: {
          orcid_id,
        },
        // TODO: Limit fields that are requested
        // Using the select property
      });
    } catch (e) {
      this.userLogger.error(e);
      return null;
    }
  }

  async get_by_cookie_token(cookie_token: string): Promise<users> {
    return await this.prisma.users.findUnique({
      where: {
        cookie_token,
      },
      // TODO: Limit fields that are requested
      // Using the select property
    });
  }

  async update_user_token_by_orcid(orcid_id: string, cookie_token: string) {
    const output = await this.prisma.users.update({
      data: {
        cookie_token,
      },
      where: {
        orcid_id,
      },
    });
    return output;
  }

  get_user_token(username: string) {
    this.prisma.users
      .findFirst({
        where: {
          username,
        },
        select: {
          jwt_token: true,
        },
      })
      .then((token) => {
        return token;
      })
      .catch((err) => {
        this.userLogger.error(
          `Token for username:${username}, not found or user doesn't exist `,
          err,
        );
      });
  }
}
