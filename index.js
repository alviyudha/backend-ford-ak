import express from "express";
import cors from "cors";
import winston from "winston";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import imgSlideControllers from "./routes/imgSlideRoutes.js";
import users from "./routes/userRoutes.js";
import dealer from "./routes/dealerRoutes.js";
import vehicle from "./routes/vehicleRoutes.js";
import trims from "./routes/trimRoutes.js";
import colors from "./routes/colorRoutes.js";
import miniSpec from "./routes/miniSpecRoutes.js";
import spec from "./routes/specificationRoutes.js";
import joinData from "./routes/joinDataRoutes.js";
import messageUser from "./routes/messageRoutes.js";
import auth from "./routes/AuthRoutes.js";
import session from "express-session";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "http://localhost:5173"],
    },
  })
);
app.use(morgan("combined", { stream: accessLogStream }));

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
    }),
    new winston.transports.Console(),
  ],
});
app.use(session({
  secret: process.env.SESS_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
  })
);
app.use(express.static("public"));

app.use(users);
app.use(imgSlideControllers);
app.use(dealer);
app.use(vehicle);
app.use(trims);
app.use(colors);
app.use(miniSpec);
app.use(spec);
app.use(joinData);
app.use(messageUser);
app.use(auth);

const PORT = process.env.APP_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
