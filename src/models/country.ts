import {
  Table,
  Column,
  Model,
  DataType,
  Unique,
  PrimaryKey,
  Comment,
  Default,
  BelongsToMany
} from 'sequelize-typescript';
import PoliticalOrganization from './political-organization';
import PoliticalOrganizationDivision from './political-organization-division';

@Table({ tableName: 'countries' })
export default class Country extends Model<Country> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID
  })
  uuid: string | undefined;

  @Comment('国家')
  @Column(DataType.TEXT)
  name: string | undefined;

  @Comment('国家全称')
  @Column(DataType.TEXT)
  fullName: string | undefined;

  @Comment('地域')
  @Column(DataType.TEXT)
  territory: string | undefined;

  @Comment('地域细分')
  @Column(DataType.TEXT)
  territoryDetail: string | undefined;

  @BelongsToMany(
    () => PoliticalOrganization,
    () => PoliticalOrganizationDivision
  )
  politicalOrganizations: PoliticalOrganization[] | undefined;
}
