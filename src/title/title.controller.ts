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
        this.router.get(`${this.path}/:offset/:limit/:order/:sort/:keyword?`, this.getPaginatedTitle);
        this.router.get(`${this.path}/:id`, this.getTitleById);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateTitleDto)], this.addNewTitle);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateTitleDto, true)], this.modifyTitle);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteTitle);
    }

    private getAllTitles = async (req: Request, res: Response, next: NextFunction) => {
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
            // console.log({ ...req.params });
            // console.log(`${sort == -1 ? "-" : ""}${order}`)
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
            this.title
                .create({
                    ...titleData,
                })
                .then((title: Title) => {
                    res.send(title);
                    // res.send(await (await this.title.findOne({ title: title.title })).populate("episodes", "-_id -titleID -watched"));
                });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyTitle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (await this.title.exists({ _id: id })) {
                const { title, image } = req.body;
                this.title.findByIdAndUpdate(id, { $set: { title: title, img: image } }, { returnDocument: "after" }).then((title: Title) => {
                    res.send(title);
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
