import { InputType, Field } from 'type-graphql';
import { IsEmail, MinLength, MaxLength, Matches } from 'class-validator';

@InputType()
export class RegisterAdminInput {
  @Field(() => String)
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(100, { message: 'Email must be less than 100 characters' })
  email: string;

  @Field(() => String)
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must be less than 50 characters' })
  firstName: string;

  @Field(() => String)
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must be less than 50 characters' })
  lastName: string;

  @Field(() => String)
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(100, { message: 'Password must be less than 100 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @Field(() => String)
  @MinLength(1, { message: 'Invitation code is required' })
  @MaxLength(100, { message: 'Invitation code is too long' })
  invitationCode: string;
}

@InputType()
export class LoginInput {
  @Field(() => String)
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Field(() => String)
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
