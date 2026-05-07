import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middlewares";
import { ApiError } from "./utils/ApiError";
import routes from "./routes";


const app: Application = express();

// ============================================
// Middlewares
// ============================================

app.use(helmet());

// CORS configuration
app.use(cors({
    origin: env.NODE_ENV === "production" ? env.CORS_ORIGIN : ["http://localhost:3003", "http://localhost:3000", "http://localhost:5173", env.CORS_ORIGIN],
    credentials: true,
}));

// Logging configuration
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Routes
// ============================================

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Hospital Management System API",
        version: "1.0.0",
    });
});

app.use("/api", routes);

// ============================================
// Error Handling
// ============================================

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
    const msg = `Route ${req.method} ${req.originalUrl} not found`;
    console.log(`❌ 404: ${msg}`);
    next(ApiError.notFound(msg));
});

// Global Error Handler
app.use(errorHandler);

export default app;
