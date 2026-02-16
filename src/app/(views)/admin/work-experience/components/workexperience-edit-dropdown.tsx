"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import {
  WorkExperience,
  WorkExperienceFormValues,
  workExperienceSchema,
} from "@/schema/workexperience-schema";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  Save,
  Plus,
  X,
  Calendar,
  Briefcase,
} from "lucide-react";
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

interface WorkExperienceEditDropdownProps {
  workExperience: WorkExperience;
  onUpdate: (
    workExperienceId: string,
    data: WorkExperienceFormValues
  ) => Promise<void>;
  onDelete: (workExperienceId: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
}

export function WorkExperienceEditDropdown({
  workExperience,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  disabled = false,
}: WorkExperienceEditDropdownProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCurrentJob, setIsCurrentJob] = useState(false);

  // --- Fetch Skills dengan TanStack Query ---
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const res = await axiosFetcher<any[]>("get", PATH_API_NEXT_SKILL);
      return res.data ?? [];
    },
    enabled: isEditDialogOpen, // Hanya fetch saat dialog terbuka
  });

  // --- TanStack Form Setup ---
  const form = useForm({
    defaultValues: {
      position: workExperience.position,
      employmenttype: workExperience.employmenttype,
      company: workExperience.company,
      location: workExperience.location,
      locationtype: workExperience.locationtype,
      description:
        workExperience.description?.length > 0
          ? workExperience.description
          : [""],
      startDate: workExperience.startDate
        ? new Date(workExperience.startDate)
        : new Date(),
      endDate: workExperience.endDate
        ? new Date(workExperience.endDate)
        : null,
      skillId: workExperience.Skills?.map((s) => s.id) || [],
    } as WorkExperienceFormValues,
    onSubmit: async ({ value }) => {
      await handleUpdate(value);
    },
  });

  // --- Handlers ---

  const formatDateForInput = (
    date: Date | string | null | undefined
  ): string => {
    if (!date) return "";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const handleEdit = () => {
    const descriptions =
      workExperience.description?.length > 0
        ? workExperience.description
        : [""];

    // Reset form dengan data terbaru
    form.reset({
      position: workExperience.position,
      employmenttype: workExperience.employmenttype,
      company: workExperience.company,
      location: workExperience.location,
      locationtype: workExperience.locationtype,
      description: descriptions,
      startDate: workExperience.startDate
        ? new Date(workExperience.startDate)
        : new Date(),
      endDate: workExperience.endDate
        ? new Date(workExperience.endDate)
        : null,
      skillId: workExperience.Skills?.map((s) => s.id) || [],
    });

    setIsCurrentJob(!workExperience.endDate);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (formData: WorkExperienceFormValues) => {
    const filteredDescriptions = formData.description.filter(
      (desc) => desc.trim() !== ""
    );

    if (filteredDescriptions.length === 0) {
      toast.error("Minimal satu deskripsi harus diisi!");
      return;
    }

    const payload = {
      ...formData,
      description: filteredDescriptions,
    };

    try {
      await onUpdate(workExperience.id, payload);
      setIsEditDialogOpen(false);
      toast.success("Pengalaman kerja berhasil diupdate!");
    } catch (error) {
      console.error("Error updating work experience:", error);
      toast.error("Gagal mengupdate pengalaman kerja. Silakan coba lagi.");
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(workExperience.id);
      setIsDeleteDialogOpen(false);
      toast.success(
        `Pengalaman kerja "${workExperience.position}" berhasil dihapus!`
      );
    } catch (error) {
      console.error("Error deleting work experience:", error);
      toast.error("Gagal menghapus pengalaman kerja. Silakan coba lagi.");
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
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
              Edit Pengalaman Kerja
            </DialogTitle>
            <DialogDescription>
              Update informasi pengalaman kerja yang sudah ada
            </DialogDescription>
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
                {/* Position */}
                <div className="lg:col-span-full">
                  <form.Field
                    name="position"
                    validators={{
                      onChange: createZodValidator(
                        workExperienceSchema.shape.position
                      ),
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700">
                          Position
                        </Label>
                        <Input
                          type="text"
                          placeholder="Ex: Software Engineer"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={isUpdating}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Employment Type */}
                <div className="lg:col-span-3">
                  <form.Field
                    name="employmenttype"
                    validators={{
                      onChange: createZodValidator(
                        workExperienceSchema.shape.employmenttype
                      ),
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700">
                          Employment Type
                        </Label>
                        <Select
                          onValueChange={field.handleChange}
                          value={field.state.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Employment Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Self-employed">
                              Self-employed
                            </SelectItem>
                            <SelectItem value="Freelance">Freelance</SelectItem>
                            <SelectItem value="Internship">
                              Internship
                            </SelectItem>
                            <SelectItem value="Apprenticeship">
                              Apprenticeship
                            </SelectItem>
                            <SelectItem value="Seasonal">Seasonal</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Location Type */}
                <div className="lg:col-span-3">
                  <form.Field
                    name="locationtype"
                    validators={{
                      onChange: createZodValidator(
                        workExperienceSchema.shape.locationtype
                      ),
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700">
                          Location Type
                        </Label>
                        <Select
                          onValueChange={field.handleChange}
                          value={field.state.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Location Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="On-site">On-site</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Company */}
                <div className="lg:col-span-3">
                  <form.Field
                    name="company"
                    validators={{
                      onChange: createZodValidator(
                        workExperienceSchema.shape.company
                      ),
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700">
                          Company
                        </Label>
                        <Input
                          type="text"
                          placeholder="Ex: PT. Semangat Coding"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isUpdating}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Location */}
                <div className="lg:col-span-3">
                  <form.Field
                    name="location"
                    validators={{
                      onChange: createZodValidator(
                        workExperienceSchema.shape.location
                      ),
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700">
                          Location
                        </Label>
                        <Input
                          type="text"
                          placeholder="Ex: Jakarta, Indonesia"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isUpdating}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Start Date */}
                <div className="lg:col-span-3">
                  <form.Field
                    name="startDate"
                    validators={{
                      onChange: createZodValidator(
                        workExperienceSchema.shape.startDate
                      ),
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Start Date
                        </Label>
                        <Input
                          type="date"
                          value={formatDateForInput(field.state.value)}
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value + "T00:00:00")
                              : new Date();
                            field.handleChange(date);
                          }}
                          disabled={isUpdating}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* End Date */}
                <div className="lg:col-span-3">
                  <form.Field name="endDate">
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          End Date
                        </Label>
                        <Input
                          type="date"
                          value={formatDateForInput(field.state.value)}
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value + "T00:00:00")
                              : null;
                            field.handleChange(date);
                          }}
                          disabled={isUpdating || isCurrentJob}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Current Job Checkbox */}
                <div className="lg:col-span-full">
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="current-job-edit"
                      checked={isCurrentJob}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsCurrentJob(checked);
                        if (checked) {
                          form.setFieldValue("endDate", null);
                        } else {
                          form.setFieldValue("endDate", new Date());
                        }
                      }}
                      disabled={isUpdating}
                    />
                    <label
                      htmlFor="current-job-edit"
                      className="text-sm text-gray-700"
                    >
                      I currently work here
                    </label>
                  </div>
                </div>

                {/* Skills Selection */}
                <div className="lg:col-span-full">
                  <form.Field name="skillId">
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="uppercase text-sm font-semibold text-gray-700">
                          Related Skills
                        </Label>
                        <ReactSelect<
                          { label: string; value: string; icon: string },
                          true
                        >
                          isMulti
                          options={skills.map((skill) => ({
                            label: skill.name,
                            value: skill.id,
                            icon: skill.icon,
                          }))}
                          value={skills
                            .filter((skill) =>
                              field.state.value?.includes(skill.id)
                            )
                            .map((skill) => ({
                              label: skill.name,
                              value: skill.id,
                              icon: skill.icon,
                            }))}
                          onChange={(selectedOptions) => {
                            field.handleChange(
                              selectedOptions.map((opt) => opt.value)
                            );
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

                {/* Description Fields (Dynamic Array) */}
                <div className="lg:col-span-full">
                  <Label className="uppercase text-sm font-semibold text-gray-700 mb-3 block">
                    Description
                  </Label>
                  <form.Field name="description">
                    {(field) => (
                      <div className="space-y-3">
                        {field.state.value.map((_, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder={`Poin ${
                                  index + 1
                                } - Deskripsikan tanggung jawab atau pencapaian`}
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
                                  const newVal = field.state.value.filter(
                                    (_, i) => i !== index
                                  );
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
                          onClick={() =>
                            field.handleChange([...field.state.value, ""])
                          }
                          variant="secondary"
                          className="mt-2"
                          disabled={isUpdating}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Poin
                        </Button>
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Actions */}
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
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                  >
                    {([canSubmit, isSubmitting]) => (
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={!canSubmit || isSubmitting || isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Mengupdate...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Pengalaman Kerja
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
            <DialogTitle>Delete Work Experience</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengalaman kerja ini? Tindakan
              ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <Briefcase className="w-5 h-5 mt-1 text-destructive" />
              <div className="flex flex-col">
                <span className="font-medium text-sm">
                  {workExperience.position}
                </span>
                <span className="text-muted-foreground text-xs">
                  {workExperience.company}
                </span>
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
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1"
              >
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