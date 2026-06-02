import { checkTrial } from "@/lib/trial";

export async function isPro(userId: string): Promise<boolean> {
  const trial = await checkTrial(userId, "guau");
  return !trial.isExpired;
}

export async function getDaysLeft(userId: string): Promise<number> {
  const trial = await checkTrial(userId, "guau");
  return trial.daysLeft;
}

export async function checkPaywall(userId: string): Promise<"trialing" | "active" | "expired"> {
  const trial = await checkTrial(userId, "guau");
  if (trial.isExpired) return "expired";
  if (trial.status === "active") return "active";
  return "trialing";
}
