"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProjectFormValues, projectSchema } from "@/schema/project-schema";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Plus, Save, X, Upload, Image, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import NextImage from "next/image";
import ReactSelect from "react-select";
import toast from "react-hot-toast";
import { axiosFetcher } from "@/lib/axios/axiosFetcher";
import { PATH_API_NEXT_SKILL } from "@/constants/routes/pages/menu/configuration"; // Pastikan path ini sesuai

// --- Helper Validator untuk TanStack Form ---
const createZodValidator = (schema: z.ZodType<any>) => {
  return ({ value }: { value: any }) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      return result.error.errors[0]?.message || "Validation error";
    }
    return undefined;
  };
};

interface AddProjectDialogProps {
  onAdd: (data: ProjectFormValues, thumbnail: File | null, photos: File[]) => Promise<void>;
  isAdding?: boolean;
}

export default function AddProjectDialog({ onAdd, isAdding = false }: AddProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // File states (dipisahkan dari form state karena menangani File object)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);

  // Refs for file inputs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  // --- Pengambilan Data Skill dengan TanStack Query ---
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const res = await axiosFetcher<any[]>("get", PATH_API_NEXT_SKILL);
      return res.data ?? [];
    },
    enabled: isOpen, // Hanya fetch saat dialog terbuka
  });

  // --- TanStack Form Setup ---
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      feature: [""],
      technology: [""],
      githubUrl: "",
      liveUrl: "",
      skillId: [],
    } as Omit<ProjectFormValues, 'thumbnail' | 'photo'> & { skillId: string[] },
    onSubmit: async ({ value }) => {
      await handleAdd(value);
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const resetForm = () => {
    form.reset();
    setThumbnailFile(null);
    setPhotoFiles([]);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    photosPreviews.forEach(url => URL.revokeObjectURL(url));
    setThumbnailPreview("");
    setPhotosPreviews([]);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    if (photosInputRef.current) photosInputRef.current.value = "";
  };

  const handleAdd = async (formData: any) => {
    // Validasi File Manual
    if (!thumbnailFile) {
      toast.error("Thumbnail harus diupload!");
      return;
    }
    if (photoFiles.length === 0) {
      toast.error("Minimal satu foto harus diupload!");
      return;
    }

    // Filter array kosong
    const filteredFeatures = formData.feature.filter((f: string) => f.trim() !== "");
    const filteredTechnologies = formData.technology.filter((t: string) => t.trim() !== "");

    // Siapkan payload untuk dikirim ke parent/server action
    const payload: ProjectFormValues = {
      ...formData,
      feature: filteredFeatures,
      technology: filteredTechnologies,
      thumbnail: "placeholder-thumbnail", // Placeholder untuk validasi schema
      photo: photoFiles.map((_, i) => `placeholder-photo-${i}`), // Placeholder
      skillId: formData.skillId ?? [],
    };

    try {
      await onAdd(payload, thumbnailFile, photoFiles);
      setIsOpen(false);
      resetForm();
      toast.success("Proyek berhasil ditambahkan!");
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Gagal menambahkan proyek. Silakan coba lagi.");
    }
  };

  // --- File Handlers ---
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setPhotoFiles(prev => [...prev, ...fileArray]);
      fileArray.forEach(file => {
        setPhotosPreviews(prev => [...prev, URL.createObjectURL(file)]);
      });
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photosPreviews[index]);
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotosPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeThumbnail = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailFile(null);
    setThumbnailPreview("");
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 w-full justify-between px-4">
          <span className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </span>
          <span />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Tambah Proyek
          </DialogTitle>
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
              
              {/* Title Field */}
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
                        disabled={isAdding}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Description Field */}
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
                        disabled={isAdding}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Feature Fields (Dynamic Array) */}
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
                              disabled={isAdding}
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
                              disabled={isAdding}
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
                        disabled={isAdding}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Feature
                      </Button>
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Technology Fields (Dynamic Array) */}
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
                              disabled={isAdding}
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
                              disabled={isAdding}
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
                        disabled={isAdding}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Technology
                      </Button>
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Thumbnail Upload */}
              <div className="lg:col-span-full">
                <Label className="uppercase text-sm font-semibold text-gray-700">Thumbnail *</Label>
                <div className="mt-2">
                  <div className="flex items-center gap-4">
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      disabled={isAdding}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={isAdding}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Thumbnail
                    </Button>
                    {thumbnailFile && (
                      <span className="text-sm text-gray-600">{thumbnailFile.name}</span>
                    )}
                  </div>
                  {thumbnailPreview && (
                    <div className="mt-4 relative inline-block">
                      <NextImage
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        width={128}
                        height={128}
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeThumbnail}
                        disabled={isAdding}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {!thumbnailFile && (
                    <p className="text-sm font-medium text-destructive mt-2">Thumbnail is required</p>
                  )}
                </div>
              </div>

              {/* Photos Upload */}
              <div className="lg:col-span-full">
                <Label className="uppercase text-sm font-semibold text-gray-700">Photos *</Label>
                <div className="mt-2">
                  <div className="flex items-center gap-4">
                    <input
                      ref={photosInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotosChange}
                      className="hidden"
                      disabled={isAdding}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => photosInputRef.current?.click()}
                      disabled={isAdding}
                      className="flex items-center gap-2"
                    >
                      <Image className="h-4 w-4" />
                      Choose Photos
                    </Button>
                    {photoFiles.length > 0 && (
                      <span className="text-sm text-gray-600">{photoFiles.length} file(s) selected</span>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {photosPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <NextImage
                          src={preview}
                          alt={`Photo preview ${index + 1}`}
                          width={300}
                          height={96}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removePhoto(index)}
                          disabled={isAdding}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {photoFiles.length === 0 && (
                    <p className="text-sm font-medium text-destructive mt-2">At least one photo is required</p>
                  )}
                </div>
              </div>

              {/* Skills Selection (ReactSelect Tanpa ClientOnly) */}
              <div className="lg:col-span-full">
                <form.Field name="skillId">
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-sm font-semibold text-gray-700">Related Skills</Label>
                      <ReactSelect<{ label: string; value: string; icon: string }, true>
                        isMulti
                        options={skills.map(skill => ({
                          label: skill.name,
                          value: skill.id,
                          icon: skill.icon,
                        }))}
                        value={skills
                          .filter(skill => field.state.value?.includes(skill.id))
                          .map(skill => ({
                            label: skill.name,
                            value: skill.id,
                            icon: skill.icon,
                          }))}
                        onChange={(selectedOptions) => {
                          field.handleChange(selectedOptions.map(opt => opt.value));
                        }}
                        formatOptionLabel={(option) => (
                          <span className="flex items-center gap-2">
                            <i className={`${option.icon} text-2xl`} />
                            {option.label}
                          </span>
                        )}
                        isDisabled={isAdding || isLoadingSkills}
                        classNamePrefix="react-select" // Opsional: untuk styling
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Github & Live URL */}
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
                        disabled={isAdding}
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
                        disabled={isAdding}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isAdding}
                    className="flex items-center gap-2"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Project
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}