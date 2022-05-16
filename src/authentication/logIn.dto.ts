import { IsString } from "class-validator";

export default class LogInDto {
    @IsString()
    public usernameOrEmail: string;

    @IsString()
    public password: string;
}
