import {
  Table,
  Column,
  Model,
  DataType,
  Unique,
  PrimaryKey,
  ForeignKey,
  Default,
  BelongsTo,
  Comment
} from 'sequelize-typescript';
import Bill from './bill';
import Organization from './organization';

@Table({ tableName: 'constraints' })
export default class Constraint extends Model<Constraint> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID
  })
  uuid: string | undefined;

  @ForeignKey(() => Bill)
  @Column(DataType.UUID)
  billUuid: string | undefined;

  @Comment('组织')
  @ForeignKey(() => Organization)
  @Column(DataType.UUID)
  organizationUuid: string | undefined;

  @BelongsTo(() => Organization)
  organization: Organization | undefined;
}
