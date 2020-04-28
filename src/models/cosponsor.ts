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
  BelongsTo
} from 'sequelize-typescript';
import Bill from './bill';
import Person from './person';

@Table({ tableName: 'cosponsors' })
export default class Cosponsor extends Model<Cosponsor> {
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

  @Comment('联合发起人')
  @ForeignKey(() => Person)
  @Column(DataType.UUID)
  cosponsorUuid: string | undefined;

  @BelongsTo(() => Person)
  cosponsor: Person | undefined;

  @Comment('联合发起时间')
  @Column(DataType.DATE)
  cosponsorDate: Date | undefined;
}
