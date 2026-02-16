"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  WorkExperienceFormValues,
  workExperienceSchema,
} from "@/schema/workexperience-schema";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Save, Plus, X, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
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

interface AddWorkExperienceDialogProps {
  onAdd: (data: WorkExperienceFormValues) => Promise<void>;
  isAdding?: boolean;
}

export default function AddWorkExperienceDialog({
  onAdd,
  isAdding = false,
}: AddWorkExperienceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCurrentJob, setIsCurrentJob] = useState(false);

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
  // PERBAIKAN: Hapus generik eksplisit <WorkExperienceFormValues> dari useForm
  // dan gunakan 'as' pada defaultValues untuk menghindari error "Expected 12 type arguments"
  const form = useForm({
    defaultValues: {
      position: "",
      employmenttype: "",
      company: "",
      location: "",
      locationtype: "",
      description: [""],
      startDate: new Date(),
      endDate: new Date(),
      skillId: [],
    } as WorkExperienceFormValues,
    onSubmit: async ({ value }) => {
      // Filter deskripsi yang kosong
      const filteredDescriptions = value.description.filter(
        (desc) => desc.trim() !== ""
      );

      if (filteredDescriptions.length === 0) {
        toast.error("Minimal satu deskripsi harus diisi!");
        return;
      }

      const payload = {
        ...value,
        description: filteredDescriptions,
      };

      try {
        await onAdd(payload);
        setIsOpen(false);
        resetForm();
        toast.success("Pengalaman kerja berhasil ditambahkan!");
      } catch (error) {
        console.error("Error adding work experience:", error);
        toast.error("Gagal menambahkan pengalaman kerja. Silakan coba lagi.");
      }
    },
  });

  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return "";
    // Handle invalid date
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const resetForm = () => {
    form.reset();
    setIsCurrentJob(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
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
            Tambah Pengalaman Kerja
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
                        disabled={isAdding}
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
                        disabled={isAdding}
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
                        disabled={isAdding}
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
                        disabled={isAdding}
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
                            : new Date();
                          field.handleChange(date);
                        }}
                        disabled={isAdding || isCurrentJob}
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
                    id="current-job"
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
                    disabled={isAdding}
                  />
                  <label
                    htmlFor="current-job"
                    className="text-sm text-gray-700"
                  >
                    I currently work here
                  </label>
                </div>
              </div>

              {/* Skills Selection (ReactSelect Tanpa ClientOnly) */}
              <div className="lg:col-span-full">
                <form.Field name="skillId">
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-sm font-semibold text-gray-700">
                        Related Skills
                      </Label>
                      <ReactSelect<{ label: string; value: string; icon: string }, true>
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
                        isDisabled={isAdding || isLoadingSkills}
                        classNamePrefix="react-select"
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
                              disabled={isAdding}
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
                              disabled={isAdding}
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
                        disabled={isAdding}
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
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                  disabled={isAdding}
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
                      disabled={!canSubmit || isSubmitting || isAdding}
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Simpan Pengalaman Kerja
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
  );
}