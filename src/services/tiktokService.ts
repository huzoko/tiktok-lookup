
import { TikTokAccountInfo } from "../types/tiktok";

export const tiktokService = {
  async fetchAccountRegion(input: string): Promise<TikTokAccountInfo> {

    const usernameMatch = input.match(/(?:@|tiktok\.com\/@)([\w.]+)/);
    const username = usernameMatch ? usernameMatch[1] : input.replace(/^@/, "");

    if (!username || username.length < 2) {
      throw new Error("Invalid TikTok username or URL");
    }

    try {
      const response = await fetch(`/api/tiktok/${username}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch account information.");
      }

      const data = await response.json();
      return data as TikTokAccountInfo;
    } catch (error: any) {
      console.error("TikTok Service Error:", error);
      throw new Error(error.message || "Failed to fetch account information. Please try again.");
    }
  }
};
