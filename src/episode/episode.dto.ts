import { IsBoolean, IsNumber, IsOptional, Matches } from "class-validator";

export default class CreateEpisodeDto {
    @IsNumber()
    public title: number;

    @Matches("^((19|2\\d)\\d{2})\\.(0[1-9]|1[012])\\.(0[1-9]|[12]\\d|3[01])$", "", { message: "Must be yyyy.MM.dd!" })
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
