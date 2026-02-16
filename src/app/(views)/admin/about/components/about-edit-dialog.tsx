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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { About, AboutFormValues, aboutSchema } from "@/schema/about-schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Save, SquarePen, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import ReactSelect from "react-select";
import toast from "react-hot-toast";
import NextImage from "next/image";
import { extractUsernameFromUrl } from "@/lib/utils";
import { getSkills } from "@/services/skill";
import { getSosmed } from "@/services/sosmed";
import { getProjects } from "@/services/projects";
// Tambahkan import ini (sesuaikan path jika berbeda)
import { getWorkExperiences } from "@/services/work-experience";
import { z } from "zod";

interface EditAboutDialogProps {
  about: About;
  onUpdate: (
    aboutId: string,
    updateData: {
      data: AboutFormValues;
      profileFile?: File | null;
      profileDeleted?: boolean;
      oldProfile?: string;
    },
  ) => Promise<void>;
  isUpdating?: boolean;
}

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

export function EditAboutDialog({
  about,
  onUpdate,
  isUpdating = false,
}: EditAboutDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // TanStack Query untuk fetch data
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ["getSkills"],
    queryFn: getSkills,
    enabled: isOpen,
  });

  const { data: sosmed = [], isLoading: isLoadingSosmed } = useQuery({
    queryKey: ["getSosmed"],
    queryFn: getSosmed,
    enabled: isOpen,
  });

  const { data: project = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["getProjects"],
    queryFn: getProjects,
    enabled: isOpen,
  });

  // TAMBAHKAN: Query untuk Work Experiences
  const { data: workExperiences = [], isLoading: isLoadingWorkExperiences } =
    useQuery({
      queryKey: ["getWorkExperiences"],
      queryFn: getWorkExperiences,
      enabled: isOpen,
    });

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profileDeleted, setProfileDeleted] = useState<boolean>(false);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);

  // TanStack Form
  const form = useForm({
    defaultValues: {
      name: about.name,
      jobTitle: about.jobTitle,
      introduction: about.introduction,
      profilePicture: about.profilePicture,
      skillId: about.Skills?.map((skill) => skill.id) || [],
      sosmed: about.sosmed?.map((sosmed) => sosmed.id) || [],
      workExperiences: about.workExperiences?.map((work) => work.id) || [],
      projects: about.projects?.map((project) => project.id) || [],
    } as AboutFormValues,
    onSubmit: async ({ value }) => {
      handleUpdate(value);
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      setProfileFile(null);
      setProfileDeleted(false);
      setProfilePreview("");
      setIsUploadingProfile(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePreview(previewUrl);
      setProfileDeleted(false);
    }
  };

  const removeProfile = () => {
    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }
    setProfileFile(null);
    setProfilePreview("");
    if (profileInputRef.current) {
      profileInputRef.current.value = "";
    }
  };

  const removeExistingProfile = () => {
    setProfileDeleted(true);
  };

  const restoreExistingProfile = () => {
    setProfileDeleted(false);
  };

  const handleUpdate = async (data: AboutFormValues) => {
    try {
      setIsUploadingProfile(true);
      await onUpdate(about.id, {
        data,
        profileFile,
        profileDeleted,
        oldProfile: about.profilePicture || "",
      });

      setIsOpen(false);
      setIsUploadingProfile(false);
    } catch (error) {
      console.error("Error in handleUpdate:", error);
      setIsUploadingProfile(false);
      toast.error("Gagal update data");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 w-full justify-between px-4">
          <span className="flex items-center">
            <SquarePen className="h-4 w-4 mr-2" />
            Update
          </span>
          <span />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SquarePen className="h-5 w-5" />
            Edit Data Diri
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
              {/* ... Kode Photo Profile, Name, Job Title, Introduction, Skills, Sosmed tetap sama ... */}

              {/* Photo Profile Edit Section */}
              <div className="lg:col-span-full">
                <Label className="uppercase text-sm font-semibold text-gray-700">
                  Photo Profile*
                </Label>
                <div className="mt-2 space-y-4">
                  {about.profilePicture && !profileFile && !profileDeleted && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Current photo profile:
                      </p>
                      <div className="relative inline-block">
                        <NextImage
                          src={about.profilePicture}
                          alt="Current photo profile"
                          width={128}
                          height={128}
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={removeExistingProfile}
                          disabled={isUpdating}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {profileDeleted && !profileFile && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-red-800">
                          Photo profile akan dihapus
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={restoreExistingProfile}
                          disabled={isUpdating}
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  )}

                  {profilePreview && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        New photo profile:
                      </p>
                      <div className="relative inline-block">
                        <NextImage
                          src={profilePreview}
                          alt="New photo profile preview"
                          width={128}
                          height={128}
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={removeProfile}
                          disabled={isUpdating}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileChange}
                      className="hidden"
                      disabled={isUpdating}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => profileInputRef.current?.click()}
                      disabled={isUpdating || isUploadingProfile}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploadingProfile
                        ? "Uploading..."
                        : about.profilePicture && !profileDeleted
                          ? "Change Photo Profile"
                          : "Upload Photo Profile"}
                    </Button>
                    {profileFile && (
                      <span className="text-sm text-gray-600">
                        {profileFile.name}
                      </span>
                    )}
                  </div>

                  {!about.profilePicture && !profileFile && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-sm text-gray-600">
                        No photo profile selected.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name Field */}
              <div className="lg:col-span-full">
                <form.Field
                  name="name"
                  validators={{
                    onChange: createZodValidator(aboutSchema.shape.name),
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-sm font-semibold text-gray-700">
                        Name *
                      </Label>
                      <Input
                        type="text"
                        placeholder="Ex: John Doe"
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

              {/* Job Title Field */}
              <div className="lg:col-span-full">
                <form.Field
                  name="jobTitle"
                  validators={{
                    onChange: createZodValidator(aboutSchema.shape.jobTitle),
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-sm font-semibold text-gray-700">
                        Job Title *
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

              {/* Introduction Field */}
              <div className="lg:col-span-full">
                <form.Field
                  name="introduction"
                  validators={{
                    onChange: createZodValidator(
                      aboutSchema.shape.introduction,
                    ),
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-sm font-semibold text-gray-700">
                        Introduction *
                      </Label>
                      <Textarea
                        placeholder="Ex: Hello, I am Rizal Fahlevi..."
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

              {/* Skills Field */}
              <div className="lg:col-span-full">
                <form.Field
                  name="skillId"
                  validators={{
                    onChange: createZodValidator(aboutSchema.shape.skillId),
                  }}
                >
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
                        options={
                          skills?.map((skill: any) => ({
                            label: skill.name,
                            value: skill.id,
                            icon: skill.icon,
                          })) || []
                        }
                        value={
                          skills
                            ?.filter((skill: any) =>
                              field.state.value?.includes(skill.id),
                            )
                            .map((skill: any) => ({
                              label: skill.name,
                              value: skill.id,
                              icon: skill.icon,
                            })) || []
                        }
                        onChange={(selectedOptions) => {
                          field.handleChange(
                            selectedOptions.map((option) => option.value),
                          );
                        }}
                        formatOptionLabel={(option: {
                          label: string;
                          value: string;
                          icon: string;
                        }) => (
                          <span className="flex items-center gap-2">
                            <i className={`${option.icon} text-2xl`} />
                            {option.label}
                          </span>
                        )}
                        isDisabled={isUpdating || isLoadingSkills}
                        placeholder="Select skills..."
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

              {/* Social Media Field */}
              <div className="lg:col-span-full">
                <form.Field
                  name="sosmed"
                  validators={{
                    onChange: createZodValidator(aboutSchema.shape.sosmed),
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-sm font-semibold text-gray-700">
                        Related Social Media
                      </Label>
                      <ReactSelect
                        isMulti={true}
                        options={
                          sosmed?.map((sosmed: any) => {
                            const username = extractUsernameFromUrl(sosmed.url);
                            return {
                              label: username,
                              value: sosmed.id,
                              icon: sosmed.name,
                            };
                          }) || []
                        }
                        value={
                          sosmed
                            ?.filter((sosmed: any) =>
                              field.state.value?.includes(sosmed.id),
                            )
                            .map((sosmed: any) => {
                              const username = extractUsernameFromUrl(
                                sosmed.url,
                              );
                              return {
                                label: username,
                                value: sosmed.id,
                                icon: sosmed.name,
                              };
                            }) || []
                        }
                        onChange={(selectedOptions) => {
                          field.handleChange(
                            selectedOptions.map((option) => option.value),
                          );
                        }}
                        formatOptionLabel={(option) => (
                          <span className="flex items-center gap-2">
                            <i
                              className={`fa-brands fa-${option.icon} text-2xl`}
                            />
                            {option.label}
                          </span>
                        )}
                        isDisabled={isUpdating || isLoadingSosmed}
                        placeholder="Select social media..."
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

              {/* Work Experiences Field - TAMBAHKAN INI */}
              <div className="lg:col-span-full">
                <form.Field
                  name="workExperiences"
                  validators={{
                    onChange: createZodValidator(
                      aboutSchema.shape.workExperiences,
                    ),
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-sm font-semibold text-gray-700">
                        Related Work Experiences
                      </Label>
                      <ReactSelect
                        isMulti={true}
                        options={
                          workExperiences?.map((work: any) => ({
                            label: work.position, // Sesuaikan 'position' dengan field di model Anda
                            value: work.id,
                          })) || []
                        }
                        value={
                          workExperiences
                            ?.filter((work: any) =>
                              field.state.value?.includes(work.id),
                            )
                            .map((work: any) => ({
                              label: work.position,
                              value: work.id,
                            })) || []
                        }
                        onChange={(selectedOptions) => {
                          field.handleChange(
                            selectedOptions.map((option) => option.value),
                          );
                        }}
                        isDisabled={isUpdating || isLoadingWorkExperiences}
                        placeholder="Select work experiences..."
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

              {/* Projects Field */}
              <div className="lg:col-span-full">
                <form.Field
                  name="projects"
                  validators={{
                    onChange: createZodValidator(aboutSchema.shape.projects),
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label className="uppercase text-sm font-semibold text-gray-700">
                        Related Projects
                      </Label>
                      <ReactSelect
                        isMulti={true}
                        options={
                          project?.map((project: any) => {
                            return {
                              label: project.title,
                              value: project.id,
                            };
                          }) || []
                        }
                        value={
                          project
                            ?.filter((project: any) =>
                              field.state.value?.includes(project.id),
                            )
                            .map((project: any) => {
                              return {
                                label: project.title,
                                value: project.id,
                              };
                            }) || []
                        }
                        onChange={(selectedOptions) => {
                          field.handleChange(
                            selectedOptions.map((option) => option.value),
                          );
                        }}
                        isDisabled={isUpdating || isLoadingProjects}
                        placeholder="Select projects..."
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

              {/* Action Buttons */}
              <div className="lg:col-span-full flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
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
                      disabled={!canSubmit || isUpdating || isUploadingProfile}
                    >
                      {isUpdating || isUploadingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isUploadingProfile
                            ? "Uploading Photo Profile..."
                            : "Mengupdate..."}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Data Diri
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
