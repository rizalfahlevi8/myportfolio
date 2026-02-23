import { create } from "zustand";

interface AboutState {
  // Dialog State
  isDialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;

  // Update Loading State
  updatingId: string | null;
  setUpdatingId: (id: string | null) => void;

  // Profile File State
  profileFile: File | null;
  profilePreview: string;
  profileDeleted: boolean;
  isUploadingProfile: boolean;

  // Actions
  setProfileFile: (file: File | null) => void;
  setProfilePreview: (preview: string) => void;
  setProfileDeleted: (deleted: boolean) => void;
  setIsUploadingProfile: (uploading: boolean) => void;
  
  handleProfileChange: (file: File) => void;
  removeProfile: () => void;
  removeExistingProfile: () => void;
  restoreExistingProfile: () => void;
  resetProfileState: () => void;
}

export const useAboutStore = create<AboutState>((set, get) => ({
  // Initial State
  isDialogOpen: false,
  updatingId: null,
  profileFile: null,
  profilePreview: "",
  profileDeleted: false,
  isUploadingProfile: false,

  // Dialog Actions
  openDialog: () => set({ isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false }),

  // Setters
  setUpdatingId: (id) => set({ updatingId: id }),
  setProfileFile: (file) => set({ profileFile: file }),
  setProfilePreview: (preview) => set({ profilePreview: preview }),
  setProfileDeleted: (deleted) => set({ profileDeleted: deleted }),
  setIsUploadingProfile: (uploading) => set({ isUploadingProfile: uploading }),

  // Profile Logic
  handleProfileChange: (file) => {
    const previewUrl = URL.createObjectURL(file);
    // Revoke old preview URL if exists to avoid memory leaks
    if (get().profilePreview) {
      URL.revokeObjectURL(get().profilePreview);
    }
    set({
      profileFile: file,
      profilePreview: previewUrl,
      profileDeleted: false,
    });
  },

  removeProfile: () => {
    if (get().profilePreview) {
      URL.revokeObjectURL(get().profilePreview);
    }
    set({ profileFile: null, profilePreview: "" });
  },

  removeExistingProfile: () => set({ profileDeleted: true }),

  restoreExistingProfile: () => set({ profileDeleted: false }),

  resetProfileState: () => {
    if (get().profilePreview) {
      URL.revokeObjectURL(get().profilePreview);
    }
    set({
      profileFile: null,
      profilePreview: "",
      profileDeleted: false,
      isUploadingProfile: false,
    });
  },
}));