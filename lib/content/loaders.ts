import type { HomeContent } from "@/types/content";
import { homeContent } from "@/content/home";

export async function getHomeContent(): Promise<HomeContent> {
  // In the future, swap this for a CMS fetch + mapping + validation.
  return homeContent;
}
