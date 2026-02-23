import { ApiResponse } from "@/lib/server/api-response/api-response";
import { handleError } from "@/lib/server/api-response/handle-error";
import db from "@/lib/server/prisma";
import { writeFile } from "fs/promises";
import { NextRequest } from "next/server";
import path from "path";

export async function GET() {
  try {
    const projects = await db.project.findMany({
      select: {
        id: true,
        title: true,
        slug: true,           
        tagline: true,        
        description: true,
        category: true,       
        features: true,       
        libraries: true,      
        background: true,     
        solution: true,       
        challenge: true,      
        businessImpact: true, 
        githubUrl: true,
        liveUrl: true,
        thumbnail: true,
        gallery: true,        
        About: true,
        Skills: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ApiResponse.success(projects);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return handleError(error, "PROJECT_GET");
  }
}

export async function POST(req: NextRequest) {
  try {
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
    const githubUrl = formData.get("githubUrl") as string;
    const liveUrl = formData.get("liveUrl") as string;
    const features = JSON.parse(formData.get("features") as string || "[]");
    const libraries = JSON.parse(formData.get("libraries") as string || "[]");
    const skillId = JSON.parse(formData.get("skillId") as string || "[]") as string[];

    let thumbnailUrl = "";
    const thumbnailFile = formData.get("thumbnail") as File | null;
    if (thumbnailFile && typeof thumbnailFile.arrayBuffer === "function") {
      thumbnailUrl = await saveFile(thumbnailFile, "thumbnail");
    }

    let galleryUrls: string[] = [];
    const galleryFiles = formData.getAll("gallery") as File[];
    if (galleryFiles && galleryFiles.length > 0) {
      galleryUrls = await Promise.all(
        galleryFiles
          .filter(file => typeof file.arrayBuffer === "function")
          .map(file => saveFile(file, "gallery")) // Simpan di folder 'gallery'
      );
    }

    const project = await db.project.create({
      data: {
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
        thumbnail: thumbnailUrl,
        gallery: galleryUrls, 
        Skills: {
          connect: skillId?.map((id: string) => ({ id })) || []
        }
      }
    });

    return ApiResponse.success(project, "Project berhasil dibuat", 201);
  } catch (error) {
    console.log("[PROJECT_POST]", error);
    return handleError(error, "PROJECT_POST");
  }
}

async function saveFile(file: File, folder = "uploads") {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name}`;
  const uploadDir = path.join(process.cwd(), "public", folder, filename);
  await writeFile(uploadDir, buffer);
  return `/${folder}/${filename}`;
}