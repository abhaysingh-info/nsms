import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  getHash as utilsGetHash,
  getRandomBytes,
  scryptHash,
} from '@shared/utils';
import regxr, { matchRegx } from '@shared/utils/regx';
import roles from '@shared/utils/roles';
import {
  sign as JWTSign,
  decode as JWTDecode,
  verify as JWTVerify,
} from 'jsonwebtoken';
import { ItokenTypes } from '@shared/interfaces/user';
import { HydratedDocument } from 'mongoose';

@Schema()
export class User {
  @Prop({
    type: String,
    required: true,
    minlength: 1,
    maxlength: 128,
    match: regxr.name,
    validate: {
      validator: (value: string) => {
        return matchRegx(value, regxr.name);
      },
      message: 'Please provide a valid name',
    },
  })
  name: string;

  //   Email and it's verification
  @Prop({
    type: String,
    required: true,
    match: regxr.email,
    unique: true,
    validate: {
      validator: (value: string) => {
        return matchRegx(value, regxr.email);
      },
      message: 'Please provide a valid e-mail',
    },
  })
  email: string;

  @Prop({
    type: Boolean,
    default: false,
    required: true,
  })
  isEmailVerified: boolean;

  @Prop({ type: String, required: false })
  emailVerifyToken: string; // only used once to verify

  @Prop({ type: String, required: false })
  emailResetToken: string;

  @Prop({ type: Date })
  emailResetTokenExpiry: Date;

  // password and it's verifycation
  @Prop({
    type: String,
    minLength: 10,
    maxLength: 624,
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    type: String,
  })
  passwordResetToken: string;

  @Prop({ type: Date })
  passwordResetTokenExpiry: Date;

  @Prop({ type: Number, default: 0 })
  passwordTries: Number;

  // roles
  @Prop({ type: String, default: roles.client, required: true })
  roles: string;

  // others
  @Prop({ type: Boolean, default: false, required: true })
  suspended: boolean; // suspended is for read-only access

  @Prop({ type: Boolean, default: false, required: true })
  isBlocked: boolean; // blocked is for no access

  @Prop({
    type: String,
  })
  token: string;

  @Prop({
    type: Date,
  })
  tokenExpiry: Date;

  getHash: Function;

  getJwtToken: Function;

  comparePassword: Function;

  getToken: Function;

  verifyJwtToken: Function;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.getHash = async function (value: string) {
  return await utilsGetHash(value);
};

UserSchema.methods.verifyJwtToken = function (token: string) {
  return JWTVerify(token, `${process.env.JWT_SECRET}`);
};

UserSchema.methods.getJwtToken = function () {
  return JWTSign(
    {
      email: this.email,
    },
    `${process.env.JWT_SECRET}`,
    {
      expiresIn: process.env.JWT_EXPIRY ? process.env.JWT_EXPIRY : '1d',
    },
  );
};

UserSchema.methods.getToken = async function (type: ItokenTypes) {
  const token = getRandomBytes(20);
  const tokenExpiryMinutes = parseInt(`${process.env.TOKEN_EXPIRY_HOURS}`);

  const tokenSha512 = await this.getHash(token);

  switch (type) {
    case 'emailVerifyToken':
      this.emailVerifyToken = tokenSha512;
      break;
    case 'emailResetToken':
      this.emailResetToken = tokenSha512;
      this.emailResetTokenExpiry = new Date(
        Date.now() + tokenExpiryMinutes * 60 * 60 * 1000,
      );
      break;
    case 'passwordResetToken':
      this.passwordResetToken = tokenSha512;
      this.passwordResetTokenExpiry = new Date(
        Date.now() + tokenExpiryMinutes * 60 * 60 * 1000,
      );
      break;
    default:
      this.token = tokenSha512;
      this.tokenExpiry = new Date(
        Date.now() + tokenExpiryMinutes * 60 * 60 * 1000,
      );
      break;
  }
  return token;
};

UserSchema.methods.comparePassword = async function (
  passwordFromLogin: string,
): Promise<boolean> {
  const [salt, password] = this.password.split('.');

  return (
    (await scryptHash(passwordFromLogin, salt)).toString('hex') === password
  );
};
