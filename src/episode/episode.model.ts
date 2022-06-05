import { Schema, model } from "mongoose";
import Episode from "./episode.interface";
import { AutoIncrementID } from "@typegoose/auto-increment";

const episodeSchema = new Schema<Episode>(
    {
        _id: Number,
        date: {
            type: String,
            default: null,
        },
        title: {
            ref: "title",
            type: Number,
        },
        season: {
            type: Number,
            required: true,
        },
        episode: {
            type: Number,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        watched: {
            type: Number,
            default: 0,
        },
    },
    { versionKey: false },
);

episodeSchema.plugin(AutoIncrementID, {});

// episodeSchema.virtual("title", {
//     ref: "title",
//     localField: "title",
//     foreignField: "_id",
//     justOne: true,
// });

const episodeModel = model<Episode>("episode", episodeSchema, "episodes");

export default episodeModel;
