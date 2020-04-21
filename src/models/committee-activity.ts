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
import Committee from './committee';

@Table({ tableName: 'committee_activities' })
export default class CommitteeActivity extends Model<CommitteeActivity> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID
  })
  uuid: string | undefined;

  @ForeignKey(() => Committee)
  @Column(DataType.UUID)
  committeeUuid: string | undefined;

  @Comment('委员会动作时间')
  @Column(DataType.DATE)
  committeeActivityDate: Date | undefined;

  @Comment('委员会动作')
  @Column(DataType.TEXT)
  committeeActivity: string | undefined;
}
