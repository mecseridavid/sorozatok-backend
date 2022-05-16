import { Router, Request, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import { comparePassword, generatePassword } from "../middleware/cookieAndPassword.middleware";
import CreateUserDto from "./user.dto";
import IdNotValidException from "../exceptions/IdNotValidException";
import HttpException from "../exceptions/HttpException";
import userModel from "./user.model";

export default class UserController implements Controller {
    public path = "/user";
    public router = Router();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}s`, authMiddleware, this.getAllUsers);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getUserById);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateUserDto, true)], this.modifyUser);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteUser);
    }

    private getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.user.find({}, "-password");
            res.send(users);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const user = await this.user.findById(id, "-password");
            if (user) {
                res.send(user);
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const user = await this.user.findById(id);
            if (user) {
                const { password, email } = req.body;
                const passwordIsTheSame = await comparePassword(password, user.password);
                if (passwordIsTheSame) {
                    next(new HttpException(400, "You can't change the password to the same."));
                } else if (password == user.username) {
                    next(new HttpException(400, "You can't change the password to your username"));
                } else {
                    const modifiedUser = await this.user.findByIdAndUpdate(id, { $set: { password: await generatePassword(password, 10), email: email } }, { new: true });
                    if (modifiedUser) {
                        res.send(modifiedUser);
                    }
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (await this.user.exists({ _id: id })) {
                const response = await this.user.findByIdAndDelete(id);
                res.status(200).send(response);
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
