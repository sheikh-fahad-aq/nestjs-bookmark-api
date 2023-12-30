import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    try {
      // generate hash
      const hash = await argon.hash(dto.password);

      // save new user
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
      });
      delete user.password;
      //return user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
  }
  async signin(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    // if user does not exist throw exception of user not found
    if (!user) throw new ForbiddenException('Credentials incorrect');
    
    // compare password
    const pwMatches = await argon.verify(
        user.password,
        dto.password,
    )

    // if password not match throw exception of invalid credential
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');
    
    delete user.password;
    //return user
    return user;
  }
}
