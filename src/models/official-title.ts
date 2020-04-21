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

@Table({ tableName: 'official_title' })
export default class OfficialTitle extends Model<OfficialTitle> {
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

  @Comment('官方标题')
  @Column(DataType.TEXT)
  officialTitle: string | undefined;

  @Comment('官方标题状态')
  @Column(DataType.TEXT)
  officialTitleStatus: string | undefined;
}
