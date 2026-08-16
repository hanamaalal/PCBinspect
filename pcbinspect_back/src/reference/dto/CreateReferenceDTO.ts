import { IsNotEmpty, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReferenceDTO {

  @IsNotEmpty()
  PRF!: string;
  @IsNotEmpty()
  verifSN!: boolean;
  @IsNumber()
  longeurSN!: number;
  @IsNotEmpty()
  partieFixe!: string;
  @IsNotEmpty()
  postpartiefixe!: string;
  @IsBoolean()
  activationInterblocage!: boolean;
  @IsNumber()
  indicePartieFixe!: number;
  @IsNotEmpty()
  statutSN!: string;
  @IsBoolean()
  jugementOperateurBO!: boolean;
  @IsOptional()
  imagepath?: string;
  OF!:string;
}