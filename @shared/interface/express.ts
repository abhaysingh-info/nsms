import { Request } from 'express'
import { IUser } from './user'

export interface IUserRequest extends Request {
	user: IUser
}
