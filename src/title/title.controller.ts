import { Router, Request, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import HttpException from "../exceptions/HttpException";
import IdNotValidException from "../exceptions/IdNotValidException";
import CreateTitleDto from "./title.dto";
import titleModel from "./title.model";
import Title from "./title.interface";

export default class TitleController implements Controller {
    public path = "/title";
    public router = Router();
    private title = titleModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}s`, this.getAllTitles);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getTitleById);
        this.router.get(`${this.path}/:offset/:limit/:order/:sort/:keyword?`, this.getPaginatedTitle);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateTitleDto)], this.addNewTitle);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateTitleDto, true)], this.modifyTitle);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteTitle);
    }

    private getAllTitles = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const titles = await this.title.find().populate("episodes", "-title");
            res.send(titles);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getPaginatedTitle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const order = req.params.order;
            const sort = parseInt(req.params.sort);
            let titleResponse = [];
            let count = 0;
            if (req.params.keyword) {
                const regex = new RegExp(req.params.keyword, "i");
                count = await this.title.find({ title: { $regex: regex } }).count();
                titleResponse = await this.title
                    .find({ title: { $regex: regex } })
                    .populate("episodes", "-title")
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            } else {
                count = await this.title.countDocuments();
                titleResponse = await this.title
                    .find()
                    .populate("episodes", "-title")
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            }
            res.send({ count: count, titles: titleResponse });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getTitleById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const title = await this.title.findById(id);
            if (title) {
                const titleResponse = await title.populate("episodes", "-title");
                if (titleResponse) {
                    res.send(titleResponse);
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private addNewTitle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const titleData: Title = req.body;
            const response = await this.title.create({
                ...titleData,
            });
            if (response) {
                res.send(response);
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyTitle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (await this.title.exists({ _id: id })) {
                const { title, img } = req.body;
                this.title.findByIdAndUpdate(id, { $set: { title: title, img: img } }, { returnDocument: "after" }).then((titleRes: Title) => {
                    res.send(titleRes);
                });
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private deleteTitle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const title = await this.title.findById(id);
            if (title) {
                if (title.episodes.length == 0) {
                    const successResponse = await this.title.findByIdAndDelete(id);
                    res.status(200).send(successResponse);
                } else {
                    next(new HttpException(400, "You can't delete a title whitch is connected any episodes!"));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
