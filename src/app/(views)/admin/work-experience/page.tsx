"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Loader2,
  Calendar,
  Building,
  MapPin,
  Star,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteWorkExperience,
  getWorkExperiences,
  postWorkExperience,
  putWorkExperience,
} from "@/services/work-experience";
import { WorkExperienceFormValues } from "@/schema/workexperience-schema";
import AddWorkExperienceDialog from "./components/add-workexperience-dialog";
import { WorkExperienceEditDropdown } from "./components/workexperience-edit-dropdown";

export default function WorkExperiencePage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 1. Fetch Data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getWorkExperiences"],
    queryFn: getWorkExperiences,
  });

  // 2. Add Mutation
  const addMutation = useMutation({
    mutationFn: (data: WorkExperienceFormValues) => postWorkExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWorkExperiences"] });
      toast.success("Pengalaman kerja berhasil ditambahkan!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan pengalaman kerja");
    },
  });

  // 3. Update Mutation (DIPERBAIKI)
  const updateMutation = useMutation({
    mutationFn: ({
      workExperienceId,
      data,
    }: {
      workExperienceId: string;
      data: WorkExperienceFormValues;
    }) =>
      // Perbaikan: Bungkus argumen menjadi satu object
      putWorkExperience({ workExperienceId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWorkExperiences"] });
      toast.success("Pengalaman kerja berhasil diupdate!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengupdate pengalaman kerja");
    },
  });

  // 4. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (workExperienceId: string) =>
      deleteWorkExperience(workExperienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getWorkExperiences"] });
      toast.success("Pengalaman kerja berhasil dihapus!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus pengalaman kerja");
    },
  });

  // Handlers
  const handleAddWorkExperience = async (data: WorkExperienceFormValues) => {
    await addMutation.mutateAsync(data);
  };

  const handleUpdateWorkExperience = async (
    workExperienceId: string,
    data: WorkExperienceFormValues,
  ) => {
    setUpdatingId(workExperienceId);
    try {
      await updateMutation.mutateAsync({ workExperienceId, data });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteWorkExperience = async (workExperienceId: string) => {
    setDeletingId(workExperienceId);
    try {
      await deleteMutation.mutateAsync(workExperienceId);
    } finally {
      setDeletingId(null);
    }
  };

  const validWorkExperiences = data?.filter((exp) => exp && exp.id) || [];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateRange = (start: Date | string, end: Date | string | null) => {
    const startDate = formatDate(start);
    const endDate = end ? formatDate(end) : "Present";
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Heading
          title="Work Experience Management"
          description="Kelola data pengalaman kerja yang kamu miliki"
        />
        <div className="flex items-center gap-4">
          <AddWorkExperienceDialog
            onAdd={handleAddWorkExperience}
            isAdding={addMutation.isPending}
          />
        </div>
      </div>
      <Separator />

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Memuat pengalaman kerja...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error?.message}</p>
        </div>
      ) : validWorkExperiences.length > 0 ? (
        <div className="space-y-4">
          {validWorkExperiences.map((expItem) => {
            return (
              <Card
                key={expItem.id}
                className="group hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold">
                              {expItem.position}
                            </h3>
                            <Badge variant="outline">
                              {expItem.employmenttype}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Building className="h-4 w-4" />
                              <span className="font-medium text-foreground">
                                {expItem.company}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {expItem.location} ({expItem.locationtype})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0 -mr-2 -mt-2">
                          <WorkExperienceEditDropdown
                            workExperience={expItem}
                            onUpdate={handleUpdateWorkExperience}
                            onDelete={handleDeleteWorkExperience}
                            isUpdating={updatingId === expItem.id}
                            isDeleting={deletingId === expItem.id}
                            disabled={
                              updatingId !== null || deletingId !== null
                            }
                          />
                        </div>
                      </div>

                      {expItem.description &&
                        expItem.description.length > 0 && (
                          <ul className="list-disc list-outside ml-5 text-sm text-gray-700 space-y-1">
                            {expItem.description.map((desc, index) => (
                              <li key={index}>{desc}</li>
                            ))}
                          </ul>
                        )}

                      {expItem.Skills && expItem.Skills.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium">
                              Skills Used
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {expItem.Skills.map((skill) => (
                              <Badge key={skill.id} variant="default">
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDateRange(expItem.startDate, expItem.endDate)}
                        </span>
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
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">
            Belum ada pengalaman kerja yang ditambahkan
          </p>
          <p className="text-sm">
            Mulai tambahkan pengalaman kerja pertama kamu menggunakan tombol
            tambah di atas!
          </p>
        </div>
      )}
    </div>
  );
}
