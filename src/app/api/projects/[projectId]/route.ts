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
      select: { thumbnail: true, gallery: true } 
    });

    if (project) {
      if (project.thumbnail) {
        await safeDeleteFile(project.thumbnail);
      }
      if (project.gallery && Array.isArray(project.gallery)) {
        for (const filePath of project.gallery) {
          await safeDeleteFile(filePath);
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

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const tagline = formData.get("tagline") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    
    const background = formData.get("background") as string;
    const solution = formData.get("solution") as string;
    const challenge = formData.get("challenge") as string;
    const businessImpact = formData.get("businessImpact") as string | null;

    const features = JSON.parse(formData.get("features") as string || "[]") as string[];
    const libraries = JSON.parse(formData.get("libraries") as string || "[]") as string[];
    const skillId = JSON.parse(formData.get("skillId") as string || "[]") as string[];

    const githubUrl = formData.get("githubUrl") as string;
    const liveUrl = formData.get("liveUrl") as string;

    const oldThumbnail = formData.get("oldThumbnail") as string;
    let thumbnailPath = oldThumbnail;

    if (formData.has("thumbnail")) {
      const file = formData.get("thumbnail") as File;
      if (file && typeof file.arrayBuffer === "function") {
         if (oldThumbnail) await safeDeleteFile(oldThumbnail);
         thumbnailPath = await saveFile(file, "thumbnails");
      }
    } else if (formData.get("thumbnailDeleted") === "true") {
      if (oldThumbnail) await safeDeleteFile(oldThumbnail);
      thumbnailPath = "";
    }

    const oldGallery = JSON.parse(formData.get("oldGallery") as string || "[]") as string[];
    const deletedGallery = formData.has("deletedGallery")
      ? JSON.parse(formData.get("deletedGallery") as string) as string[]
      : [];

    for (const del of deletedGallery) {
      await safeDeleteFile(del);
    }

    const galleryFiles = formData.getAll("gallery").filter(f => f instanceof File) as File[];
    const newGallery = await Promise.all(
      galleryFiles.map(file => saveFile(file, "gallery")) 
    );

    const finalGallery = [
      ...oldGallery.filter(x => !deletedGallery.includes(x)),
      ...newGallery
    ];

    const updateData: Prisma.ProjectUpdateInput = {
      title,
      slug,
      tagline,
      description,
      category,
      features,       
      libraries,      
      background,     
      solution,       
      challenge,      
      businessImpact, 
      githubUrl,
      liveUrl,
      thumbnail: thumbnailPath,
      gallery: finalGallery, 
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