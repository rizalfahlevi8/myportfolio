import { Prisma } from "@/generated/prisma/client";
import { ApiResponse } from "@/lib/server/api-response/api-response";
import { handleError } from "@/lib/server/api-response/handle-error";
import db from "@/lib/server/prisma";
import { saveFile } from "@/lib/server/server-utils";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const about = await db.about.findMany({
      select: {
        id: true,
        name: true,
        jobTitle: true,
        introduction: true,
        profilePicture: true,

        Skills: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },

        sosmed: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },

        workExperiences: {
          select: {
            id: true,
            position: true,
            employmenttype: true,
            company: true,
            location: true,
            locationtype: true,
            description: true,
            startDate: true,
            endDate: true,
            Skills: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },

        projects: {
          select: {
            id: true,
            title: true,
            description: true,
            feature: true,
            technology: true,
            githubUrl: true,
            liveUrl: true,
            thumbnail: true,
            photo: true,
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
        },
      },
    });

    return ApiResponse.success(about);
  } catch (error) {
    return handleError(error, "ABOUT_GET");
  }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // Ambil semua value
        const name = formData.get("name") as string;
        const jobTitle = formData.get("jobTitle") as string;
        const introduction = formData.get("introduction") as string;
        const skillId = JSON.parse(formData.get("skillId") as string || "[]") as string[];
        const sosmedId = JSON.parse(formData.get("sosmedId") as string || "[]") as string[];
        const projectId = JSON.parse(formData.get("projectId") as string || "[]") as string[];
        const workExperienceId = JSON.parse(formData.get("workExperienceId") as string || "[]") as string[];

        // Profile picture logic
        let profilePath = "";
        
        if (formData.has("profile")) {
            const file = formData.get("profile") as File;
            profilePath = await saveFile(file, "profile");
        }

        // Create database
        const createData: Prisma.AboutCreateInput = {
            name,
            jobTitle,
            introduction,
            profilePicture: profilePath,
            Skills: { 
                connect: skillId.map((id: string) => ({ id })) 
            },
            sosmed: { 
                connect: sosmedId.map((id: string) => ({ id })) 
            },
            projects: { 
                connect: projectId.map((id: string) => ({ id })) 
            },
            workExperiences: { 
                connect: workExperienceId.map((id: string) => ({ id })) 
            }
        };

        const about = await db.about.create({
            data: createData,
            include: {
                Skills: { select: { id: true, name: true, icon: true } },
                sosmed: true,
                projects: true,
                workExperiences: true,
            }
        });

        return ApiResponse.success(about, "About berhasil dibuat", 201);
    } catch (error) {
        console.log('[ABOUT_POST]', error);
        return handleError(error, "ABOUT_POST");
    }
}
