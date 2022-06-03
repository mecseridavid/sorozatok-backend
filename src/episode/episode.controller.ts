import { Router, Request, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import IdNotValidException from "../exceptions/IdNotValidException";
import HttpException from "../exceptions/HttpException";
import CreateEpisodeDto from "./episode.dto";
import Episode from "./episode.interface";
import episodeModel from "./episode.model";
import titleModel from "../title/title.model";

export default class EpisodeController implements Controller {
    public path = "/episode";
    public router = Router();
    private episode = episodeModel;
    private title = titleModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}s`, this.getAllEpisode);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getEpisodeById);
        this.router.get(`${this.path}s/:id`, authMiddleware, this.getEpisodesByTitleId);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateEpisodeDto)], this.createNewEpisode);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateEpisodeDto, true)], this.modifyEpisode);
        // this.router.patch(`${this.path}/:id/:to`, authMiddleware, this.addEpisodeToTitle);
        // this.router.patch(`${this.path}/:id/:from/:to`, [authMiddleware, validationMiddleware(CreateEpisodeDto, true)], this.modifyEpisodesTitle);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteEpisode);
    }

    private getAllEpisode = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const episode = await this.episode.find().populate("title", "-episodes");
            res.send(episode);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getEpisodeById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const episode = await this.episode.findById(id);
            if (episode) {
                res.send(await episode.populate("title", "-episodes"));
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getEpisodesByTitleId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (await this.title.exists({ _id: id })) {
                res.send(await this.episode.find({ title: id }));
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyEpisode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (await this.episode.exists({ id: id })) {
                const { date, season, episode, duration, watched } = req.body;
                const episodeResponse = await this.episode.findByIdAndUpdate(id, { $set: { date: date, season: season, episode: episode, duration: duration, watched: watched } }, { new: true });
                res.send(episodeResponse);
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    // private modifyEpisodesTitle = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const { id, from, to } = req.params;
    //         if (from == to) {
    //             return next(new HttpException(400, `You can't move the ${id} id episode to the same title ${from} id`));
    //         }
    //         if (await this.episode.exists({ id: id })) {
    //             const fromTitle = await this.title.findById(from);
    //             const toTitle = await this.title.findById(to);
    //             if (fromTitle) {
    //                 if (toTitle) {
    //                     if (fromTitle.episodes.length > 0 && fromTitle.episodes.includes(parseInt(id))) {
    //                         this.episode.findByIdAndUpdate(id, { $set: { title: to } }, { returnDocument: "after" }).then((episode: Episode) => {
    //                             fromTitle.updateOne({ $pull: { episodes: id } }, { new: true }).then(() => {
    //                                 toTitle.updateOne({ $push: { episodes: id } }, { new: true }).then(() => {
    //                                     res.send(episode);
    //                                 });
    //                             });
    //                         });
    //                     } else {
    //                         next(new HttpException(404, `There is no ${id} id episode in ${from} id title.`));
    //                     }
    //                 } else {
    //                     next(new IdNotValidException(to));
    //                 }
    //             } else {
    //                 next(new IdNotValidException(from));
    //             }
    //         } else {
    //             next(new IdNotValidException(id));
    //         }
    //     } catch (error) {
    //         next(new HttpException(400, error.message));
    //     }
    // };

    private createNewEpisode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const episodeData: Episode = req.body;
            const response = await this.episode.create({ ...episodeData });
            if (response) {
                await this.title.findByIdAndUpdate(response.title, { $addToSet: { episodes: response._id } });
                res.send(await response.populate("title", "-_id -episodes"));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private deleteEpisode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (await this.episode.exists({ _id: id })) {
                const successResponse = await this.episode.findByIdAndDelete(id).then(async (episode: Episode) => {
                    await this.title.findByIdAndUpdate(episode.title, { $pull: { episodes: episode._id } });
                });
                res.send(successResponse);
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
