import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ControllerWrapper from 'src/utils/ControllerWrapper';
import { CreateUserDto } from '../../dto/user/create-user.dto';
import { UpdateUserDto } from '../../dto/user/update-user.dto';
import { User, UserDocument } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    return await ControllerWrapper(async () => {
      const emailExists = await this.UserModel.countDocuments({
        email: createUserDto.email,
      });
      if (emailExists) {
        throw new ConflictException('Email already exists!');
      }

      const user = new this.UserModel(createUserDto);

      user.password = await user.getHash(user.password);

      await user.save();

      user.password = undefined;

      return user;
    });
  }

  findAll(filter: Partial<User> = {}) {
    return this.UserModel.find(filter);
  }

  async findOneByEmail(
    email: string,
    includePassword: boolean = false,
  ): Promise<UserDocument | null> {
    return await ControllerWrapper(async () => {
      return await this.UserModel.findOne({
        email,
      }).select(`${includePassword ? '+' : '-'}password`);
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
