import { ApiResponse } from "@/lib/server/api-response/api-response";
import { handleError } from "@/lib/server/api-response/handle-error";
import db from "@/lib/server/prisma";

export async function GET() {
  try {
    const skill = await db.skill.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ApiResponse.success(skill);
  } catch (error) {
    return handleError(error, "SKILL_GET");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { icon, name } = body;

    const skill = await db.skill.create({
      data: {
        icon,
        name,
      },
    });

    return ApiResponse.success(skill, "Skill berhasil dibuat", 201);
  } catch (error) {
    return handleError(error, "SKILL_POST");
  }
}
