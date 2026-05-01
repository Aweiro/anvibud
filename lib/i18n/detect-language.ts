
import { headers } from "next/headers";

export async function detectLanguage() {
  const headerList = await headers();
  const acceptLanguage = headerList.get("accept-language");
  
  if (!acceptLanguage) return "uk";

  // Example: "uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7"
  const preferredLocales = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].split("-")[0].trim().toLowerCase());

  // Check supported languages in order of preference
  const supported = ["uk", "en", "pl"];
  for (const locale of preferredLocales) {
    if (supported.includes(locale)) {
      return locale;
    }
  }

  return "uk"; // Default to Ukrainian instead of English
}
