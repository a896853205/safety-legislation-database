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

@Table({ tableName: 'digests' })
export default class Digest extends Model<Digest> {
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

  @Comment('文摘')
  @Column(DataType.TEXT)
  digest: string | undefined;
}
