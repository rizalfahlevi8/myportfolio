import { Prisma } from "@/generated/prisma/client";
import { ApiResponse } from "./api-response";

export function handleError(error: unknown, tag = "API_ERROR") {
  console.error(`[${tag}]`, error);

  // Prisma known error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2025":
        return ApiResponse.error("Data tidak ditemukan", 404);

      case "P2002":
        return ApiResponse.error("Data sudah ada / duplicate", 400);

      default:
        return ApiResponse.error("Database error", 500, error.message);
    }
  }

  // Prisma validation error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return ApiResponse.error("Validation error", 400, error.message);
  }

  // JSON parse error
  if (error instanceof SyntaxError) {
    return ApiResponse.error("Format JSON tidak valid", 400);
  }

  return ApiResponse.error("Internal Server Error", 500);
}
