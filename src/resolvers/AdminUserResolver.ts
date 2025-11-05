import { Resolver, Mutation, Arg, Query, Ctx, UseMiddleware } from 'type-graphql';
import { AdminUser } from '../entities/AdminUser';
import { RegisterAdminInput, LoginInput } from '../types/inputs/AdminUserInput';
import { LoginResponse } from '../types/responses/LoginResponse';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { MyContext } from '../types/context';
import { isAuth } from '../middleware/isAuth';
import { rateLimitLogin } from '../middleware/rateLimitLogin';

@Resolver(AdminUser)
export class AdminUserResolver {
  // Public: Register new admin (protected by invitation code)
  @Mutation(() => LoginResponse)
  async registerAdmin(
    @Arg('input', () => RegisterAdminInput) input: RegisterAdminInput,
  ): Promise<LoginResponse> {
    const validInvitationCode = process.env.ADMIN_INVITATION_CODE;

    if (!validInvitationCode) {
      throw new Error('Only for invited admins');
    }

    if (input.invitationCode !== validInvitationCode) {
      throw new Error('Invalid invitation code');
    }

    const existingAdmin = await AdminUser.findOne({ where: { email: input.email } });

    if (existingAdmin) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await hashPassword(input.password);

    const adminUser = AdminUser.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();

    const token = generateToken(adminUser.id, true);

    return {
      token,
      adminUser,
    };
  }

  // Public: Login admin
  @Mutation(() => LoginResponse)
  @UseMiddleware(rateLimitLogin)
  async loginAdmin(@Arg('input', () => LoginInput) input: LoginInput): Promise<LoginResponse> {
    const adminUser = await AdminUser.findOne({ where: { email: input.email } });

    if (!adminUser) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(input.password, adminUser.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(adminUser.id, true);

    return {
      token,
      adminUser,
    };
  }

  // Protected: Get current admin user
  @Query(() => AdminUser, { nullable: true })
  @UseMiddleware(isAuth)
  async me(@Ctx() context: MyContext): Promise<AdminUser | null> {
    if (!context.userId) {
      return null;
    }

    const adminUser = await AdminUser.findOne({ where: { id: context.userId } });
    return adminUser || null;
  }

  // Protected: Refresh token
  @Mutation(() => LoginResponse)
  @UseMiddleware(isAuth)
  async refreshToken(@Ctx() context: MyContext): Promise<LoginResponse> {
    if (!context.userId) {
      throw new Error('Not authenticated');
    }

    const adminUser = await AdminUser.findOne({ where: { id: context.userId } });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const token = generateToken(adminUser.id, true);

    return {
      token,
      adminUser,
    };
  }
}
