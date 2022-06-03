import { Router, Request, Response, NextFunction } from "express";
import validationMiddleware from "../middleware/validation.middleware";
import { createCookie, createToken, generatePassword, comparePassword } from "../middleware/cookieAndPassword.middleware";
import UserWithThatEmailAlreadyExistsException from "../exceptions/UserWithThatEmailAlreadyExistsException";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import EmptyFieldException from "../exceptions/EmptyFieldsException";
import HttpException from "../exceptions/HttpException";
import Controller from "../interfaces/controller.interface";
import TokenData from "../interfaces/tokenData.interface";
import User from "../user/user.interface";
import userModel from "./../user/user.model";
import CreateUserDto from "../user/user.dto";
import LogInDto from "./logIn.dto";
import Login from "./login.interface";

export default class AuthenticationController implements Controller {
    public path = "/auth";
    public router = Router();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
        this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);
        this.router.post(`${this.path}/logout`, this.loggingOut);
    }

    private registration = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: User = req.body;
            if (await this.user.findOne({ email: userData.email })) {
                next(new UserWithThatEmailAlreadyExistsException(userData.email));
            } else {
                const hashedPassword = await generatePassword(userData.password, 10);

                const user = await this.user.create({
                    ...userData,
                    password: hashedPassword,
                });
                user.password = undefined;
                const tokenData: TokenData = createToken(user);
                res.setHeader("Set-Cookie", [createCookie(tokenData)]);
                res.send(user);
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private loggingIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let user;
            let logInData: Login;

            if (req.body && req.body.usernameOrEmail) {
                logInData = req.body;
                const byUsername = { username: logInData.usernameOrEmail };
                const byEmail = { email: logInData.usernameOrEmail };
                if (await this.user.exists(byUsername)) {
                    user = await this.user.findOne(byUsername);
                } else {
                    user = await this.user.findOne(byEmail);
                }
            } else {
                next(new EmptyFieldException());
            }

            if (user) {
                const isPasswordMatching = await comparePassword(logInData.password, user.password);
                if (isPasswordMatching) {
                    user.password = undefined;
                    const tokenData = createToken(user);
                    res.setHeader("Set-Cookie", [createCookie(tokenData)]);
                    res.send(user);
                } else {
                    next(new WrongCredentialsException());
                }
            } else {
                next(new WrongCredentialsException());
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private loggingOut = (_req: Request, res: Response) => {
        res.setHeader("Set-Cookie", ["Authorization=; SameSite=None; Secure; Path=/; Max-age=0"]);
        res.sendStatus(200);
    };
}
