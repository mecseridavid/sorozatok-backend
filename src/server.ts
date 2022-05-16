import { config } from "dotenv";

import App from "./app";
import AuthenticationController from "./authentication/authentication.controller";
import EpisodeController from "./episode/episode.controller";
import UserController from "./user/user.controller";
import TitleController from "./title/title.controller";
import validateEnv from "./utils/validateEnv";

config();
validateEnv();

const app = new App([new EpisodeController(), new AuthenticationController(), new UserController(), new TitleController()]);

app.listen();
