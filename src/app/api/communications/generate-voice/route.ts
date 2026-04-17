import { NextRequest, NextResponse } from "next/server";
import { generateVoice } from "@/lib/messaging";
import { readJsonBody } from "@/lib/http/read-json-body";

export type GenerateVoiceBody = {
  text: string;
};

export async function POST(req: NextRequest): Promise<Response> {
  if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) {
    return NextResponse.json(
      { success: false, error: "ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID must be set in .env.local" },
      { status: 503 }
    );
  }

  const parsed = await readJsonBody<GenerateVoiceBody>(req);
  if (!parsed.ok) return parsed.response;

  const { text } = parsed.data;
  if (!text?.trim()) {
    return NextResponse.json({ success: false, error: "text is required" }, { status: 422 });
  }

  try {
    const audio = await generateVoice(text);
    return new Response(audio.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "Content-Disposition": 'inline; filename="voice-note.mp3"',
      },
    });
  } catch (err) {
    console.error("[ElevenLabs] generate-voice failed:", err);
    return NextResponse.json(
      { success: false, error: "ElevenLabs generation failed. Check your API key and Voice ID." },
      { status: 502 }
    );
  }
}
