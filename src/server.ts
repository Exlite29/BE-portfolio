import dotenv from "dotenv";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";

import contactRouter from "./routes/contact";
import { prisma } from "./prismaClient";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Simple health-check route
app.get("/health", async (req: Request, res: Response) => {
  try {
    // Check DB connection by pinging Prisma
    await prisma.$connect();
  } catch (err) {
    // For MongoDB, $queryRaw may behave differently; just report status
  }
  res.json({ status: "ok" });
});

app.use("/api/contact", contactRouter);

// 404 error
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
