import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import TokenData from "../interfaces/tokenData.interface";
import User from "../user/user.interface";

const generatePassword = async (password: string, salt: number): Promise<string> => {
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password: string, encrypted: string): Promise<boolean> => {
    return await bcrypt.compare(password, encrypted);
};

const createCookie = (tokenData: TokenData): string => {
    return `Authorization=${tokenData.token}; SameSite=None; Secure; Path=/; Max-Age=${tokenData.expiresIn}`;
};

const createToken = (user: User): TokenData => {
    const expiresIn = 24 * 60 * 60; // 1 day
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
        _id: user._id.toString(),
    };
    return {
        expiresIn,
        token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
};

export { generatePassword, comparePassword, createCookie, createToken };
