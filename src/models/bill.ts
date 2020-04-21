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
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import Cosponsor from './cosponsor';
import LegislativeSubject from './legislative-subject';
import Action from './action';
import Committee from './committee';
import AmendBill from './amend-bill';
import Amendment from './amendment';
import RelatedBill from './related-bill';
import Portfolio from './portfolio';
import Sop from './sop';
import Digest from './digest';
import Schedule from './schedule';
import HumanWord from './human-word';
import ProgramWord from './program-word';
import Country from './country';
import Person from './person';
import Constraint from './constraint';
import Executor from './executor';
import RelatedObject from './related-object';
import ShortTitle from './short-title';
import OfficialTitle from './official-title';

@Table
export default class Bill extends Model<Bill> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID
  })
  uuid: string | undefined;

  @ForeignKey(() => Country)
  @Column(DataType.UUID)
  countryUuid: string | undefined;

  @BelongsTo(() => Country)
  country: Country | undefined;

  @Comment('法案号')
  @Column(DataType.TEXT)
  number: string | undefined;

  @Comment('法案类型')
  @Column(DataType.TEXT)
  type: string | undefined;

  @Comment('国会届数')
  @Column(DataType.INTEGER)
  congress: number | undefined;

  @Comment('法案名')
  @Column(DataType.TEXT)
  name: string | undefined;

  @Comment('发起时间')
  @Column(DataType.DATE)
  dateSponsored: Date | undefined;

  @Comment('发起人')
  @ForeignKey(() => Person)
  @Column(DataType.UUID)
  sponsorUuid: string | undefined;

  @BelongsTo(() => Person)
  sponsor: Person | undefined;

  @Comment('原始提出的院')
  @Column(DataType.TEXT)
  originChamber: string | undefined;

  @Comment('法案状态')
  @Column(DataType.TEXT)
  status: string | undefined;

  @Comment('政策领域')
  @Column(DataType.TEXT)
  policyArea: string | undefined;

  @Comment('目的')
  @Column(DataType.TEXT)
  purpose: string | undefined;

  @Comment('描述')
  @Column(DataType.TEXT)
  description: string | undefined;

  @Comment('摘要')
  @Column(DataType.TEXT)
  summary: string | undefined;

  @Comment('文本')
  @Column(DataType.TEXT)
  text: string | undefined;

  @Comment('负责人')
  @Column(DataType.TEXT)
  member: string | undefined;

  @Comment('编号')
  @Column(DataType.TEXT)
  ref: string | undefined;

  @Comment('业务部门')
  @Column(DataType.TEXT)
  businessUnit: string | undefined;

  @Comment('拟议修正案')
  @Column(DataType.TEXT)
  proposed: string | undefined;

  @Comment('解释性备忘录')
  @Column(DataType.TEXT)
  explanatory: string | undefined;

  @HasMany(() => RelatedObject)
  relatedObject: RelatedObject[] | undefined;

  @HasMany(() => Cosponsor)
  cosponsors: Cosponsor[] | undefined;

  @HasMany(() => LegislativeSubject)
  legislativeSubjects: LegislativeSubject[] | undefined;

  @HasMany(() => Action)
  actions: Action[] | undefined;

  @HasMany(() => Committee)
  committees: Committee[] | undefined;

  @HasMany(() => AmendBill)
  amendBills: AmendBill[] | undefined;

  @HasMany(() => Amendment)
  amendments: Amendment[] | undefined;

  @HasMany(() => RelatedBill)
  relatedBills: RelatedBill[] | undefined;

  @HasMany(() => Portfolio)
  portfolios: Portfolio[] | undefined;

  @HasMany(() => Sop)
  sops: Sop[] | undefined;

  @HasMany(() => Digest)
  digests: Digest[] | undefined;

  @HasMany(() => Schedule)
  schedule: Schedule[] | undefined;

  @HasMany(() => HumanWord)
  humanWord: HumanWord[] | undefined;

  @HasMany(() => ProgramWord)
  programWord: ProgramWord[] | undefined;

  @HasMany(() => Constraint)
  constraint: Constraint[] | undefined;

  @HasMany(() => Executor)
  executor: Executor[] | undefined;

  @HasMany(() => ShortTitle)
  shortTitle: ShortTitle[] | undefined;

  @HasMany(() => OfficialTitle)
  officialTitle: OfficialTitle[] | undefined;
}
