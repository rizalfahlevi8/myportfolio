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
  thumbnail?: File | null;
  galleryFiles?: File[]; // Diubah: photos -> galleryFiles
};

export const postProject = async ({
  data,
  thumbnail,
  galleryFiles = [], // Diubah: photos -> galleryFiles
}: PostProjectPayload): Promise<Project> => {
  const formData = new FormData();

  // --- Basic Fields ---
  formData.append("title", data.title);
  formData.append("slug", data.slug); // Ditambahkan
  formData.append("tagline", data.tagline); // Ditambahkan
  formData.append("description", data.description);
  formData.append("category", data.category); // Ditambahkan
  formData.append("background", data.background); // Ditambahkan
  formData.append("solution", data.solution); // Ditambahkan
  formData.append("challenge", data.challenge); // Ditambahkan
  formData.append("businessImpact", data.businessImpact ?? ""); // Ditambahkan

  // --- Array Fields ---
  formData.append("features", JSON.stringify(data.features)); // Diubah: feature -> features
  formData.append("libraries", JSON.stringify(data.libraries)); // Diubah: technology -> libraries

  // --- URLs ---
  formData.append("githubUrl", data.githubUrl ?? "");
  formData.append("liveUrl", data.liveUrl ?? "");
  
  // --- Relations ---
  formData.append("skillId", JSON.stringify(data.skillId ?? []));

  // --- File Uploads ---
  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  // Diubah: key 'photo' -> 'gallery'
  if (galleryFiles.length > 0) {
    galleryFiles.forEach((file) => formData.append("gallery", file));
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
  updateData: {
    data: ProjectFormValues;
    thumbnailFile?: File | null;
    galleryFiles?: File[];       // Diubah: photoFiles -> galleryFiles
    existingGallery?: string[];  // Diubah: existingPhotos -> existingGallery
    deletedGallery?: string[];   // Diubah: deletedPhotos -> deletedGallery
    thumbnailDeleted?: boolean;
    oldThumbnail?: string;
  };
};

export const putProject = async ({
  projectId,
  updateData,
}: PutProjectPayload): Promise<Project> => {
  const {
    data,
    thumbnailFile,
    galleryFiles = [],       // Diubah
    existingGallery = [],    // Diubah
    deletedGallery = [],     // Diubah
    thumbnailDeleted = false,
    oldThumbnail = "",
  } = updateData;

  const formData = new FormData();

  // --- Basic Fields ---
  formData.append("title", data.title);
  formData.append("slug", data.slug); // Ditambahkan
  formData.append("tagline", data.tagline); // Ditambahkan
  formData.append("description", data.description);
  formData.append("category", data.category); // Ditambahkan
  formData.append("background", data.background); // Ditambahkan
  formData.append("solution", data.solution); // Ditambahkan
  formData.append("challenge", data.challenge); // Ditambahkan
  formData.append("businessImpact", data.businessImpact ?? ""); // Ditambahkan

  // --- Array Fields ---
  // Menyertakan logika filter
  formData.append(
    "features",
    JSON.stringify(data.features.filter((desc) => desc.trim() !== ""))
  );
  formData.append(
    "libraries",
    JSON.stringify(data.libraries.filter((desc) => desc.trim() !== ""))
  );

  // --- URLs ---
  formData.append("githubUrl", data.githubUrl ?? "");
  formData.append("liveUrl", data.liveUrl ?? "");
  formData.append("skillId", JSON.stringify(data.skillId ?? []));

  // --- Thumbnail Logic ---
  formData.append("oldThumbnail", oldThumbnail);

  if (thumbnailFile) {
    formData.append("thumbnail", thumbnailFile);
  } else if (thumbnailDeleted) {
    formData.append("thumbnailDeleted", "true");
  }

  // --- Gallery Logic ---
  // Diubah: key 'oldPhotos' -> 'oldGallery'
  formData.append("oldGallery", JSON.stringify(existingGallery));

  // Diubah: key 'photo' -> 'gallery'
  if (galleryFiles.length > 0) {
    galleryFiles.forEach((file) => formData.append("gallery", file));
  }

  // Diubah: key 'deletedPhotos' -> 'deletedGallery'
  if (deletedGallery.length > 0) {
    formData.append("deletedGallery", JSON.stringify(deletedGallery));
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