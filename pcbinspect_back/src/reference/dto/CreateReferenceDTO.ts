import { IsNotEmpty, IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateReferenceDTO {

  @IsNotEmpty()
  PRF!: string;
  @IsNotEmpty()
  verifSN!: boolean;
  @IsNumber()
  longeurSN!: number;
  @IsNotEmpty()
  partieFixe!: string;
   @IsNumber()
  @Min(1)
  nombreSN!: number;
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