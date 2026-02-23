import { create } from "zustand";
import { Skill } from "@/schema/skill-schema";

interface SkillState {
  // Add Dialog
  isAddDialogOpen: boolean;
  openAddDialog: () => void;
  closeAddDialog: () => void;

  // Edit Dialog
  editingSkill: Skill | null;
  setEditingSkill: (skill: Skill | null) => void;

  // Delete Dialog
  deletingSkill: Skill | null;
  setDeletingSkill: (skill: Skill | null) => void;

  // View Dialog
  viewingSkill: Skill | null;
  setViewingSkill: (skill: Skill | null) => void;
}

export const useSkillStore = create<SkillState>((set) => ({
  // Add State
  isAddDialogOpen: false,
  openAddDialog: () => set({ isAddDialogOpen: true }),
  closeAddDialog: () => set({ isAddDialogOpen: false }),

  // Edit State
  editingSkill: null,
  setEditingSkill: (skill) => set({ editingSkill: skill }),

  // Delete State
  deletingSkill: null,
  setDeletingSkill: (skill) => set({ deletingSkill: skill }),

  // View State
  viewingSkill: null,
  setViewingSkill: (skill) => set({ viewingSkill: skill }),
}));