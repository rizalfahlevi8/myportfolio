import { Prisma } from "@/generated/prisma/client";
import { ApiResponse } from "@/lib/server/api-response/api-response";
import { handleError } from "@/lib/server/api-response/handle-error";
import db from "@/lib/server/prisma";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ workExperienceId: string }> }
) {
  try {
    const { workExperienceId } = await context.params;

    await db.workExperience.deleteMany({
      where: {
        id: workExperienceId,
      },
    });

    return ApiResponse.success(null, "Work experience berhasil dihapus");
  } catch (error) {
    return handleError(error, "WORK_EXPERIENCE_DELETE");
  }
}

export async function PUT(
  _req: Request,
  context: { params: Promise<{ workExperienceId: string }> }
) {
  try {
    const { workExperienceId } = await context.params;
    const body = await _req.json();

    const { 
      position, 
      employmenttype, 
      company, 
      location, 
      locationtype, 
      description, 
      startDate, 
      endDate, 
      skills,
      skillId
    } = body;

    let skillIds: string[] = [];
    
    if (skills && Array.isArray(skills)) {
      skillIds = skills;
    } else if (skillId && Array.isArray(skillId)) {
      skillIds = skillId;
    } else if (typeof skills === 'string') {
      skillIds = [skills];
    } else if (typeof skillId === 'string') {
      skillIds = [skillId];
    }

    const updateData: Prisma.WorkExperienceUpdateInput = {
      position,
      employmenttype,
      company,
      location,
      locationtype,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : null,
    };

    if (skillIds.length > 0) {
      updateData.Skills = {
        set: skillIds.map((skillId: string) => ({ id: skillId })),
      };
    } else {
      updateData.Skills = {
        set: [],
      };
    }

    const workExperience = await db.workExperience.update({
      where: {
        id: workExperienceId,
      },
      data: updateData,
      include: {
        Skills: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    return ApiResponse.success(workExperience, "Work experience berhasil diupdate");

  } catch (error) {
    return handleError(error, "WORK_EXPERIENCE_UPDATE");
  }
}