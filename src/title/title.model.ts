import { Schema, model } from "mongoose";
import Title from "./title.interface";
import { AutoIncrementID } from "@typegoose/auto-increment";

const titleSchema = new Schema<Title>(
    {
        _id: Number,
        title: {
            type: String,
            required: true,
        },
        img: {
            type: String,
            default: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png",
        },
        episodes: [
            {
                type: Number,
                ref: "episode",
            },
        ],
    },
    { versionKey: false },
);

titleSchema.plugin(AutoIncrementID, {});

const titleModel = model<Title>("title", titleSchema, "titles");

export default titleModel;
