import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteSkill, getSkills, postSkill, putSkill } from "@/services/skill";
import { SkillFormValues } from "@/schema/skill-schema";
import { useSkillStore } from "@/store/admin/skill-store";
import toast from "react-hot-toast";

export const useSkills = () => {
  const queryClient = useQueryClient();
  const { closeAddDialog, setEditingSkill, setDeletingSkill } = useSkillStore();

  // Fetch Query
  const {
    data: skills,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["getSkills"],
    queryFn: getSkills,
  });

  // Add Mutation
  const addMutation = useMutation({
    mutationFn: (newSkill: SkillFormValues) => postSkill(newSkill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSkills"] });
      toast.success("Skill berhasil ditambahkan!");
      closeAddDialog(); // Tutup modal via store
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan skill");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ skillId, data }: { skillId: string; data: SkillFormValues }) =>
      putSkill(skillId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSkills"] });
      toast.success("Skill berhasil diupdate!");
      setEditingSkill(null); // Tutup modal edit via store
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal update skill");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (skillId: string) => deleteSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getSkills"] });
      toast.success("Skill berhasil dihapus!");
      setDeletingSkill(null); // Tutup modal delete via store
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus skill");
    },
  });

  // Handler Functions
  const handleAddSkill = async (data: SkillFormValues) => {
    await addMutation.mutateAsync(data);
  };

  const handleUpdateSkill = async (skillId: string, data: SkillFormValues) => {
    await updateMutation.mutateAsync({ skillId, data });
  };

  const handleDeleteSkill = async (skillId: string) => {
    await deleteMutation.mutateAsync(skillId);
  };

  return {
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
  };
};