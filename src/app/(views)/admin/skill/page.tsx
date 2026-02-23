"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Code, Loader2 } from "lucide-react";
import { SkillEditDropdown } from "./components/skill-edit-dropdown";
import { AddSkillDialog } from "./components/add-skill-dialog";
import { useSkills } from "@/hooks/admin/use-skills"; // Import custom hook

const SkillPage = () => {
  const {
    skills,
    isLoading,
    isError,
    error,
    addMutation,
    updateMutation,
    deleteMutation,
    handleAddSkill,
    handleUpdateSkill,
    handleDeleteSkill,
  } = useSkills();

  const validSkills = skills?.filter((skill: any) => skill && skill.id) || [];

  // Group skills into rows of 3
  const groupedSkills = [];
  for (let i = 0; i < validSkills.length; i += 3) {
    groupedSkills.push(validSkills.slice(i, i + 3));
  }

  return (
    <div className="flex-1 space-y-8 p-8">
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
                            isUpdating={updateMutation.isPending}
                            isDeleting={deleteMutation.isPending}
                            disabled={
                              updateMutation.isPending || deleteMutation.isPending
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