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

@Table({ tableName: 'short_title' })
export default class ShortTitle extends Model<ShortTitle> {
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

  @Comment('短标题')
  @Column(DataType.TEXT)
  shortTitle: string | undefined;

  @Comment('短标题状态')
  @Column(DataType.TEXT)
  shortTitleStatus: string | undefined;
}
