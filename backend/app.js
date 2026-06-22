import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import strainRoutes from "./routes/strains.js";

const app = express();

// Behind Vercel/proxy — needed for correct client IP in rate limiting.
app.set("trust proxy", 1);

// Security headers.
app.use(helmet());

// CORS: allow local dev + this app's Vercel domains (incl. preview deploys).
const allowedOrigins = [
  "http://localhost:3000",
  "https://micro-vault.vercel.app",
  "https://microvault-topaz.vercel.app",
];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // same-origin, curl, server-to-server
      let host = "";
      try { host = new URL(origin).hostname; } catch { return cb(new Error("Invalid origin")); }
      if (allowedOrigins.includes(origin) || host.endsWith(".vercel.app")) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  }),
);

app.use(express.json({ limit: "1mb" }));

// Throttle auth endpoints to slow brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/strains", strainRoutes);

export default app;
