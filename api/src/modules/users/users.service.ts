import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcryptjs';
import { UsersRepository } from 'src/shared/database/repositories/users.repositories';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    const emailTaken = await this.usersRepo.findUnique({ where: { email } });

    if (emailTaken) {
      throw new ConflictException('This email is already taken');
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.usersRepo.create({
      data: {
        email,
        name,
        password: hashedPassword,
        categories: {
          createMany: {
            data: [
              // Income
              { name: 'Salário', icon: 'travel', type: 'INCOME' },
              { name: 'Freelance', icon: 'freelance', type: 'INCOME' },
              { name: 'Outros', icon: 'outher', type: 'INCOME' },

              // Expense
              { name: 'Alimentação', icon: 'food', type: 'EXPENSE' },
              { name: 'Transporte', icon: 'transport', type: 'EXPENSE' },
              { name: 'Lazer', icon: 'fun', type: 'EXPENSE' },
              { name: 'Outros', icon: 'outher', type: 'EXPENSE' },
            ],
          },
        },
      },
    });

    return {
      name: user.name,
      email: user.email,
    };
  }
}
