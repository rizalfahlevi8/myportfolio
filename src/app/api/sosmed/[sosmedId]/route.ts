import { ApiResponse } from "@/lib/server/api-response/api-response";
import { handleError } from "@/lib/server/api-response/handle-error";
import db from "@/lib/server/prisma";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ sosmedId: string }> }
) {
  try {
    const { sosmedId } = await context.params;

    await db.sosmed.deleteMany({
      where: {
        id: sosmedId,
      },
    });

    return ApiResponse.success(null, "Sosmed berhasil dihapus");
  } catch (error) {
    return handleError(error, "SOSMED_DELETE");
  }
}

export async function PUT(
  _req: Request,
  context: { params: Promise<{ sosmedId: string }> }
) {
  try {
    const { sosmedId } = await context.params;
    const body = await _req.json();

    const { id, name, url } = body;

    const sosmed = await db.sosmed.updateMany({
      where: {
        id: sosmedId,
      },
      data: {
        id,
        name,
        url
      }
    })

    return ApiResponse.success(sosmed, "Sosmed berhasil diupdate");

  } catch (error) {
    return handleError(error, "SOSMED_UPDATE");
  }
}
