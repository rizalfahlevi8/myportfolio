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
import { SosmedFormValues, sosmedSchema } from "@/schema/sosmed-schema";
import { useForm } from "@tanstack/react-form";
import { Link2, Loader2, Plus, Save } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

interface AddSosmedDialogProps {
  onAdd: (data: SosmedFormValues) => Promise<void>;
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

export function AddSosmedDialog({ onAdd, isAdding = false }: AddSosmedDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // TanStack Form
  const form = useForm({
    defaultValues: {
      name: "",
      url: "",
    } as SosmedFormValues,
    onSubmit: async ({ value }) => {
      await handleAdd(value);
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  const handleAdd = async (data: SosmedFormValues) => {
    try {
      await onAdd(data);
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error in handleAdd:", error);
    }
  };

  // Helper untuk preview username dari URL
  const getUsernamePreview = (url: string) => {
    if (!url) return "URL Sosmed";
    try {
      const parts = url.split("/").filter(Boolean);
      return parts.pop() || url;
    } catch {
      return url;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Social Media
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Tambah Social Media
          </DialogTitle>
          <DialogDescription>
            Masukkan nama platform dan link social media yang ingin ditampilkan.
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
            {/* Nama Sosmed Field */}
            <div>
              <form.Field
                name="name"
                validators={{
                  onChange: createZodValidator(sosmedSchema.shape.name),
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label className="uppercase text-sm font-semibold text-gray-700">
                      Sosial Media
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Ex: instagram"
                        value={field.state.value?.toLowerCase() ?? ""}
                        onChange={(e) =>
                          field.handleChange(e.target.value.toLowerCase())
                        }
                        onBlur={field.handleBlur}
                        className="pr-12 lowercase"
                        disabled={isAdding}
                      />
                      {/* Icon Preview di dalam Input */}
                      {field.state.value && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          <i className={`fa-brands fa-${field.state.value} text-xl`} />
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

            {/* URL Field */}
            <div>
              <form.Field
                name="url"
                validators={{
                  onChange: createZodValidator(sosmedSchema.shape.url),
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label className="uppercase text-sm font-semibold text-gray-700">
                      URL Sosial Media
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <Link2 className="h-5 w-5" />
                      </span>
                      <Input
                        type="text"
                        placeholder="Ex: https://instagram.com/yourusername"
                        value={field.state.value?.toLowerCase() ?? ""}
                        onChange={(e) =>
                          field.handleChange(e.target.value.toLowerCase())
                        }
                        onBlur={field.handleBlur}
                        className="pl-10 lowercase"
                        disabled={isAdding}
                      />
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

            {/* Live Preview Section */}
            <form.Subscribe selector={(state) => [state.values]}>
              {([values]) =>
                (values.name || values.url) && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Preview Sosmed Card:</p>
                      <Badge variant="outline" className="text-xs">
                        Live Preview
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Preview Style 1: Card Item */}
                      <div className="flex items-center gap-3 p-3 bg-background rounded border">
                        {values.name ? (
                          <i className={`fa-brands fa-${values.name} text-2xl`} />
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-sm truncate">
                          {getUsernamePreview(values.url)}
                        </span>
                      </div>

                      {/* Preview Style 2: Badge */}
                      <div className="flex items-center">
                        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
                          {values.name ? (
                            <i className={`fa-brands fa-${values.name} text-sm`} />
                          ) : (
                            <Link2 className="h-3 w-3" />
                          )}
                          <span className="capitalize">{values.name || "Platform"}</span>
                        </Badge>
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
                        Tambah Sosmed
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