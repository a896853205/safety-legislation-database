import {
  Table,
  Column,
  Model,
  HasMany,
  DataType,
  Unique,
  PrimaryKey,
  Comment,
  Default,
  ForeignKey
} from 'sequelize-typescript';
import PersonIdentity from './person-identity';

@Table({ tableName: 'people' })
export default class Person extends Model<Person> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID
  })
  uuid: string | undefined;

  @Comment('姓名')
  @Column(DataType.TEXT)
  name: string | undefined;

  @HasMany(() => PersonIdentity)
  personIdentities: PersonIdentity[] | undefined;
}
