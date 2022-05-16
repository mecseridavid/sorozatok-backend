import { IsEmail, IsOptional, IsString } from "class-validator";

export default class CreateUserDto {
    @IsEmail()
    public email: string;

    @IsString()
    public username: string;

    @IsString()
    @IsOptional()
    public name: string;

    @IsString()
    public password: string;
}
