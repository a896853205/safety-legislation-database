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
import Country from './country';
import politicalOrganizationDivision from './political-organization-division';

@Table({ tableName: 'political_organizations' })
export default class politicalOrganization extends Model<
  politicalOrganization
> {
  @PrimaryKey
  @Unique
  @Default(DataType.UUIDV1)
  @Column({
    type: DataType.UUID
  })
  uuid: string | undefined;

  @Comment('政策组织划分名')
  @Column(DataType.TEXT)
  name: string | undefined;

  @BelongsToMany(
    () => Country,
    () => politicalOrganizationDivision
  )
  countries: Country[] | undefined;
}
