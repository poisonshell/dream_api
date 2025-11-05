import { ObjectType, Field } from 'type-graphql';
import { AdminUser } from '../../entities/AdminUser';

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  token: string;

  @Field(() => AdminUser)
  adminUser: AdminUser;
}
