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

@Table({ tableName: 'sops' })
export default class Sop extends Model<Sop> {
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

  @Comment('补充文件')
  @Column(DataType.TEXT)
  sop: string | undefined;
}
