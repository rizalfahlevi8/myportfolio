import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAbout, putAbout } from "@/services/about";
import { AboutFormValues } from "@/schema/about-schema";
import { useAboutStore } from "@/store/admin/about-store";
import toast from "react-hot-toast";

export const useAbout = () => {
  const queryClient = useQueryClient();
  const { setUpdatingId, closeDialog, resetProfileState } = useAboutStore();

  const {
    data: aboutData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["getAbout"],
    queryFn: getAbout,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      aboutId,
      updateData,
    }: {
      aboutId: string;
      updateData: {
        data: AboutFormValues;
        profileFile?: File | null;
        profileDeleted?: boolean;
        oldProfile?: string;
      };
    }) => putAbout({ aboutId, ...updateData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAbout"] });
      toast.success("Data diri berhasil diupdate!");
      closeDialog();
      resetProfileState(); 
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal update data diri");
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const handleUpdateAbout = async (
    aboutId: string,
    updateData: {
      data: AboutFormValues;
      profileFile?: File | null;
      profileDeleted?: boolean;
      oldProfile?: string;
    }
  ) => {
    setUpdatingId(aboutId);
    try {
      await updateMutation.mutateAsync({ aboutId, updateData });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    aboutData,
    isLoading,
    isError,
    error,
    updateMutation,
    handleUpdateAbout,
  };
};