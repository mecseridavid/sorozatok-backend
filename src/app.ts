import * as favicon from "serve-favicon";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as mongoose from "mongoose";
import * as cors from "cors";
import Controller from "./interfaces/controller.interface";
import errorMiddleware from "./middleware/error.middleware";
import loggerMiddleware from "./middleware/logger.middleware";

export default class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    public listen(): void {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`);
        });
    }

    public getServer(): express.Application {
        return this.app;
    }

    private initializeMiddlewares() {
        try {
            this.app.use(favicon(path.join(__dirname, "../favicon.ico")));
        } catch (error) {
            console.log(error.message);
        }
        this.app.use(express.json());
        this.app.use(cookieParser());
        // Enabled CORS:
        this.app.use(
            cors(<cors.CorsOptions>{
                origin: ["https://6294a015d3a79e0a80a36497--harmonious-concha-72bcb1.netlify.app", "http://localhost:8080"],
                credentials: true,
                exposedHeaders: ["set-cookie"],
            }),
        );
        this.app.use(loggerMiddleware);
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach(controller => {
            this.app.use("/", controller.router);
        });
    }

    private connectToTheDatabase() {
        if (process.env.NODE_ENV === "development") {
            mongoose.connect("mongodb://localhost:27017/sorozatok", err => {
                if (err) {
                    console.log("Unable to connect to the server. Please start MongoDB.");
                }
            });
        } else {
            const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH, MONGO_DB } = process.env;
            // Connect to MongoDB Atlas, create database if not exist::
            mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}${MONGO_DB}?retryWrites=true&w=majority`, err => {
                if (err) {
                    console.log("Unable to connect to the server. Please check your connection string.");
                }
            });
        }

        mongoose.connection.on("error", (error: Error) => {
            console.log(`Mongoose error message: ${error.message}`);
        });
        if (process.env.NODE_ENV === "development") {
            mongoose.connection.on("connected", () => {
                console.log("Connected to local MongoDB server.");
            });
        } else {
            mongoose.connection.on("connected", () => {
                console.log("Connected to atlas MongoDB server.");
            });
        }
    }
}
