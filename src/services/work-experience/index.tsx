import { PATH_API_NEXT_WORKEXPERIENCE } from "@/constants/routes/pages/menu/configuration";
import { axiosFetcher } from "@/lib/axios/axiosFetcher";
import { WorkExperience, WorkExperienceFormValues } from "@/schema/workexperience-schema";

// GET: Fetch all work experiences
export const getWorkExperiences = async (): Promise<WorkExperience[]> => {
  const res = await axiosFetcher<WorkExperience[]>("get", PATH_API_NEXT_WORKEXPERIENCE);
  
  // Mengembalikan array, atau array kosong jika tidak ada data
  return res.data ?? [];
};

// POST: Add new work experience
export const postWorkExperience = async (
  data: WorkExperienceFormValues
): Promise<WorkExperience> => {
  // Membersihkan data sebelum dikirim (filter deskripsi kosong)
  const payload = {
    ...data,
    description: data.description.filter((desc) => desc.trim() !== ""),
    skillId: data.skillId ?? [], // Default ke array kosong jika undefined
  };

  const res = await axiosFetcher<WorkExperience>("post", PATH_API_NEXT_WORKEXPERIENCE, payload);

  if (!res.data) {
    throw new Error("Work Experience creation failed: data kosong");
  }

  return res.data;
};

// PUT: Update work experience
type PutWorkExperiencePayload = {
  workExperienceId: string;
  data: WorkExperienceFormValues;
};

export const putWorkExperience = async ({
  workExperienceId,
  data,
}: PutWorkExperiencePayload): Promise<WorkExperience> => {
  // Membersihkan data sebelum dikirim
  const payload = {
    ...data,
    description: data.description.filter((desc) => desc.trim() !== ""),
    skillId: data.skillId ?? [],
  };

  const res = await axiosFetcher<WorkExperience>(
    "put",
    `${PATH_API_NEXT_WORKEXPERIENCE}/${workExperienceId}`,
    payload
  );

  if (!res.data) {
    throw new Error("Work Experience update gagal: data kosong");
  }

  return res.data;
};

// DELETE: Remove work experience
export const deleteWorkExperience = async (workExperienceId: string): Promise<void> => {
  await axiosFetcher("delete", `${PATH_API_NEXT_WORKEXPERIENCE}/${workExperienceId}`);
};