import { Prisma } from "@/generated/prisma/client";
import { ApiResponse } from "@/lib/server/api-response/api-response";
import { handleError } from "@/lib/server/api-response/handle-error";
import db from "@/lib/server/prisma";
import { safeDeleteFile, saveFile } from "@/lib/server/server-utils";
import { NextRequest } from "next/server";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { thumbnail: true, photo: true }
    });

    if (project) {
      if (project.thumbnail) {
        await safeDeleteFile(project.thumbnail);
      }
      if (project.photo && Array.isArray(project.photo)) {
        for (const photoPath of project.photo) {
          await safeDeleteFile(photoPath);
        }
      }
    }

    await db.project.delete({
      where: { id: projectId }
    });

    return ApiResponse.success(null, "Project berhasil dihapus");
  } catch (error) {
    return handleError(error, "PROJECT_DELETE");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const formData = await req.formData();

    // Ambil semua value
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const feature = JSON.parse(formData.get("feature") as string) as string[];
    const technology = JSON.parse(formData.get("technology") as string) as string[];
    const githubUrl = formData.get("githubUrl") as string;
    const liveUrl = formData.get("liveUrl") as string;
    const skillId = JSON.parse(formData.get("skillId") as string) as string[];

    // Thumbnail logic
    const oldThumbnail = formData.get("oldThumbnail") as string;
    let thumbnailPath = oldThumbnail;

    if (formData.has("thumbnail")) {
      const file = formData.get("thumbnail") as File;
      if (oldThumbnail) await safeDeleteFile(oldThumbnail);
      thumbnailPath = await saveFile(file, "thumbnails");
    } else if (formData.get("thumbnailDeleted") === "true") {
      if (oldThumbnail) await safeDeleteFile(oldThumbnail);
      thumbnailPath = "";
    }

    // Photos logic
    const oldPhotos = JSON.parse(formData.get("oldPhotos") as string) as string[] || [];
    const deletedPhotos = formData.has("deletedPhotos")
      ? JSON.parse(formData.get("deletedPhotos") as string) as string[]
      : [];
    for (const del of deletedPhotos) {
      await safeDeleteFile(del);
    }
    // Simpan foto baru
    const photoFiles = formData.getAll("photo").filter(f => f instanceof File) as File[];
    const newPhotos = await Promise.all(photoFiles.map(file => saveFile(file, "photos")));
    const finalPhotos = [
      ...oldPhotos.filter(x => !deletedPhotos.includes(x)),
      ...newPhotos
    ];

    // Update database
    const updateData: Prisma.ProjectUpdateInput = {
      title,
      description,
      feature,
      technology,
      githubUrl,
      liveUrl,
      thumbnail: thumbnailPath,
      photo: finalPhotos,
      Skills: { set: skillId.map((id: string) => ({ id })) }
    };


    const project = await db.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        Skills: { select: { id: true, name: true, icon: true } }
      }
    });

    return ApiResponse.success(project, "Project berhasil diupdate");
  } catch (error) {
    console.log('[PROJECT_UPDATE]', error);
    return handleError(error, "PROJECT_UPDATE");
  }
}