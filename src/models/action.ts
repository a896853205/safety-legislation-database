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

@Table({ tableName: 'actions' })
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

  @Comment('动作状态')
  @Column(DataType.TEXT)
  actionStatus: string | undefined;

  @Comment('数值')
  @Column(DataType.STRING)
  value: string | undefined;
}
