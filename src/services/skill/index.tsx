import { PATH_API_NEXT_SKILL } from "@/constants/routes/pages/menu/configuration";
import { axiosFetcher } from "@/lib/axios/axiosFetcher";
import { Skill, SkillFormValues } from "@/schema/skill-schema";

export const getSkills = async (): Promise<Skill[] | null> => {
  const res = await axiosFetcher<Skill[]>("get", PATH_API_NEXT_SKILL);

  return res.data ?? null;
};

export const postSkill = async (skill: SkillFormValues): Promise<Skill | null> => {
  const res = await axiosFetcher<Skill>("post", PATH_API_NEXT_SKILL, skill);
  
  return res.data ?? null;
};

export const putSkill = async (id: string, skill: SkillFormValues): Promise<Skill | null> => {
  const res = await axiosFetcher<Skill>("put", `${PATH_API_NEXT_SKILL}/${id}`, skill);
  return res.data ?? null;
};

export const deleteSkill = async (id: string): Promise<void> => {
  await axiosFetcher<void>("delete", `${PATH_API_NEXT_SKILL}/${id}`);
};