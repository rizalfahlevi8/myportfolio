import { ApiResponse } from "@/lib/server/api-response/api-response";
import { handleError } from "@/lib/server/api-response/handle-error";
import db from "@/lib/server/prisma";

export async function GET() {
  try {
    const workExperience = await db.workExperience.findMany({
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
        createdAt: "desc",
      },
    });

    return ApiResponse.success(workExperience);
  } catch (error) {
    return handleError(error, "WORK_EXPERIENCE_GET");
  }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { position, employmenttype, company, location, locationtype, description, startDate, endDate, skillId } = body;

        const workExperience = await db.workExperience.create({
            data: {
                position,
                employmenttype,
                company,
                location,
                locationtype,
                description,
                startDate,
                endDate,
                Skills: {
                    connect: skillId?.map((id: string) => ({ id })) || []
                }
            }
        });

        return ApiResponse.success(workExperience, "Work experience berhasil dibuat", 201);
    } catch (error) {
        return handleError(error, "WORK_EXPERIENCE_POST");
    }
}