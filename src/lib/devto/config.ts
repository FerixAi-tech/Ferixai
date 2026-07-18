export function getDevToApiKey(): string | null {
  const apiKey = process.env.DEV_TO_API_KEY?.trim();
  return apiKey || null;
}
