import {
  Table,
  Column,
  Model,
  DataType,
  Unique,
  PrimaryKey,
  Comment,
  Default,
  ForeignKey,
} from 'sequelize-typescript';
import moment from 'moment';

import Person from './person';

@Table({ tableName: 'person_identities' })
export default class PersonIdentity extends Model<PersonIdentity> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID,
  })
  uuid: string | undefined;

  @ForeignKey(() => Person)
  @Column(DataType.UUID)
  personUuid: string | undefined;

  @Comment('分区')
  @Column(DataType.TEXT)
  state: string | undefined;

  @Comment('分区号')
  @Column(DataType.INTEGER)
  district: number | undefined;

  @Comment('国会开始届数')
  @Column(DataType.INTEGER)
  congressStart: number | undefined;

  @Comment('国会结束届数')
  @Column(DataType.INTEGER)
  congressEnd: number | undefined;

  @Comment('开始日期')
  @Column(
    DataType.BIGINT({
      length: 20,
    })
  )
  dateStart: number | undefined;

  @Comment('结束日期')
  @Column(
    DataType.BIGINT({
      length: 20,
    })
  )
  dateEnd: number | undefined;

  @Comment('身份')
  @Column(DataType.TEXT)
  identity: string | undefined;

  @Comment('党派')
  @Column(DataType.TEXT)
  party: string | undefined;
}
