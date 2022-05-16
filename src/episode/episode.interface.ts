// import { Types } from "mongoose";
export default interface Episode {
    _id?: number;
    date?: string | null;
    title?: number;
    season: number;
    episode: number;
    duration: number;
    watched?: boolean;
}
