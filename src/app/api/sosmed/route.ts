import { ApiResponse } from "@/lib/server/api-response/api-response";
import { handleError } from "@/lib/server/api-response/handle-error";
import db from "@/lib/server/prisma";

export async function GET() {
    try {
        const sosmed = await db.sosmed.findMany({
            select: {
                id: true,
                name: true,
                url: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

    return ApiResponse.success(sosmed);
  } catch (error) {
    return handleError(error, "SOSMED_GET");
  }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { name, url } = body;

        const sosmed = await db.sosmed.create({
            data: {
                name,
                url
            }
        });

        return ApiResponse.success(sosmed, "Sosmed berhasil dibuat", 201);
    } catch (error) {
        return handleError(error, "SOSMED_POST");
    }
}