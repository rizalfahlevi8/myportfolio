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
import { SosmedFormValues } from "@/schema/sosmed-schema";
import {
  deleteSosmed,
  getSosmed,
  postSosmed,
  putSosmed,
} from "@/services/sosmed"; // Pastikan path ini sesuai dengan struktur project Anda
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { SosmedEditDropdown } from "./components/sosmed-edit-dropdown";
import { AddSosmedDialog } from "./components/add-sosmed-dialog";
import { extractUsernameFromUrl } from "@/lib/utils";

const SosmedPage = () => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch sosmeds data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getSosmed"],
    queryFn: getSosmed,
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (newSosmed: SosmedFormValues) => postSosmed(newSosmed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSosmed"] });
      toast.success("Sosial media berhasil ditambahkan!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan sosial media");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      sosmedId,
      data,
    }: {
      sosmedId: string;
      data: SosmedFormValues;
    }) => putSosmed(sosmedId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSosmed"] });
      toast.success("Sosial media berhasil diupdate!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal update sosial media");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (sosmedId: string) => deleteSosmed(sosmedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSosmed"] });
      toast.success("Sosial media berhasil dihapus!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus sosial media");
    },
  });

  const handleAddSosmed = async (data: SosmedFormValues) => {
    await addMutation.mutateAsync(data);
  };

  const handleUpdateSosmed = async (
    sosmedId: string,
    data: SosmedFormValues,
  ) => {
    setUpdatingId(sosmedId);
    try {
      await updateMutation.mutateAsync({ sosmedId, data });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteSosmed = async (sosmedId: string) => {
    setDeletingId(sosmedId);
    try {
      await deleteMutation.mutateAsync(sosmedId);
    } finally {
      setDeletingId(null);
    }
  };

  const validSosmeds = data?.filter((sosmed: any) => sosmed && sosmed.id) || [];

  // Group sosmeds into rows of 3
  const groupedSosmeds = [];
  for (let i = 0; i < validSosmeds.length; i += 3) {
    groupedSosmeds.push(validSosmeds.slice(i, i + 3));
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Heading
          title="Social Media Management"
          description="Kelola data media sosial yang kamu miliki"
        />
        <div className="flex items-center gap-4">
          <AddSosmedDialog
            onAdd={handleAddSosmed}
            isAdding={addMutation.isPending}
          />
        </div>
      </div>

      <Separator />

      {/* Sosmed List Card */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Social Media</CardTitle>
              <CardDescription>
                Social Media yang sudah ditambahkan
              </CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Link2 className="h-4 w-4 mr-2" />
              Total: {validSosmeds.length || 0} Sosial Media
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading sosial media...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error?.message}</p>
            </div>
          ) : validSosmeds.length > 0 ? (
            <div className="space-y-6">
              {groupedSosmeds.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                >
                  {row.map((sosmed: any) => {
                    if (!sosmed || !sosmed.id) return null;
                    const username = extractUsernameFromUrl(sosmed.url);

                    return (
                      <div
                        key={sosmed.id}
                        className="p-4 bg-background rounded-lg border hover:border-primary/20 transition-colors group relative"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0">
                            {sosmed.name ? (
                              <i
                                className={`fa-brands fa-${sosmed.name} text-2xl`}
                              />
                            ) : (
                              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-sm flex-1">
                            {username || "UnURL"}
                          </span>
                        </div>

                        <div className="absolute top-2 right-2">
                          <SosmedEditDropdown
                            sosmed={sosmed}
                            onUpdate={handleUpdateSosmed}
                            onDelete={handleDeleteSosmed}
                            isUpdating={updatingId === sosmed.id}
                            isDeleting={deletingId === sosmed.id}
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
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                Belum ada sosial media yang ditambahkan
              </p>
              <p className="text-sm">
                Mulai tambahkan sosial media pertama kamu menggunakan tombol
                &quot;Tambah Social Media&quot; di atas!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SosmedPage;
