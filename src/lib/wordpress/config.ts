export function getWordPressConfig(): {
  siteUrl: string;
  username: string;
  appPassword: string;
} | null {
  const siteUrl = process.env.WORDPRESS_SITE_URL?.replace(/\/$/, "");
  const username = process.env.WORDPRESS_USERNAME?.trim();
  const appPassword = process.env.WORDPRESS_APP_PASSWORD?.replace(/\s/g, "");

  if (!siteUrl || !username || !appPassword) return null;
  return { siteUrl, username, appPassword };
}
