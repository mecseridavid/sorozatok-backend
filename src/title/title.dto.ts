import { IsOptional, IsString, IsNumber, IsUrl } from "class-validator";

export default class CreateTitleDto {
    @IsNumber()
    @IsOptional()
    public _id?: number;

    @IsUrl()
    public img?: string;

    @IsString()
    public title: string;
}
