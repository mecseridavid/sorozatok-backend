import { IsInt, Matches, Max, Min } from "class-validator";

export default class CreateEpisodeDto {
    @IsInt()
    public title: number;

    @Matches("^((19|2\\d)\\d{2})\\.(0[1-9]|1[012])\\.(0[1-9]|[12]\\d|3[01])$|^$", "", { message: "Must be yyyy.MM.dd or empty string!" })
    public date?: string;

    @IsInt()
    @Min(1)
    public season: number;

    @IsInt()
    @Min(1)
    public episode: number;

    @IsInt()
    public duration: number;

    @IsInt({ message: "Only 0 or 1 allowed!" })
    @Min(0)
    @Max(1)
    public watched?: number;
}
