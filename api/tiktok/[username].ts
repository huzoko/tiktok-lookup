import axios from "axios";
import * as cheerio from "cheerio";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const formatNumber = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + "m";
  if (value >= 1000) return (value / 1000).toFixed(1) + "k";
  return value.toString();
};

function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return "🏳️";
  const codePoints = countryCode.toUpperCase().split("").map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const countryNames: Record<string, string> = {
  "US": "United States", "GB": "United Kingdom", "IT": "Italy", "FR": "France", "DE": "Germany",
  "JP": "Japan", "CN": "China", "IN": "India", "BR": "Brazil", "RU": "Russia", "CA": "Canada",
  "AU": "Australia", "KR": "South Korea", "ES": "Spain", "AR": "Argentina", "MX": "Mexico",
  "TR": "Turkey", "SA": "Saudi Arabia", "AE": "United Arab Emirates", "ID": "Indonesia",
  "VN": "Vietnam", "TH": "Thailand", "MY": "Malaysia", "PH": "Philippines", "EG": "Egypt",
  "DZ": "Algeria", "MA": "Morocco"
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { username } = req.query;
  const cleanUsername = (username as string).replace(/^@/, "");

  const headers = {
    "Host": "www.tiktok.com",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Linux; Android 8.0.0; Plume L2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Mobile Safari/537.36",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "sec-fetch-site": "none",
    "sec-fetch-mode": "navigate",
    "sec-fetch-user": "?1",
    "sec-fetch-dest": "document",
    "accept-language": "en-US,en;q=0.9"
  };

  try {
    const response = await axios.get(`https://www.tiktok.com/@${cleanUsername}`, { headers, timeout: 10000 });
    const $ = cheerio.load(response.data);

    let userData: any = null;

    $("script").each((_, element) => {
      const text = $(element).text();
      if (text.includes("userInfo")) {
        try {
          const data = JSON.parse(text);
          userData = data?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo;
        } catch (e) {}
      }
    });

    if (!userData) {
      const sigData = $("#SIGI_STATE").text();
      if (sigData) {
        try {
          const data = JSON.parse(sigData);
          const userKey = Object.keys(data.UserModule.users)[0];
          userData = {
            user: data.UserModule.users[userKey],
            stats: data.UserModule.stats[userKey]
          };
        } catch (e) {}
      }
    }

    if (!userData) {
      return res.status(404).json({ error: "No user data found for this username" });
    }

    const { user, stats } = userData;
    const region = user.region || "N/A";

    res.json({
      username: user.uniqueId,
      nickname: user.nickname || "N/A",
      avatar: user.avatarLarger || user.avatarMedium || user.avatarThumb,
      bio: user.signature || "N/A",
      region,
      countryName: countryNames[region] || region,
      countryCode: region,
      flag: region !== "N/A" ? getFlagEmoji(region) : "🏳️",
      followers: formatNumber(stats.followerCount || 0),
      following: formatNumber(stats.followingCount || 0),
      likes: formatNumber(stats.heartCount || 0),
      videos: formatNumber(stats.videoCount || 0),
      profileUrl: `https://www.tiktok.com/@${user.uniqueId}`
    });
  } catch (error: any) {
    console.error("Scraping error:", error.message);
    res.status(500).json({ error: "Failed to fetch TikTok data." });
  }
}