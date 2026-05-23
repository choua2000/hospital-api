import app from "./app";
import { env } from "./config/env";
import prisma from "./config/database";

const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log("✅ Database connection established");

        const PORT = env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`🔧 Environment: ${env.NODE_ENV}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();