import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    @Post('login')
  login(@Body() body) {
    return { msg: 'Login funcionando', user: body.username };
  }
}
