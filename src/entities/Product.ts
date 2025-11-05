import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from 'type-graphql';
import { AdminUser } from './AdminUser';
import { Category } from './Category';
import { CategoryBasicResponse } from '../types/responses/CategoryBasicResponse';

@ObjectType()
@Entity('products')
export class Product extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'varchar' })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Field(() => CategoryBasicResponse, { nullable: true })
  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @Column({ type: 'uuid', nullable: true })
  categoryId?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  image: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  stockStatus: number;

  // Not exposed in GraphQL - internal use only
  @ManyToOne(() => AdminUser, (admin) => admin.products, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: AdminUser;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
