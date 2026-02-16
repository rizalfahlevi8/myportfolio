import { ApiResponse } from "@/lib/server/api-response/api-response";
import { handleError } from "@/lib/server/api-response/handle-error";
import db from "@/lib/server/prisma";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await context.params;

    const skill = await db.skill.deleteMany({
      where: {
        id: skillId,
      },
    });

    return ApiResponse.success(skill, "Skill berhasil dihapus");
  } catch (error) {
    return handleError(error, "SKILL_DELETE");
  }
}

export async function PUT(
  _req: Request,
  context: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await context.params;
    const body = await _req.json();

    const { id, name, icon } = body;

    const skill = await db.skill.updateMany({
      where: {
        id: skillId,
      },
      data: {
        id,
        name,
        icon
      }
    })

    return ApiResponse.success(skill, "Skill berhasil diupdate");
  } catch (error) {
    return handleError(error, "SKILL_UPDATE");
  }
}
