import HttpException from "./HttpException";

export default class TitleNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Title with id ${id} not found`);
    }
}
