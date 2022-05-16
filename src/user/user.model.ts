import { Schema, model } from "mongoose";
import User from "./user.interface";
import { AutoIncrementID } from "@typegoose/auto-increment";

const userSchema = new Schema<User>(
    {
        _id: Number,
        email: {
            type: String,
            required: [true, "Email required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address."],
        },
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            minlength: 4,
        },
        name: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
    },
    { versionKey: false },
);

userSchema.plugin(AutoIncrementID, {});

const userModel = model<User>("user", userSchema, "users");

export default userModel;
