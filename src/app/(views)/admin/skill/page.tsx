"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { SkillFormValues } from "@/schema/skill-schema";
import { deleteSkill, getSkills, postSkill, putSkill } from "@/services/skill";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Code, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { SkillEditDropdown } from "./components/skill-edit-dropdown";
import { AddSkillDialog } from "./components/add-skill-dialog";

const SkillPage = () => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch skills data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getSkills"],
    queryFn: getSkills,
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (newSkill: SkillFormValues) => postSkill(newSkill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSkills"] });
      toast.success("Skill berhasil ditambahkan!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan skill");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      skillId,
      data,
    }: {
      skillId: string;
      data: SkillFormValues;
    }) => putSkill(skillId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSkills"] });
      toast.success("Skill berhasil diupdate!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal update skill");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (skillId: string) => deleteSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSkills"] });
      toast.success("Skill berhasil dihapus!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus skill");
    },
  });

  const handleAddSkill = async (data: SkillFormValues) => {
    await addMutation.mutateAsync(data);
  };

  const handleUpdateSkill = async (skillId: string, data: SkillFormValues) => {
    setUpdatingId(skillId);
    try {
      await updateMutation.mutateAsync({ skillId, data });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    setDeletingId(skillId);
    try {
      await deleteMutation.mutateAsync(skillId);
    } finally {
      setDeletingId(null);
    }
  };

  const validSkills = data?.filter((skill: any) => skill && skill.id) || [];

  // Group skills into rows of 3
  const groupedSkills = [];
  for (let i = 0; i < validSkills.length; i += 3) {
    groupedSkills.push(validSkills.slice(i, i + 3));
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Heading
          title="Skills Management"
          description="Kelola data kemampuan dan teknologi yang kamu kuasai"
        />
        <div className="flex items-center gap-4">
          <AddSkillDialog
            onAdd={handleAddSkill}
            isAdding={addMutation.isPending}
          />
        </div>
      </div>

      <Separator />

      {/* Skills List Card */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Skills</CardTitle>
              <CardDescription>Skills yang sudah ditambahkan</CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Code className="h-4 w-4 mr-2" />
              Total: {validSkills.length || 0} Skills
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading skills...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error?.message}</p>
            </div>
          ) : validSkills.length > 0 ? (
            <div className="space-y-6">
              {groupedSkills.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                >
                  {row.map((skill: any) => {
                    if (!skill || !skill.id) return null;

                    return (
                      <div
                        key={skill.id}
                        className="p-4 bg-background rounded-lg border hover:border-primary/20 transition-colors group relative"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0">
                            {skill.icon ? (
                              <i className={`${skill.icon} text-2xl`}></i>
                            ) : (
                              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                <Code className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-sm flex-1">
                            {skill.name || "Unnamed Skill"}
                          </span>
                        </div>

                        <div className="absolute top-2 right-2">
                          <SkillEditDropdown
                            skill={skill}
                            onUpdate={handleUpdateSkill}
                            onDelete={handleDeleteSkill}
                            isUpdating={updatingId === skill.id}
                            isDeleting={deletingId === skill.id}
                            disabled={
                              updatingId !== null || deletingId !== null
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                Belum ada skills yang ditambahkan
              </p>
              <p className="text-sm">
                Mulai tambahkan skill pertama kamu menggunakan tombol
                &quot;Tambah Skill&quot; di atas!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillPage;
