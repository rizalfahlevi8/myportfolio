import { PATH_API_NEXT_SOSMED } from "@/constants/routes/pages/menu/configuration";
import { axiosFetcher } from "@/lib/axios/axiosFetcher";
import { Sosmed, SosmedFormValues } from "@/schema/sosmed-schema";

export const getSosmed = async (): Promise<Sosmed[] | null> => {
  const res = await axiosFetcher<Sosmed[]>("get", PATH_API_NEXT_SOSMED);

  return res.data ?? null;
};

export const postSosmed = async (sosmed: SosmedFormValues): Promise<Sosmed | null> => {
  const res = await axiosFetcher<Sosmed>("post", PATH_API_NEXT_SOSMED, sosmed);
  
  return res.data ?? null;
};

export const putSosmed = async (id: string, sosmed: SosmedFormValues): Promise<Sosmed | null> => {
  const res = await axiosFetcher<Sosmed>("put", `${PATH_API_NEXT_SOSMED}/${id}`, sosmed);
  return res.data ?? null;
};

export const deleteSosmed = async (id: string): Promise<void> => {
  await axiosFetcher<void>("delete", `${PATH_API_NEXT_SOSMED}/${id}`);
};