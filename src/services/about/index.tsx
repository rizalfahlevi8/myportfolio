import { PATH_API_NEXT_ABOUT } from "@/constants/routes/pages/menu/configuration"
import { axiosFetcher } from "@/lib/axios/axiosFetcher"
import { About, AboutFormValues } from "@/schema/about-schema";

export const getAbout = async (): Promise<About | null> => {
  const res = await axiosFetcher<About[]>("get", PATH_API_NEXT_ABOUT);
  return res.data?.[0] ?? null;
};

type PutAboutPayload = {
  aboutId: string;
  data: AboutFormValues;
  profileFile?: File | null;
  profileDeleted?: boolean;
  oldProfile?: string;
};

export const putAbout = async ({
  aboutId,
  data,
  profileFile,
  profileDeleted = false,
  oldProfile = "",
}: PutAboutPayload): Promise<About> => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("jobTitle", data.jobTitle);
  formData.append("introduction", data.introduction);

  formData.append("skillId", JSON.stringify(data.skillId ?? []));
  formData.append("sosmed", JSON.stringify(data.sosmed ?? []));
  formData.append("projects", JSON.stringify(data.projects ?? []));
  
  // TAMBAHKAN BARIS INI
  formData.append("workExperiences", JSON.stringify(data.workExperiences ?? []));

  formData.append("oldProfile", oldProfile);

  if (profileFile) {
    formData.append("profile", profileFile);
  } else if (profileDeleted) {
    formData.append("profileDeleted", "true");
  }

  const res = await axiosFetcher<About>(
    "put",
    `${PATH_API_NEXT_ABOUT}/${aboutId}`,
    formData
  );

  if (!res.data) {
    throw new Error("About update gagal: data kosong");
  }

  return res.data;
};