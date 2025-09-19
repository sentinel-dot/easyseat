import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route
app.get('/', (req: express.Request, res: express.Response) => {
    console.log('Received GET /');
    res.json({
        message: 'easyseat backend api',
        version: '1.0.0'
    });
});

// 404 - Handler
app.use((req: express.Request, res: express.Response) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
    console.log(`Route ${req.originalUrl} not found`);
});

const startServer = async() => {
    console.log('Starting server...');
    try {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 CORS enabled for: ${process.env.FRONTEND_URL}`);
            console.log('\n📚 Available endpoints:');
            console.log(`   GET  / - Info check`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit();
    }
};

startServer();
