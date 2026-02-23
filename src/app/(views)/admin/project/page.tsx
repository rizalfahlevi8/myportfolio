"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Code,
  Loader2,
  ExternalLink,
  Github,
  Layers,
  Wrench,
  Star,
  Monitor,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteProject,
  getProjects,
  postProject,
  putProject,
} from "@/services/projects";
import { ProjectFormValues } from "@/schema/project-schema";
import AddProjectDialog from "./components/add-project-dialog";
import { ProjectEditDropdown } from "./components/project-edit-dropdown";

export default function ProjectPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 1. Fetch Data dengan TanStack Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getProjects"],
    queryFn: getProjects,
  });

  // 2. Add Mutation
  // Diubah: 'photos' menjadi 'galleryFiles' sesuai service API
  const addMutation = useMutation({
    mutationFn: ({
      data,
      thumbnail,
      galleryFiles,
    }: {
      data: ProjectFormValues;
      thumbnail: File | null;
      galleryFiles: File[];
    }) => postProject({ data, thumbnail, galleryFiles }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProjects"] });
      toast.success("Project berhasil ditambahkan!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan project");
    },
  });

  // 3. Update Mutation
  // Diubah: Struktur updateData disesuaikan dengan field baru (gallery)
  const updateMutation = useMutation({
    mutationFn: ({
      projectId,
      updateData,
    }: {
      projectId: string;
      updateData: {
        data: ProjectFormValues;
        thumbnailFile?: File | null;
        galleryFiles?: File[];       // Diubah
        existingGallery?: string[];  // Diubah
        deletedGallery?: string[];   // Diubah
        thumbnailDeleted?: boolean;
        oldThumbnail?: string;
      };
    }) => putProject({ projectId, updateData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProjects"] });
      toast.success("Project berhasil diupdate!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal update project");
    },
  });

  // 4. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProjects"] });
      toast.success("Project berhasil dihapus!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus project");
    },
  });

  // Handlers
  const handleAddProject = async (
    data: ProjectFormValues,
    thumbnail: File | null,
    gallery: File[], // Diubah parameter dari 'photos'
  ) => {
    await addMutation.mutateAsync({ data, thumbnail, galleryFiles: gallery });
  };

  const handleUpdateProject = async (
    projectId: string,
    updateData: {
      data: ProjectFormValues;
      thumbnailFile?: File | null;
      galleryFiles?: File[];       // Diubah
      existingGallery?: string[];  // Diubah
      deletedGallery?: string[];   // Diubah
      thumbnailDeleted?: boolean;
      oldThumbnail?: string;
    },
  ) => {
    setUpdatingId(projectId);
    try {
      await updateMutation.mutateAsync({ projectId, updateData });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeletingId(projectId);
    try {
      await deleteMutation.mutateAsync(projectId);
    } finally {
      setDeletingId(null);
    }
  };

  const validProjects = data?.filter((proj) => proj && proj.id) || [];

  const isTemporaryProject = (
    projectId: string | undefined | null,
  ): boolean => {
    return projectId ? projectId.startsWith("temp-") : false;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Heading
          title="Project Management"
          description="Kelola data proyek yang kamu miliki"
        />
        <div className="flex items-center gap-4">
          <AddProjectDialog
            onAdd={handleAddProject}
            isAdding={addMutation.isPending}
          />
        </div>
      </div>
      <Separator />

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading Proyek...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error?.message}</p>
        </div>
      ) : validProjects.length > 0 ? (
        <div className="space-y-4">
          {validProjects.map((projectItem) => {
            const isTemp = isTemporaryProject(projectItem.id);
            const thumbnailUrl = projectItem.thumbnail || null;

            // Cek konten kolom kiri
            const hasFeatures =
              projectItem.features && projectItem.features.length > 0; // Diubah: feature -> features
            const hasLibraries =
              projectItem.libraries && projectItem.libraries.length > 0; // Diubah: technology -> libraries
            const showLeftColumn = hasFeatures || hasLibraries;

            return (
              <Card
                key={projectItem.id}
                className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${
                  isTemp
                    ? "border-yellow-400 bg-yellow-50/50"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Thumbnail Section */}
                    <div className="shrink-0">
                      {thumbnailUrl ? (
                        <div className="relative w-48 h-32 overflow-hidden rounded-lg border">
                          <Image
                            src={thumbnailUrl}
                            alt={projectItem.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          {isTemp && (
                            <div className="absolute top-2 left-2">
                              <Badge
                                variant="secondary"
                                className="bg-yellow-500 text-yellow-900 text-xs"
                              >
                                Temp
                              </Badge>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-48 h-32 bg-muted rounded-lg flex items-center justify-center border">
                          <Code className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3 gap-4">
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold leading-tight truncate">
                              {projectItem.title}
                            </h3>
                            {projectItem.category && ( // Ditambahkan: Tampil Category
                              <Badge variant="outline" className="text-xs">
                                {projectItem.category}
                              </Badge>
                            )}
                          </div>
                          {/* Ditambahkan: Tampil Tagline jika ada */}
                          {projectItem.tagline && (
                             <p className="text-sm text-muted-foreground italic mb-1 truncate">
                               {projectItem.tagline}
                             </p>
                          )}
                          <div className="text-sm text-muted-foreground">
                            <p
                              className="leading-5 overflow-hidden"
                              style={{
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 2,
                                lineHeight: "1.25rem",
                                maxHeight: "2.5rem",
                                wordBreak: "break-word",
                              }}
                            >
                              {projectItem.description}
                            </p>
                          </div>
                        </div>

                        {/* Action Menu */}
                        <div className="shrink-0">
                          <ProjectEditDropdown
                            project={projectItem}
                            onUpdate={handleUpdateProject}
                            onDelete={handleDeleteProject}
                            isUpdating={updatingId === projectItem.id}
                            isDeleting={deletingId === projectItem.id}
                            disabled={
                              updatingId !== null || deletingId !== null
                            }
                          />
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div
                        className={`grid gap-4 mb-4 ${showLeftColumn ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
                      >
                        {/* Kolom Kiri: Features & Libraries */}
                        {showLeftColumn && (
                          <div className="space-y-3 min-w-0">
                            {/* Features */}
                            {hasFeatures && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Layers className="h-4 w-4 text-primary shrink-0" />
                                  <span className="text-sm font-medium">
                                    Features
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {projectItem.features
                                    .slice(0, 2)
                                    .map((feature, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {feature}
                                      </Badge>
                                    ))}
                                  {projectItem.features.length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{projectItem.features.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Libraries */}
                            {hasLibraries && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Wrench className="h-4 w-4 text-primary shrink-0" />
                                  <span className="text-sm font-medium">
                                    Libraries
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {projectItem.libraries
                                    .slice(0, 2)
                                    .map((lib, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {lib}
                                      </Badge>
                                    ))}
                                  {projectItem.libraries.length > 2 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      +{projectItem.libraries.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Kolom Kanan: Skills & Gallery */}
                        <div className="space-y-3 min-w-0">
                          {/* Skills */}
                          {projectItem.Skills &&
                            projectItem.Skills.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-primary shrink-0" />
                                  <span className="text-sm font-medium">
                                    Skills
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {projectItem.Skills.slice(0, 4).map(
                                    (skill) => (
                                      <Badge
                                        key={skill.id}
                                        variant="default"
                                        className="text-xs"
                                      >
                                        {skill.name}
                                      </Badge>
                                    ),
                                  )}
                                  {projectItem.Skills.length > 4 && (
                                    <Badge
                                      variant="default"
                                      className="text-xs"
                                    >
                                      +{projectItem.Skills.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Project Gallery */}
                          {projectItem.gallery &&
                            projectItem.gallery.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Monitor className="h-4 w-4 text-primary shrink-0" />
                                  <span className="text-sm font-medium">
                                    Tampilan Aplikasi (
                                    {projectItem.gallery.length})
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  {projectItem.gallery
                                    .slice(0, 4)
                                    .map((photo, index) => {
                                      return (
                                        <div
                                          key={index}
                                          className="relative w-12 h-8 rounded overflow-hidden border shrink-0"
                                        >
                                          <Image
                                            src={photo}
                                            alt={`${projectItem.title} tampilan aplikasi ${index + 1}`}
                                            fill
                                            className="object-cover hover:scale-110 transition-transform cursor-pointer"
                                          />
                                        </div>
                                      );
                                    })}
                                  {projectItem.gallery.length > 4 && (
                                    <div className="w-12 h-8 rounded border bg-muted flex items-center justify-center shrink-0">
                                      <span className="text-[10px] font-medium text-muted-foreground">
                                        +{projectItem.gallery.length - 4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center pt-3 border-t gap-4">
                        {/* Action Buttons */}
                        <div className="flex gap-2 shrink-0 ml-auto">
                          {projectItem.githubUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a
                                href={projectItem.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Github className="h-4 w-4 mr-1" />
                                Code
                              </a>
                            </Button>
                          )}
                          {projectItem.liveUrl && (
                            <Button size="sm" asChild>
                              <a
                                href={projectItem.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Live Demo
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">
            Belum ada proyek yang ditambahkan
          </p>
          <p className="text-sm">
            Mulai tambahkan proyek pertama kamu menggunakan tombol tambah di
            atas!
          </p>
        </div>
      )}
    </div>
  );
}