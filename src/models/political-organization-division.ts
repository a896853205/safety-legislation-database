import {
  Table,
  Column,
  Model,
  DataType,
  Unique,
  PrimaryKey,
  Default,
  ForeignKey,
  Comment
} from 'sequelize-typescript';
import Country from './country';
import PoliticalOrganization from './political-organization';

@Table({ tableName: 'political_organization_divisions' })
export default class PoliticalOrganizationDivision extends Model<
  PoliticalOrganizationDivision
> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID
  })
  uuid: string | undefined;

  @Comment('国家uuid')
  @ForeignKey(() => Country)
  @Column(DataType.UUID)
  CUuid: string | undefined;

  @Comment('政策组织uuid')
  @ForeignKey(() => PoliticalOrganization)
  @Column(DataType.UUID)
  POUuid: string | undefined;
}
