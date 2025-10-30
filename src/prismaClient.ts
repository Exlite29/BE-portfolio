import { PrismaClient } from "@prisma/client";

// Create a single shared PrismaClient instance
export const prisma = new PrismaClient();
