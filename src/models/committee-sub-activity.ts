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
import CommitteeSub from './committee-sub';

@Table({ tableName: 'committee_sub_activities' })
export default class CommitteeSubActivity extends Model<CommitteeSubActivity> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID
  })
  uuid: string | undefined;

  @ForeignKey(() => CommitteeSub)
  @Column(DataType.UUID)
  subCommitteeUuid: string | undefined;

  @Comment('小组委员会动作时间')
  @Column(DataType.DATE)
  subCommitteeActivityDate: Date | undefined;

  @Comment('小组委员会动作')
  @Column(DataType.TEXT)
  subCommitteeActivity: string | undefined;
}
