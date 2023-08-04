import { Response } from 'express';
import { User, UserDocument } from 'src/entities/user.entity';

export default async function (res: Response, user: UserDocument) {
  const token: string = await user.getJwtToken();
  res.cookie('token', token);
  res.cookie('roles', user.roles);

  return {
    token,
    user: {
      _id: user._id,
      email: user.email,
      isBlocked: user.isBlocked,
      suspended: user.suspended,
      isEmailVerified: user.isEmailVerified,
      name: user.name,
      roles: user.roles,
    },
  };
}
