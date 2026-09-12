import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialization of Gemini client with aistudio-build telemetry
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Wavelink" });
});

// System version & software update info
app.get("/api/system/version", (req, res) => {
  const channel = (req.query.channel as string) === "beta" ? "beta" : "stable";

  const latestVersion = channel === "beta" ? "2.6.0-beta.2" : "2.5.0";
  const build = channel === "beta" ? "build-2026.09.12-beta-9f2b1a" : "build-2026.09.12-prod-e4f8a1";

  res.json({
    latestVersion,
    channel,
    build,
    releaseDate: "September 12, 2026",
    size: "4.8 MB",
    changelog: [
      {
        version: "2.5.0",
        title: "Multimodal Gemini & Live Audio Architecture",
        date: "September 2026",
        size: "4.8 MB",
        highlights: [
          "Gemini 3.1 Flash Live preview integration with low-latency bidirectional WebSocket voice streaming",
          "Gemini 3.5 Transcribe engine for voice memos and real-time speech dictation in posts and DMs",
          "Multi-turn Gemini chatbot with customizable role personas and prompt templates",
          "Refined responsive design, high-contrast typography, and enhanced dark mode accents",
          "Automated software update verification and channel management system"
        ],
      },
      {
        version: "2.4.2",
        title: "Ephemeral Stories & Media Feed Optimization",
        date: "August 2026",
        size: "3.2 MB",
        highlights: [
          "24-hour disappearing stories with visual progress indicator and audio waveforms",
          "Personal profile customizer with banner and avatar management",
          "Instant search across hashtags, users, and post content"
        ],
      },
      {
        version: "2.3.0",
        title: "Direct Messaging & Community Hub",
        date: "July 2026",
        size: "2.9 MB",
        highlights: [
          "Multi-user simulated conversation threads with unread indicators",
          "Hashtag exploration dashboard and trending analytics"
        ],
      }
    ]
  });
});

// 2. Audio Transcription endpoint using gemini-3.5-transcribe
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm", prompt } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "audioBase64 is required" });
    }

    const ai = getAI();
    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          audioPart,
          {
            text:
              prompt ||
              "Transcribe the spoken audio verbatim into clean, natural text with appropriate punctuation. Output ONLY the transcription, with no conversational filler or commentary.",
          },
        ],
      },
    });

    const transcription = response.text || "";
    return res.json({ text: transcription.trim() });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to transcribe audio",
    });
  }
});

// 3. Multi-turn Gemini chatbot endpoint
// Supports gemini-3.5-flash (general), gemini-3.1-flash-lite (fast), and gemini-3.1-pro-preview (complex)
app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages,
      model = "gemini-3.5-flash",
      systemInstruction = "You are Wavelink AI, an intelligent, helpful, and friendly assistant integrated into the Wavelink social platform.",
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Validate supported models
    const validModels = [
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.1-pro-preview",
    ];
    const selectedModel = validModels.includes(model)
      ? model
      : "gemini-3.5-flash";

    const ai = getAI();

    // Map conversation history to Gemini contents format
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      reply: response.text || "",
      model: selectedModel,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return res.status(500).json({
      error: error?.message || "Chat generation failed",
    });
  }
});

async function startServer() {
  const server = http.createServer(app);

  // 4. WebSocket Server for Live Voice Conversations (Live API)
  // Uses gemini-3.1-flash-live-preview
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", async (clientWs: WebSocket) => {
    let session: any = null;
    let isAlive = true;

    clientWs.on("close", () => {
      isAlive = false;
      if (session) {
        try {
          session.close();
        } catch (e) {
          // ignore
        }
      }
    });

    try {
      const ai = getAI();

      clientWs.send(
        JSON.stringify({
          type: "status",
          status: "connecting",
          message: "Connecting to gemini-3.1-flash-live-preview...",
        })
      );

      session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Zephyr" },
            },
          },
          systemInstruction:
            "You are Wavelink Live AI, a conversational, engaging, and friendly real-time voice companion for the Wavelink social network. Keep your spoken responses natural, brief, conversational, and energetic.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (!isAlive || clientWs.readyState !== WebSocket.OPEN) return;

            // Handle audio chunk from model
            const audioData =
              message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              clientWs.send(
                JSON.stringify({
                  type: "audio",
                  audio: audioData,
                })
              );
            }

            // Handle interruption signal from user speech
            if (message.serverContent?.interrupted) {
              clientWs.send(
                JSON.stringify({
                  type: "interrupted",
                })
              );
            }

            // End of model turn
            if (message.serverContent?.turnComplete) {
              clientWs.send(
                JSON.stringify({
                  type: "turnComplete",
                })
              );
            }
          },
          onerror: (err: any) => {
            console.error("Live API session error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: "error",
                  error: err?.message || "Live API error",
                })
              );
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: "status",
                  status: "closed",
                  message: "Live session ended",
                })
              );
            }
          },
        },
      });

      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "status",
            status: "ready",
            message: "Connected to Gemini Live API. Speak into your microphone.",
          })
        );
      }

      // Handle audio stream from client
      clientWs.on("message", (raw: any) => {
        if (!session) return;
        try {
          const parsed = JSON.parse(raw.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: {
                data: parsed.audio,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          } else if (parsed.text) {
            session.sendRealtimeInput({
              text: parsed.text,
            });
          }
        } catch (err) {
          console.error("Error processing client audio chunk:", err);
        }
      });
    } catch (err: any) {
      console.error("Failed to connect to Live API:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "error",
            error:
              err?.message ||
              "Could not start Live voice session. Please ensure your Gemini API key is valid.",
          })
        );
        clientWs.close();
      }
    }
  });

  // Upgrade handler for WebSocket path '/live'
  server.on("upgrade", (request, socket, head) => {
    try {
      const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
      if (url.pathname === "/live") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      }
    } catch (e) {
      // ignore
    }
  });

  // 5. Integrate Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Wavelink full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
