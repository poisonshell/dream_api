import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Product } from './Product';

@ObjectType()
@Entity('admin_users')
export class AdminUser extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Field(() => String)
  @Column({ type: 'varchar' })
  firstName: string;

  @Field(() => String)
  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar' })
  password: string;

  @Field(() => String)
  @Column({ type: 'varchar', default: 'admin' })
  role: string;

  @OneToMany(() => Product, (product) => product.createdBy)
  products: Product[];

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
