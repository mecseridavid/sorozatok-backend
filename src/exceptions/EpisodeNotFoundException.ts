import HttpException from "./HttpException";

export default class EpisodeNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Episode with id ${id} not found`);
    }
}
