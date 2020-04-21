import {
  Table,
  Column,
  Model,
  DataType,
  Unique,
  PrimaryKey,
  ForeignKey,
  Comment,
  Default,
} from 'sequelize-typescript';
import Bill from './bill';

@Table
export default class Amendment extends Model<Amendment> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID,
  })
  uuid: string | undefined;

  @ForeignKey(() => Bill)
  @Column(DataType.UUID)
  billUuid: string | undefined;

  @Comment('法案对应的修正案编号')
  @Column(DataType.TEXT)
  amendmentCode: string | undefined;

  @Comment('国会届数')
  @Column(DataType.INTEGER)
  congress: number | undefined;
}
