import { PATH_API_NEXT_PROJECT } from "@/constants/routes/pages/menu/configuration";
import { axiosFetcher } from "@/lib/axios/axiosFetcher";
import { Project, ProjectFormValues } from "@/schema/project-schema";

// GET: Fetch all projects
export const getProjects = async (): Promise<Project[]> => {
  const res = await axiosFetcher<Project[]>("get", PATH_API_NEXT_PROJECT);
  
  // Mengembalikan array, atau array kosong jika tidak ada data
  return res.data ?? [];
};

// POST: Add new project
type PostProjectPayload = {
  data: ProjectFormValues;
  thumbnail?: File | null;  // ✅ Ubah dari thumbnailFile ke thumbnail
  photos?: File[];          // ✅ Ubah dari photoFiles ke photos
};

export const postProject = async ({
  data,
  thumbnail,              // ✅ Ubah dari thumbnailFile ke thumbnail
  photos = [],            // ✅ Ubah dari photoFiles ke photos
}: PostProjectPayload): Promise<Project> => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("feature", JSON.stringify(data.feature));
  formData.append("technology", JSON.stringify(data.technology));
  formData.append("githubUrl", data.githubUrl ?? "");
  formData.append("liveUrl", data.liveUrl ?? "");
  formData.append("skillId", JSON.stringify(data.skillId ?? []));

  if (thumbnail) {                    // ✅ Ubah dari thumbnailFile ke thumbnail
    formData.append("thumbnail", thumbnail);
  }

  if (photos.length > 0) {           // ✅ Ubah dari photoFiles ke photos
    photos.forEach((file) => formData.append("photo", file));
  }

  const res = await axiosFetcher<Project>("post", PATH_API_NEXT_PROJECT, formData);

  if (!res.data) {
    throw new Error("Project creation failed: data kosong");
  }

  return res.data;
};

// PUT: Update project
type PutProjectPayload = {
  projectId: string;
  updateData: {           // ✅ Wrap semua properti dalam updateData
    data: ProjectFormValues;
    thumbnailFile?: File | null;
    photoFiles?: File[];
    existingPhotos?: string[];
    deletedPhotos?: string[];
    thumbnailDeleted?: boolean;
    oldThumbnail?: string;
  };
};

export const putProject = async ({
  projectId,
  updateData,             // ✅ Terima sebagai updateData
}: PutProjectPayload): Promise<Project> => {
  const {
    data,
    thumbnailFile,
    photoFiles = [],
    existingPhotos = [],
    deletedPhotos = [],
    thumbnailDeleted = false,
    oldThumbnail = "",
  } = updateData;         // ✅ Destructure dari updateData

  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("description", data.description);
  
  // Menyertakan logika filter yang ada di store sebelumnya
  formData.append(
    "feature",
    JSON.stringify(data.feature.filter((desc) => desc.trim() !== ""))
  );
  formData.append(
    "technology",
    JSON.stringify(data.technology.filter((desc) => desc.trim() !== ""))
  );
  
  formData.append("githubUrl", data.githubUrl ?? "");
  formData.append("liveUrl", data.liveUrl ?? "");
  formData.append("skillId", JSON.stringify(data.skillId ?? []));

  formData.append("oldThumbnail", oldThumbnail);

  if (thumbnailFile) {
    formData.append("thumbnail", thumbnailFile);
  } else if (thumbnailDeleted) {
    formData.append("thumbnailDeleted", "true");
  }

  formData.append("oldPhotos", JSON.stringify(existingPhotos));

  if (photoFiles.length > 0) {
    photoFiles.forEach((file) => formData.append("photo", file));
  }

  if (deletedPhotos.length > 0) {
    formData.append("deletedPhotos", JSON.stringify(deletedPhotos));
  }

  const res = await axiosFetcher<Project>(
    "put",
    `${PATH_API_NEXT_PROJECT}/${projectId}`,
    formData
  );

  if (!res.data) {
    throw new Error("Project update gagal: data kosong");
  }

  return res.data;
};

// DELETE: Remove project
export const deleteProject = async (projectId: string): Promise<void> => {
  await axiosFetcher("delete", `${PATH_API_NEXT_PROJECT}/${projectId}`);
};