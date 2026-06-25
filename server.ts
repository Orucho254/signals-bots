import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./api/index.ts";

const PORT = 3000;

// Configure Vite integration or static file serving
const setupServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log(
      "Starting server in DEVELOPMENT mode with Vite HMR middleware..."
    );
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log(
      "Starting server in PRODUCTION mode with static file bundle serving..."
    );
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Server running and listening internally on http://0.0.0.0:${PORT}`
    );
  });
};

setupServer().catch((error) => {
  console.error("Failed to start full-stack server middleware:", error);
});
