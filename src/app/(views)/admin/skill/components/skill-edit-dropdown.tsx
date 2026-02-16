"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Skill, SkillFormValues, skillSchema } from "@/schema/skill-schema";
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
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Save,
  Code,
} from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

interface SkillEditDropdownProps {
  skill: Skill;
  onUpdate: (skillId: string, data: SkillFormValues) => Promise<void>;
  onDelete: (skillId: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
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

export function SkillEditDropdown({
  skill,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  disabled = false,
}: SkillEditDropdownProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // TanStack Form
  const editForm = useForm({
    defaultValues: {
      name: skill.name,
      icon: skill.icon,
    } as SkillFormValues,
    onSubmit: async ({ value }) => {
      await handleUpdate(value);
    },
  });

  const handleEdit = () => {
    editForm.setFieldValue("name", skill.name);
    editForm.setFieldValue("icon", skill.icon);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: SkillFormValues) => {
    try {
      await onUpdate(skill.id, data);
      setIsEditDialogOpen(false);
      editForm.reset();
      toast.success("Skill berhasil diupdate!");
    } catch (error) {
      console.error("Error updating skill:", error);
      toast.error("Gagal mengupdate skill. Silakan coba lagi.");
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(skill.id);
      setIsDeleteDialogOpen(false);
      toast.success(`Skill "${skill.name}" berhasil dihapus!`);
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Gagal menghapus skill. Silakan coba lagi.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={disabled}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="end">
          <DropdownMenuItem onClick={() => setIsViewDialogOpen(true)}>
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span>View Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 text-muted-foreground" />
            <span>Edit Skill</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Skill</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Skill Details</DialogTitle>
            <DialogDescription>
              Detail informasi skill yang telah ditambahkan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-shrink-0">
                {skill.icon ? (
                  <i className={`${skill.icon} text-4xl`}></i>
                ) : (
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                    <Code className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{skill.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Icon Class:{" "}
                  <code className="bg-background px-1 rounded">
                    {skill.icon}
                  </code>
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>
              Update informasi skill yang sudah ada
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              editForm.handleSubmit();
            }}
            className="space-y-4"
          >
            {/* Icon Field */}
            <editForm.Field
              name="icon"
              validators={{
                onChange: createZodValidator(skillSchema.shape.icon),
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Icon Class</Label>
                  <div className="relative">
                    <Input
                      placeholder="devicon-react-original"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isUpdating}
                    />
                    {field.state.value && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <i className={`${field.state.value} text-lg`}></i>
                      </div>
                    )}
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-500">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </editForm.Field>

            {/* Name Field */}
            <editForm.Field
              name="name"
              validators={{
                onChange: createZodValidator(skillSchema.shape.name),
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label>Nama Skill</Label>
                  <Input
                    placeholder="React.js"
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
            </editForm.Field>

            {/* Preview */}
            <editForm.Subscribe selector={(state) => [state.values]}>
              {([values]) =>
                (values.name || values.icon) && (
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <div className="flex items-center gap-3 p-2 bg-background rounded border">
                      {values.icon ? (
                        <i className={`${values.icon} text-2xl`}></i>
                      ) : (
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                          <Code className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium text-sm">
                        {values.name || "Nama Skill"}
                      </span>
                    </div>
                  </div>
                )
              }
            </editForm.Subscribe>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
                className="flex-1"
              >
                Cancel
              </Button>
              <editForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isUpdating}
                    className="flex-1"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update
                      </>
                    )}
                  </Button>
                )}
              </editForm.Subscribe>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Skill</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus skill ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              {skill.icon ? (
                <i className={`${skill.icon} text-2xl`}></i>
              ) : (
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                  <Code className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <span className="font-medium">{skill.name}</span>
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