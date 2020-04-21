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

@Table({ tableName: 'related_bills' })
export default class RelatedBill extends Model<RelatedBill> {
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

  @Comment('相关法案编号')
  @Column(DataType.TEXT)
  relatedBillCode: string | undefined;

  @Comment('关系')
  @Column(DataType.TEXT)
  relationship: string | undefined;

  @Comment('相关法案名称')
  @Column(DataType.TEXT)
  relatedBillName: string | undefined;
}
