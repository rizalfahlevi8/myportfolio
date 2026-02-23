import * as z from "zod"
import { Skill } from "./skill-schema";

export interface Project {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  features: string[];       
  libraries: string[];      
  background: string;     
  solution: string;       
  challenge: string;        
  businessImpact: string | null; 
  githubUrl: string;
  liveUrl: string;
  thumbnail: string;
  gallery: string[];        
  createdAt: Date;
  updatedAt: Date | null;
  Skills: Skill[];
  aboutId?: string | null; 
}

export interface UpdateProjectOptions {
  thumbnailFile?: File | null;
  thumbnailDeleted?: boolean;
  existingGallery?: string[];   
  galleryFiles?: File[];        
  deletedGallery?: string[];    
  allGalleryDeleted?: boolean;
  setIsUploadingThumbnail?: (val: boolean) => void;
  setIsUploadingGallery?: (val: boolean) => void;
}

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  features: z.array(z.string().min(1, "Feature cannot be empty"))
    .min(1, "At least one feature is required"),
  libraries: z.array(z.string().min(1, "Library cannot be empty"))
    .min(1, "At least one library is required"),
  background: z.string().min(1, "Background is required"),
  solution: z.string().min(1, "Solution is required"),
  challenge: z.string().min(1, "Challenge is required"),
  businessImpact: z.string().optional().nullable(), 
  githubUrl: z.string()
    .refine(val => val === "" || z.string().url().safeParse(val).success, "Invalid GitHub URL"),
  liveUrl: z.string()
    .refine(val => val === "" || z.string().url().safeParse(val).success, "Invalid Live URL"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  gallery: z.array(z.string().min(1, "Photo cannot be empty"))
    .min(1, "At least one gallery image is required"),
  skillId: z.array(z.string()).optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>