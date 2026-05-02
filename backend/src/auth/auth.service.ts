import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    async validateUser(user, password: string) {
    return await bcrypt.compare(password, user.password);
    }
}
