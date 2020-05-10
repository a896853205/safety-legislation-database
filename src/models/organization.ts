import {
  Table,
  Column,
  Model,
  DataType,
  Unique,
  PrimaryKey,
  Comment,
  Default,
} from 'sequelize-typescript';

@Table({ tableName: 'organizations' })
export default class Organization extends Model<Organization> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID,
  })
  uuid: string | undefined;

  @Comment('组织名')
  @Column(DataType.TEXT)
  name: string | undefined;
}
