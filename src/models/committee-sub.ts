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
import Committee from './committee';
import CommitteeSubActivity from './committee-sub-activity';

@Table({ tableName: 'committee_subs' })
export default class CommitteeSub extends Model<CommitteeSub> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column(DataType.UUID)
  uuid: string | undefined;

  @ForeignKey(() => Committee)
  @Column(DataType.UUID)
  committeeUuid: string | undefined;

  @Comment('小组委员会名')
  @Column(DataType.TEXT)
  subCommitteeName: string | undefined;

  @HasMany(() => CommitteeSubActivity)
  committeeSubActivities: CommitteeSubActivity[] | undefined;
}
