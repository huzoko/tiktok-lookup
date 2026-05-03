
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to format numbers like 1.2k, 3.4m
  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "m";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + "k";
    }
    return value.toString();
  };

  // API Route for TikTok scraping
  app.get("/api/tiktok/:username", async (req, res) => {
    const { username } = req.params;
    const cleanUsername = username.replace(/^@/, "");

    const headers = {
        "Host": "www.tiktok.com",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Linux; Android 8.0.0; Plume L2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Mobile Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
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
      
      // Look for the script tag containing userInfo
      $("script").each((_, element) => {
        const text = $(element).text();
        if (text.includes("userInfo")) {
          try {
            const jsonText = text;
            const data = JSON.parse(jsonText);
            userData = data?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo;
          } catch (e) {
            // Might not be valid JSON or have a different structure
          }
        }
      });

      if (!userData) {
        // Fallback or secondary check for different data structures
        const sigData = $("#SIGI_STATE").text();
        if (sigData) {
          try {
             const data = JSON.parse(sigData);
             const userKey = Object.keys(data.UserModule.users)[0];
             const user = data.UserModule.users[userKey];
             const stats = data.UserModule.stats[userKey];
             userData = { user, stats };
          } catch (e) {}
        }
      }

      if (!userData) {
        return res.status(404).json({ error: "No user data found for this username" });
      }

      const { user, stats } = userData;

      // Map to countries for full names (simplified)
      const countryNames: Record<string, string> = {
        "US": "United States", "GB": "United Kingdom", "IT": "Italy", "FR": "France", "DE": "Germany",
        "JP": "Japan", "CN": "China", "IN": "India", "BR": "Brazil", "RU": "Russia", "CA": "Canada",
        "AU": "Australia", "KR": "South Korea", "ES": "Spain", "AR": "Argentina", "MX": "Mexico",
        "TR": "Turkey", "SA": "Saudi Arabia", "AE": "United Arab Emirates", "ID": "Indonesia",
        "VN": "Vietnam", "TH": "Thailand", "MY": "Malaysia", "PH": "Philippines", "EG": "Egypt",
        "DZ": "Algeria", "MA": "Morocco"
      };

      const region = user.region || "N/A";
      
      const result = {
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
      };

      res.json(result);
    } catch (error: any) {
      console.error("Scraping error:", error.message);
      res.status(500).json({ error: "Failed to fetch TikTok data. The account might be private or doesn't exist." });
    }
  });

  function getFlagEmoji(countryCode: string) {
    if (!countryCode || countryCode.length !== 2) return "🏳️";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
