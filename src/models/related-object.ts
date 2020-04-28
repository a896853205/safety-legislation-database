import {
  Table,
  Column,
  Model,
  HasMany,
  DataType,
  Unique,
  PrimaryKey,
  Comment,
  Default,
  ForeignKey
} from 'sequelize-typescript';
import Bill from './bill';

@Table({ tableName: 'related_objects' })
export default class RelatedObject extends Model<RelatedObject> {
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

  @Comment('相关对象')
  @Column(DataType.TEXT)
  relatedObject: string | undefined;
}
