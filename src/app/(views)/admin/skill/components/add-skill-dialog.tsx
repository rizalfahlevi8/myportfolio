"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SkillFormValues, skillSchema } from "@/schema/skill-schema";
import { useForm } from "@tanstack/react-form";
import { Code, ExternalLink, Loader2, Plus } from "lucide-react";
import { z } from "zod";
import { useSkillStore } from "@/store/admin/skill-store";

interface AddSkillDialogProps {
  onAdd: (data: SkillFormValues) => Promise<void>;
  isAdding?: boolean;
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

export function AddSkillDialog({ onAdd, isAdding = false }: AddSkillDialogProps) {
  const { isAddDialogOpen, openAddDialog, closeAddDialog } = useSkillStore();

  // TanStack Form
  const form = useForm({
    defaultValues: {
      name: "",
      icon: "",
    } as SkillFormValues,
    onSubmit: async ({ value }) => {
      await handleAdd(value);
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (open) openAddDialog();
    else {
      closeAddDialog();
      form.reset();
    }
  };

  const handleAdd = async (data: SkillFormValues) => {
    try {
      await onAdd(data);
      form.reset();
    } catch (error) {
      console.error("Error in handleAdd:", error);
    }
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Skill Baru
          </DialogTitle>
          <DialogDescription>
            Masukkan nama skill dan icon class dari{" "}
            <a
              href="https://devicon.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
            >
              Devicon
              <ExternalLink className="h-3 w-3" />
            </a>
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
            {/* Icon Field */}
            <div>
              <form.Field
                name="icon"
                validators={{
                  onChange: createZodValidator(skillSchema.shape.icon),
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label className="uppercase text-sm font-semibold text-gray-700">
                      Icon Class 
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="devicon-react-original"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pr-12"
                        disabled={isAdding}
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
              </form.Field>
            </div>

            {/* Name Field */}
            <div>
              <form.Field
                name="name"
                validators={{
                  onChange: createZodValidator(skillSchema.shape.name),
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label className="uppercase text-sm font-semibold text-gray-700">
                      Nama Skill *
                    </Label>
                    <Input
                      type="text"
                      placeholder="React.js"
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

            {/* Tips Section */}
            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium mb-2">Penggunaan Icon:</p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • Format:{" "}
                      <code className="bg-background px-1 rounded">
                        devicon-[tech]-[variant]
                      </code>
                    </li>
                    <li>
                      • Contoh:{" "}
                      <code className="bg-background px-1 rounded">
                        devicon-javascript-original
                      </code>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Resources:</p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      •{" "}
                      <a
                        href="https://devicon.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Devicon Gallery
                      </a>{" "}
                      - Lihat semua icon
                    </li>
                    <li>
                      •{" "}
                      <a
                        href="https://github.com/devicons/devicon"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        GitHub Repo
                      </a>{" "}
                      - Dokumentasi lengkap
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <form.Subscribe selector={(state) => [state.values]}>
              {([values]) =>
                (values.name || values.icon) && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Preview Skill Card:</p>
                      <Badge variant="outline" className="text-xs">
                        Live Preview
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-background rounded border">
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

                      <div className="flex items-center">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-2"
                        >
                          {values.icon ? (
                            <i className={`${values.icon} text-sm`}></i>
                          ) : (
                            <Code className="h-3 w-3" />
                          )}
                          {values.name || "Nama Skill"}
                        </Badge>
                      </div>

                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-background rounded-lg border flex items-center justify-center">
                          {values.icon ? (
                            <i className={`${values.icon} text-3xl`}></i>
                          ) : (
                            <Code className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {values.icon ? (
                          <i className={`${values.icon} text-lg`}></i>
                        ) : (
                          <Code className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{values.name || "Nama Skill"}</span>
                      </div>
                    </div>
                  </div>
                )
              }
            </form.Subscribe>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeAddDialog}
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
                    disabled={!canSubmit || isAdding}
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Menambahkan...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Skill
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