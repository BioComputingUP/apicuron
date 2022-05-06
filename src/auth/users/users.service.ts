import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, users } from '@prisma/client';
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

  create_user(user: Prisma.usersCreateInput) {
    // TODO: Explore use cases and limit available fields to add
    this.prisma.users
      .create({
        data: user,
        select: {
          username: true,
          orcid_id: true,
        },
      })
      .then(({ username, orcid_id }) => {
        this.userLogger.log(
          `created User with username: ${username} with orcid "${orcid_id}" `,
        );
        return true;
      })
      .catch((err) => {
        this.userLogger.error("Database Error, couldn't create user", err);
      });
  }

  update_user(orcid_id: string, userData: Prisma.usersUpdateInput): Boolean {
    userData.orcid_id = orcid_id;
    this.prisma.users
      .update({
        where: {
          orcid_id,
        },
        data: userData
      })
      .then((orcid) => {
        this.userLogger.log(`Updated user with orcid ${orcid}`);
        return true;
      })
      .catch((err) => {
        this.userLogger.error("Database Error, couldn't Update user", err);
        return false;
      });
    return false;
  }

  upsert_user(orcid_id: string, data: Prisma.usersCreateInput): Boolean {
    // const createUser
    this.prisma.users
      .upsert({
        where: {
          orcid_id,
        },
        update: data,
        create: {
          ...data,
          orcid_id,
        },
      })
      .then((orcid) => {
        this.userLogger.log(`Upserted user with orcid ${orcid}`);
        return true;
      })
      .catch((err) => {
        this.userLogger.error("Database Error, couldn't Upsert user", err);
        return false;
      });
    return false;
  }
}
