import {
  Table,
  Column,
  Model,
  DataType,
  Unique,
  PrimaryKey,
  ForeignKey,
  Comment,
  Default
} from 'sequelize-typescript';
import Bill from './bill';

@Table
export default class Action extends Model<Action> {
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

  @Comment('动态')
  @Column(DataType.TEXT)
  action: string | undefined;

  @Comment('动态时间')
  @Column(DataType.DATE)
  actionDate: Date | undefined;

  @Comment('动态通过')
  @Column(DataType.TEXT)
  actionBy: string | undefined;
}
