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
import { PATH_API_NEXT_SKILL } from "@/constants/routes/pages/menu/configuration";

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
  onAdd: (data: ProjectFormValues, thumbnail: File | null, gallery: File[]) => Promise<void>;
  isAdding?: boolean;
}

export default function AddProjectDialog({ onAdd, isAdding = false }: AddProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // File states (dipisahkan dari form state karena menangani File object)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Refs for file inputs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // --- Pengambilan Data Skill dengan TanStack Query ---
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const res = await axiosFetcher<any[]>("get", PATH_API_NEXT_SKILL);
      return res.data ?? [];
    },
    enabled: isOpen, 
  });

  const form = useForm({
    defaultValues: {
      title: "",
      slug: "",
      tagline: "",
      description: "",
      category: "",
      features: [""],       
      libraries: [""],      
      background: "",
      solution: "",
      challenge: "",
      businessImpact: "",
      githubUrl: "",
      liveUrl: "",
      skillId: [],
    } as Omit<ProjectFormValues, 'thumbnail' | 'gallery'> & { skillId: string[] },
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
    setGalleryFiles([]);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    galleryPreviews.forEach(url => URL.revokeObjectURL(url));
    setThumbnailPreview("");
    setGalleryPreviews([]);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleAdd = async (formData: any) => {
    // Validasi File Manual
    if (!thumbnailFile) {
      toast.error("Thumbnail harus diupload!");
      return;
    }
    if (galleryFiles.length === 0) {
      toast.error("Minimal satu foto harus diupload!");
      return;
    }

    // Filter array kosong
    const filteredFeatures = formData.features.filter((f: string) => f.trim() !== "");
    const filteredLibraries = formData.libraries.filter((l: string) => l.trim() !== "");

    // Siapkan payload untuk dikirim ke parent/server action
    const payload: ProjectFormValues = {
      ...formData,
      features: filteredFeatures,
      libraries: filteredLibraries,
      thumbnail: "placeholder-thumbnail",
      gallery: galleryFiles.map((_, i) => `placeholder-gallery-${i}`),
      skillId: formData.skillId ?? [],
    };

    try {
      await onAdd(payload, thumbnailFile, galleryFiles);
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

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setGalleryFiles(prev => [...prev, ...fileArray]);
      fileArray.forEach(file => {
        setGalleryPreviews(prev => [...prev, URL.createObjectURL(file)]);
      });
    }
  };

  const removeGalleryItem = (index: number) => {
    URL.revokeObjectURL(galleryPreviews[index]);
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
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
      <DialogContent className="lg:max-w-5xl max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              
              {/* Title Field */}
              <div className="md:col-span-2 lg:col-span-1">
                <form.Field
                  name="title"
                  validators={{ onChange: createZodValidator(projectSchema.shape.title) }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">Title *</Label>
                      <Input
                        type="text"
                        placeholder="Ex: E-Commerce Platform"
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

              {/* Slug Field - Full Width */}
              <div className="md:col-span-2 lg:col-span-1">
                <form.Field
                  name="slug"
                  validators={{ onChange: createZodValidator(projectSchema.shape.slug) }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">Slug *</Label>
                      <Input
                        type="text"
                        placeholder="Ex: e-commerce-platform"
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

              {/* Tagline Field - Full Width */}
              <div className="md:col-span-2 lg:col-span-1">
                <form.Field
                  name="tagline"
                  validators={{ onChange: createZodValidator(projectSchema.shape.tagline) }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">Tagline *</Label>
                      <Input
                        type="text"
                        placeholder="Ex: Platform jual beli terpercaya"
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

              {/* Category Field - Full Width */}
              <div className="md:col-span-2 lg:col-span-1">
                <form.Field
                  name="category"
                  validators={{ onChange: createZodValidator(projectSchema.shape.category) }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">Category *</Label>
                      <Input
                        type="text"
                        placeholder="Ex: Web App, Mobile, UI/UX"
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
              <div className="md:col-span-2">
                <form.Field
                  name="description"
                  validators={{ onChange: createZodValidator(projectSchema.shape.description) }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">Description *</Label>
                      <Textarea
                        placeholder="Ex: This project aims to create..."
                        value={field.state.value?? ""}
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

              {/* Background, Solution, Challenge Fields - Stacked Vertically (Tanpa Grid) */}
              <div className="md:col-span-2 space-y-4">
                <form.Field name="background" validators={{ onChange: createZodValidator(projectSchema.shape.background) }}>
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">Background *</Label>
                      <Textarea placeholder="Project background..." value={field.state.value?? ""} onChange={(e) => field.handleChange(e.target.value)} disabled={isAdding} />
                      {field.state.meta.errors.length > 0 && (<p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>)}
                    </div>
                  )}
                </form.Field>
                <form.Field name="solution" validators={{ onChange: createZodValidator(projectSchema.shape.solution) }}>
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">Solution *</Label>
                      <Textarea placeholder="Project solution..." value={field.state.value?? ""} onChange={(e) => field.handleChange(e.target.value)} disabled={isAdding} />
                      {field.state.meta.errors.length > 0 && (<p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>)}
                    </div>
                  )}
                </form.Field>
                <form.Field name="challenge" validators={{ onChange: createZodValidator(projectSchema.shape.challenge) }}>
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">Challenge *</Label>
                      <Textarea placeholder="Project challenge..." value={field.state.value?? ""} onChange={(e) => field.handleChange(e.target.value)} disabled={isAdding} />
                      {field.state.meta.errors.length > 0 && (<p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>)}
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Business Impact (Optional) */}
               <div className="md:col-span-2">
                <form.Field name="businessImpact">
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">Business Impact (Optional)</Label>
                      <Textarea placeholder="Impact to business..." value={field.state.value ?? ""} onChange={(e) => field.handleChange(e.target.value)} disabled={isAdding} />
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Features Fields (Dynamic Array) */}
              <div className="md:col-span-2">
                <Label className="uppercase text-xs font-bold text-gray-700 mb-3 block">Features *</Label>
                <form.Field name="features">
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

              {/* Libraries Fields (Dynamic Array) */}
              <div className="md:col-span-2">
                <Label className="uppercase text-xs font-bold text-gray-700 mb-3 block">Libraries *</Label>
                <form.Field name="libraries">
                  {(field) => (
                    <div className="space-y-3">
                      {field.state.value.map((_, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input
                              placeholder={`Library ${index + 1}`}
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
                        Tambah Library
                      </Button>
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Thumbnail Upload */}
              <div className="md:col-span-2 lg:col-span-1">
                <Label className="uppercase text-xs font-bold text-gray-700">Thumbnail *</Label>
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
                      Choose
                    </Button>
                    {thumbnailFile && (
                      <span className="text-sm text-gray-600 truncate max-w-[100px]">{thumbnailFile.name}</span>
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

              {/* Gallery Upload */}
              <div className="md:col-span-2 lg:col-span-1">
                <Label className="uppercase text-xs font-bold text-gray-700">Gallery *</Label>
                <div className="mt-2">
                  <div className="flex items-center gap-4">
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryChange}
                      className="hidden"
                      disabled={isAdding}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={isAdding}
                      className="flex items-center gap-2"
                    >
                      <Image className="h-4 w-4" />
                      Choose
                    </Button>
                    {galleryFiles.length > 0 && (
                      <span className="text-sm text-gray-600">{galleryFiles.length} file(s)</span>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <NextImage
                          src={preview}
                          alt={`Gallery preview ${index + 1}`}
                          width={300}
                          height={96}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5"
                          onClick={() => removeGalleryItem(index)}
                          disabled={isAdding}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {galleryFiles.length === 0 && (
                    <p className="text-sm font-medium text-destructive mt-2">At least one photo is required</p>
                  )}
                </div>
              </div>

              {/* Skills Selection */}
              <div className="md:col-span-2">
                <form.Field name="skillId">
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">Related Skills</Label>
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
                            <i className={`${option.icon} text-lg`} />
                            {option.label}
                          </span>
                        )}
                        isDisabled={isAdding || isLoadingSkills}
                        classNamePrefix="react-select"
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Github & Live URL */}
              <div className="md:col-span-2 lg:col-span-1">
                 <form.Field name="githubUrl">
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">GitHub URL</Label>
                      <Input
                        type="text"
                        placeholder="https://github.com/..."
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isAdding}
                      />
                    </div>
                  )}
                </form.Field>
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                <form.Field name="liveUrl">
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-xs font-bold text-gray-700">Live URL</Label>
                      <Input
                        type="text"
                        placeholder="https://live-url.com"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isAdding}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
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