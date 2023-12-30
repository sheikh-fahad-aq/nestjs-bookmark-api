import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2'

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {

    // generate hash
    const hash = await argon.hash(dto.password)
    
    // save new user
    const user = await this.prisma.user.create({
        data: {
            email: dto.email,
            password: hash
        }
    })
    delete user.password
    //return user
    return user;
  }
  signin() {
    return 'this is signIn';
  }
}
