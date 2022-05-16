import { IsBoolean, IsDateString, IsNumber, IsOptional } from "class-validator";

export default class CreateEpisodeDto {
    @IsNumber()
    public title: number;

    @IsDateString()
    @IsOptional()
    public date?: string;

    @IsNumber()
    public season: number;

    @IsNumber()
    public episode: number;

    @IsNumber()
    public duration: number;

    @IsBoolean()
    @IsOptional()
    public watched?: boolean;
}
