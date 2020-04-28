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
  HasMany
} from 'sequelize-typescript';
import Bill from './bill';
import CommitteeActivity from './committee-activity';
import CommitteeSub from './committee-sub';

@Table({ tableName: 'committees' })
export default class Committee extends Model<Committee> {
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

  @Comment('委员会名')
  @Column(DataType.TEXT)
  committeeName: string | undefined;

  @Comment('委员会报告时间')
  @Column(DataType.DATE)
  committeeDate: Date | undefined;

  @Comment('委员会报告编号')
  @Column(DataType.TEXT)
  committeeReportsNumber: string | undefined;

  @HasMany(() => CommitteeActivity)
  committeeActivities: CommitteeActivity[] | undefined;

  @HasMany(() => CommitteeSub)
  subCommittee: CommitteeSub[] | undefined;
}
