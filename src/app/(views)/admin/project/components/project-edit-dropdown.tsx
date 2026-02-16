"use client";

import { useState, useRef, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Project, ProjectFormValues, projectSchema } from "@/schema/project-schema";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  Save,
  X,
  Plus,
  Upload,
  Image,
} from "lucide-react";
import NextImage from "next/image";
import ReactSelect from "react-select";
import toast from "react-hot-toast";
import { axiosFetcher } from "@/lib/axios/axiosFetcher";
import { PATH_API_NEXT_SKILL } from "@/constants/routes/pages/menu/configuration";

// Helper function untuk convert Zod schema ke TanStack Form validator
const createZodValidator = (schema: z.ZodType<any>) => {
  return ({ value }: { value: any }) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      return result.error.errors[0]?.message || "Validation error";
    }
    return undefined;
  };
};

interface ProjectEditDropdownProps {
  project: Project;
  onUpdate: (projectId: string, updateData: {
    data: ProjectFormValues;
    thumbnailFile?: File | null;
    photoFiles?: File[];
    existingPhotos?: string[];
    deletedPhotos?: string[];
    thumbnailDeleted?: boolean;
    oldThumbnail?: string;
  }) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
}

export function ProjectEditDropdown({
  project,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  disabled = false,
}: ProjectEditDropdownProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // --- File States (Managed separately from Form Values) ---
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [deletedPhotos, setDeletedPhotos] = useState<string[]>([]);
  const [thumbnailDeleted, setThumbnailDeleted] = useState<boolean>(false);

  // Refs for file inputs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  // --- Fetch Skills with TanStack Query ---
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const res = await axiosFetcher<any[]>("get", PATH_API_NEXT_SKILL);
      return res.data ?? [];
    },
    enabled: isEditDialogOpen, // Only fetch when dialog is open
  });

  // --- Computed Value ---
  const allPhotosDeleted = useMemo(() => {
    const hasExistingPhotos = existingPhotos.length > 0;
    const hasNewPhotos = photoFiles.length > 0;
    return !hasExistingPhotos && !hasNewPhotos;
  }, [existingPhotos, photoFiles]);

  // --- TanStack Form Setup ---
  const form = useForm({
    defaultValues: {
      title: project.title,
      description: project.description,
      feature: project.feature?.length ? project.feature : [""],
      technology: project.technology?.length ? project.technology : [""],
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      skillId: project.Skills?.map((s) => s.id) || [],
    } as Omit<ProjectFormValues, 'thumbnail' | 'photo'> & { skillId: string[] },
    onSubmit: async ({ value }) => {
      await handleUpdate(value);
    },
  });

  // --- Handlers ---
  
  const resetFileStates = () => {
    setThumbnailFile(null);
    setPhotoFiles([]);
    setThumbnailPreview("");
    setPhotosPreviews([]);
    setExistingPhotos([]);
    setDeletedPhotos([]);
    setThumbnailDeleted(false);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    if (photosInputRef.current) photosInputRef.current.value = "";
  };

  const handleEdit = () => {
    // Reset form with project data
    form.reset({
      title: project.title,
      description: project.description,
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      skillId: project.Skills?.map((s) => s.id) || [],
      feature: project.feature?.length ? project.feature : [""],
      technology: project.technology?.length ? project.technology : [""],
    });

    // Reset file states
    setExistingPhotos(project.photo || []);
    setDeletedPhotos([]);
    setThumbnailFile(null);
    setPhotoFiles([]);
    setThumbnailPreview("");
    setPhotosPreviews([]);
    setThumbnailDeleted(false);

    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (formData: any) => {
    // Validasi File Manual
    if (!project.thumbnail && !thumbnailFile) {
       toast.error("Thumbnail harus diupload!");
       return;
    }
    if (allPhotosDeleted) {
       toast.error("Minimal satu foto diperlukan!");
       return;
    }

    // Filter empty strings
    const filteredFeatures = formData.feature.filter((f: string) => f.trim() !== "");
    const filteredTechnologies = formData.technology.filter((t: string) => t.trim() !== "");

    if (filteredFeatures.length === 0) {
      toast.error("Minimal satu feature harus diisi!");
      return;
    }
    if (filteredTechnologies.length === 0) {
      toast.error("Minimal satu technology harus diisi!");
      return;
    }

    const payload: ProjectFormValues = {
      ...formData,
      feature: filteredFeatures,
      technology: filteredTechnologies,
      thumbnail: "placeholder", // Placeholder for schema validation
      photo: ["placeholder"],   // Placeholder for schema validation
      skillId: formData.skillId ?? [],
    };

    try {
      await onUpdate(project.id, {
        data: payload,
        thumbnailFile,
        photoFiles,
        existingPhotos,
        deletedPhotos,
        thumbnailDeleted,
        oldThumbnail: project.thumbnail || "",
      });
      
      setIsEditDialogOpen(false);
      toast.success("Proyek berhasil diupdate!");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Gagal mengupdate proyek. Silakan coba lagi.");
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(project.id);
      setIsDeleteDialogOpen(false);
      toast.success(`Proyek "${project.title}" berhasil dihapus!`);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Gagal menghapus proyek. Silakan coba lagi.");
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      // Clean up object URLs
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      photosPreviews.forEach((url) => URL.revokeObjectURL(url));
    }
  };

  // --- File Specific Handlers ---

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setThumbnailDeleted(false);
    }
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setPhotoFiles((prev) => [...prev, ...fileArray]);
      fileArray.forEach((file) => {
        setPhotosPreviews((prev) => [...prev, URL.createObjectURL(file)]);
      });
    }
  };

  const removeExistingPhoto = (index: number) => {
    const photoToDelete = existingPhotos[index];
    setDeletedPhotos((prev) => [...prev, photoToDelete]);
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    URL.revokeObjectURL(photosPreviews[index]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeThumbnail = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailFile(null);
    setThumbnailPreview("");
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const removeExistingThumbnail = () => setThumbnailDeleted(true);
  const restoreExistingThumbnail = () => setThumbnailDeleted(false);

  const restoreAllPhotos = () => {
    setExistingPhotos((prev) => [...prev, ...deletedPhotos]);
    setDeletedPhotos([]);
  };

  const removeAllPhotos = () => {
    setDeletedPhotos((prev) => [...prev, ...existingPhotos]);
    setExistingPhotos([]);
    photosPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotoFiles([]);
    setPhotosPreviews([]);
    if (photosInputRef.current) photosInputRef.current.value = "";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
            disabled={disabled}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-48 z-50 bg-white border border-gray-200 rounded-md shadow-lg p-1"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuItem
            onClick={handleEdit}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-gray-100 cursor-pointer"
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-red-50 text-red-600 hover:text-red-700 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Proyek
            </DialogTitle>
            <DialogDescription>Update informasi proyek yang sudah ada</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
                {/* Title */}
                <div className="lg:col-span-full">
                  <form.Field
                    name="title"
                    validators={{ onChange: createZodValidator(projectSchema.shape.title) }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700">Title *</Label>
                        <Input
                          type="text"
                          placeholder="Ex: System Monitoring Dashboard"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={isUpdating}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Description */}
                <div className="lg:col-span-full">
                  <form.Field
                    name="description"
                    validators={{ onChange: createZodValidator(projectSchema.shape.description) }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700">Description *</Label>
                        <Textarea
                          placeholder="Ex: This project aims to create a system monitoring dashboard..."
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={isUpdating}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Features (Dynamic Array) */}
                <div className="lg:col-span-full">
                  <Label className="uppercase text-sm font-semibold text-gray-700 mb-3 block">Feature *</Label>
                  <form.Field name="feature">
                    {(field) => (
                      <div className="space-y-3">
                        {field.state.value.map((_, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder={`Feature ${index + 1}`}
                                value={field.state.value[index]}
                                onChange={(e) => {
                                  const newVal = [...field.state.value];
                                  newVal[index] = e.target.value;
                                  field.handleChange(newVal);
                                }}
                                disabled={isUpdating}
                              />
                            </div>
                            {field.state.value.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => {
                                  const newVal = field.state.value.filter((_, i) => i !== index);
                                  field.handleChange(newVal);
                                }}
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                disabled={isUpdating}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() => field.handleChange([...field.state.value, ""])}
                          variant="secondary"
                          className="mt-2"
                          disabled={isUpdating}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Feature
                        </Button>
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Technologies (Dynamic Array) */}
                <div className="lg:col-span-full">
                  <Label className="uppercase text-sm font-semibold text-gray-700 mb-3 block">Technology *</Label>
                  <form.Field name="technology">
                    {(field) => (
                      <div className="space-y-3">
                        {field.state.value.map((_, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder={`Technology ${index + 1}`}
                                value={field.state.value[index]}
                                onChange={(e) => {
                                  const newVal = [...field.state.value];
                                  newVal[index] = e.target.value;
                                  field.handleChange(newVal);
                                }}
                                disabled={isUpdating}
                              />
                            </div>
                            {field.state.value.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => {
                                  const newVal = field.state.value.filter((_, i) => i !== index);
                                  field.handleChange(newVal);
                                }}
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                disabled={isUpdating}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() => field.handleChange([...field.state.value, ""])}
                          variant="secondary"
                          className="mt-2"
                          disabled={isUpdating}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Technology
                        </Button>
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Thumbnail Section */}
                <div className="lg:col-span-full">
                  <Label className="uppercase text-sm font-semibold text-gray-700">Thumbnail *</Label>
                  <div className="mt-2 space-y-4">
                    {project.thumbnail && !thumbnailFile && !thumbnailDeleted && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Current thumbnail:</p>
                        <div className="relative inline-block">
                          <NextImage
                            src={project.thumbnail}
                            alt="Current thumbnail"
                            width={128}
                            height={128}
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={removeExistingThumbnail}
                            disabled={isUpdating}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {thumbnailDeleted && !thumbnailFile && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-red-800">Thumbnail akan dihapus</span>
                          <Button type="button" variant="outline" size="sm" onClick={restoreExistingThumbnail} disabled={isUpdating}>
                            Restore
                          </Button>
                        </div>
                      </div>
                    )}

                    {thumbnailPreview && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">New thumbnail:</p>
                        <div className="relative inline-block">
                          <NextImage src={thumbnailPreview} alt="New thumbnail preview" width={128} height={128} className="w-32 h-32 object-cover rounded-lg border" />
                          <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={removeThumbnail} disabled={isUpdating}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" disabled={isUpdating} />
                      <Button type="button" variant="outline" onClick={() => thumbnailInputRef.current?.click()} disabled={isUpdating} className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        {project.thumbnail && !thumbnailDeleted ? "Change Thumbnail" : "Upload Thumbnail"}
                      </Button>
                      {thumbnailFile && <span className="text-sm text-gray-600">{thumbnailFile.name}</span>}
                    </div>
                  </div>
                </div>

                {/* Photos Section */}
                <div className="lg:col-span-full">
                  <Label className="uppercase text-sm font-semibold text-gray-700">Photos *</Label>
                  <div className="mt-2 space-y-4">
                    {allPhotosDeleted && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-red-800">Semua foto akan dihapus. Minimal satu foto diperlukan!</span>
                          {deletedPhotos.length > 0 && (
                            <Button type="button" variant="outline" size="sm" onClick={restoreAllPhotos} disabled={isUpdating}>
                              Restore All
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {existingPhotos.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Current photos:</p>
                        <div className="grid grid-cols-3 gap-4">
                          {existingPhotos.map((photo, index) => (
                            <div key={index} className="relative">
                              <NextImage src={photo} alt={`Current photo ${index + 1}`} width={300} height={96} className="w-full h-24 object-cover rounded-lg border" />
                              <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => removeExistingPhoto(index)} disabled={isUpdating}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {photosPreviews.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">New photos:</p>
                        <div className="grid grid-cols-3 gap-4">
                          {photosPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <NextImage src={preview} alt={`New photo preview ${index + 1}`} width={300} height={96} className="w-full h-24 object-cover rounded-lg border" />
                              <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => removeNewPhoto(index)} disabled={isUpdating}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(existingPhotos.length > 0 || photoFiles.length > 0) && (
                      <div className="flex justify-center">
                        <Button type="button" variant="outline" onClick={removeAllPhotos} disabled={isUpdating} className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove All Photos
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <input ref={photosInputRef} type="file" accept="image/*" multiple onChange={handlePhotosChange} className="hidden" disabled={isUpdating} />
                      <Button type="button" variant="outline" onClick={() => photosInputRef.current?.click()} disabled={isUpdating} className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Add More Photos
                      </Button>
                      {photoFiles.length > 0 && <span className="text-sm text-gray-600">{photoFiles.length} new file(s) selected</span>}
                    </div>
                  </div>
                </div>

                {/* Skills Selection */}
                <div className="lg:col-span-full">
                  <form.Field name="skillId">
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700">Related Skills</Label>
                        <ReactSelect<{ label: string; value: string; icon: string }, true>
                          isMulti
                          options={skills.map((skill) => ({
                            label: skill.name,
                            value: skill.id,
                            icon: skill.icon,
                          }))}
                          value={skills
                            .filter((skill) => field.state.value?.includes(skill.id))
                            .map((skill) => ({
                              label: skill.name,
                              value: skill.id,
                              icon: skill.icon,
                            }))}
                          onChange={(selectedOptions) => {
                            field.handleChange(selectedOptions.map((opt) => opt.value));
                          }}
                          formatOptionLabel={(option) => (
                            <span className="flex items-center gap-2">
                              <i className={`${option.icon} text-2xl`} />
                              {option.label}
                            </span>
                          )}
                          isDisabled={isUpdating || isLoadingSkills}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* GitHub & Live URL */}
                <div className="lg:col-span-full">
                  <form.Field name="githubUrl">
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700">GitHub URL</Label>
                        <Input
                          type="text"
                          placeholder="Ex: https://github.com/your-repo (optional)"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isUpdating}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>

                <div className="lg:col-span-full">
                  <form.Field name="liveUrl">
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700">Live URL</Label>
                        <Input
                          type="text"
                          placeholder="Ex: https://your-live-url.com (optional)"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isUpdating}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Action Buttons */}
                <div className="lg:col-span-full flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="flex-1"
                    disabled={isUpdating}
                  >
                    Batal
                  </Button>
                  <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                    {([canSubmit, isSubmitting]) => (
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={!canSubmit || isUpdating || thumbnailDeleted || allPhotosDeleted}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Mengupdate...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Proyek
                          </>
                        )}
                      </Button>
                    )}
                  </form.Subscribe>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex flex-col">
                <span className="font-medium text-sm">{project.title}</span>
                <p
                  className="leading-5 overflow-hidden text-xs"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 1,
                    lineHeight: "1.25rem",
                    maxHeight: "2.5rem",
                    wordBreak: "break-word",
                  }}
                >
                  {project.description}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex-1">
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}