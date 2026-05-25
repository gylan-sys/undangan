import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parser with large limit for uploading images/config/music
  app.use(express.json({ limit: "50mb" }));

  // Ensure uploads directory exists inside a persistent/public directory
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const uploadsDir = path.join(publicDir, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploads directory
  app.use("/uploads", express.static(uploadsDir));

  // Configuration persistence paths
  const configPath = path.join(process.cwd(), "wedding_config_server.json");

  // GET configuration
  app.get("/api/config", (req, res) => {
    if (fs.existsSync(configPath)) {
      try {
        const configData = fs.readFileSync(configPath, "utf8");
        return res.json(JSON.parse(configData));
      } catch (err: any) {
        console.error("Error reading config:", err);
      }
    }
    // Return empty if not created yet
    res.json({});
  });

  // POST save configuration
  app.post("/api/save-config", (req, res) => {
    try {
      const config = req.body;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
      res.json({ success: true, message: "Configuration saved successfully as default" });
    } catch (err: any) {
      console.error("Error saving config:", err);
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });

  // POST upload (accepts Base64 from client-side FileReader)
  app.post("/api/upload", (req, res) => {
    const { name, type, base64 } = req.body;
    if (!base64 || !name) {
      return res.status(400).json({ error: "Missing file data" });
    }
    try {
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 format" });
      }
      const buffer = Buffer.from(matches[2], "base64");
      const ext = path.extname(name) || (type === "audio" ? ".mp3" : ".jpg");
      
      // Clean name from unsafe characters
      const cleanName = name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const filename = `${type || "file"}-${Date.now()}-${cleanName}`;
      
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      
      const fileUrl = `/uploads/${filename}`;
      res.json({ url: fileUrl });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message || "Failed to save file" });
    }
  });

  // POST save wish directly to configuration on server
  app.post("/api/wishes", (req, res) => {
    try {
      const { name, message } = req.body;
      if (!name || !message) {
        return res.status(400).json({ error: "Name and message are required" });
      }
      
      let currentConfig: any = {};
      if (fs.existsSync(configPath)) {
        try {
          currentConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
        } catch (err) {
          console.error("Error reading config for wish:", err);
        }
      }
      
      const wishes = currentConfig.wishes || [
        { name: "Andi Pratama", message: "Selamat menempuh hidup baru Gilang & Nissa! Semoga samawa selamanya.", time: "Barusan" },
        { name: "Siti Halimah", message: "Barakallah! Semoga lancar sampai hari-H dan jadi keluarga sakinah.", time: "2 jam yang lalu" },
        { name: "Rizky Ramadhan", message: "Happy wedding ya buat kalian berdua! Semoga langgeng terus sampai maut memisahkan.", time: "Kemarin" }
      ];
      
      const newWish = { name, message, time: "Barusan" };
      wishes.unshift(newWish);
      currentConfig.wishes = wishes;
      
      fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), "utf8");
      res.json({ success: true, wishes });
    } catch (err: any) {
      console.error("Error saving wish:", err);
      res.status(500).json({ error: "Failed to save wish" });
    }
  });

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
