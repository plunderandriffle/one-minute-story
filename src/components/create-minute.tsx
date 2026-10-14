import { useEffect, useRef, useState } from "react";
import { Mic, Lightbulb, Link2, ArrowRight, ArrowLeft, KeyRound, Loader2, ExternalLink, Download, Film } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { callMinuteEngine } from "@/lib/minute-engine.functions";

type Mode = "voice" | "idea" | "url";
type Stage = "input" | "page" | "rendering" | "video";
const KEY_STORAGE = "one-minute-api-key";
const options = [{ id: "voice" as const, title: "Voice note", icon: Mic }, { id: "idea" as const, title: "An idea", icon: Lightbulb }, { id: "url" as const, title: "Business URL", icon: Link2 }];

function find(obj: unknown, keys: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const [k, v] of Object.entries(obj)) {
    if (keys.includes(k) && typeof v === "string" && v) return v;
  }
  for (const v of Object.values(obj)) { const hit = find(v, keys); if (hit) return hit; }
  return undefined;
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function CreateMinute({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const engine = useServerFn(callMinuteEngine);
  const [apiKey, setApiKey] = useState("");
  const [keyDraft, setKeyDraft] = useState("");
  const [credits, setCredits] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("idea");
  const [idea, setIdea] = useState("");
  const [url, setUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [pageUrl, setPageUrl] = useState("");
  const [mp4Url, setMp4Url] = useState("");
  const cancelled = useRef(false);

  useEffect(() => { const saved = localStorage.getItem(KEY_STORAGE); if (saved) { setApiKey(saved); setKeyDraft(saved); } }, []);
  useEffect(() => { cancelled.current = !open; }, [open]);

  async function call(tool: Parameters<typeof engine>[0]["data"]["tool"], args: Record<string, string> = {}, key = apiKey) {
    const res = await engine({ data: { apiKey: key, tool, args } });
    if (!res.ok) throw new Error(res.error);
    return res.data;
  }

  async function saveKey() {
    setError(""); setBusy("Checking your key…");
    try {
      const account = await call("get_account", {}, keyDraft.trim());
      localStorage.setItem(KEY_STORAGE, keyDraft.trim());
      setApiKey(keyDraft.trim());
      const c = (account as Record<string, unknown>)["credits"] ?? find(account, ["credits", "remaining"]);
      setCredits(c === -1 || c === "-1" ? "Unlimited" : c != null ? String(c) : null);
    } catch (e) { setError(e instanceof Error ? e.message : "That key didn’t work."); }
    setBusy("");
  }
  function forgetKey() { localStorage.removeItem(KEY_STORAGE); setApiKey(""); setKeyDraft(""); setCredits(null); }

  async function poll(tool: "get_audioscript_status" | "get_mp4_status", jobId: string, keys: string[]) {
    for (let i = 0; i < 90 && !cancelled.current; i++) {
      await sleep(4000);
      const s = await call(tool, { jobId });
      const status = String(s["status"] ?? "");
      if (status === "failed") throw new Error(String(s["error"] ?? "Rendering failed. Your credits were refunded."));
      const hit = find(s, keys);
      if (status === "done" && hit) return hit;
    }
    throw new Error("This is taking longer than expected. Try again shortly.");
  }

  async function submit() {
    setError("");
    try {
      if (mode === "url") {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Enter a full website address, like https://yourbusiness.com.");
        setBusy("Writing your business minute…");
        const res = await call("create_before_pitch", { input: parsed.href });
        const page = find(res, ["pageUrl", "page_url", "url", "shareUrl"]);
        if (!page) throw new Error("No preview came back. Try again.");
        setPageUrl(page);
      } else {
        let args: Record<string, string>;
        if (mode === "idea") {
          if (!idea.trim()) throw new Error("Add a little of your story first.");
          if (wordCount(idea) >= 150) throw new Error("Keep it under 150 words — that’s about a minute.");
          args = { script: idea.trim(), title: "My first minute" };
        } else {
          if (!/^https:\/\//.test(audioUrl.trim())) throw new Error("Paste an https link to your voice note.");
          args = { audio_url: audioUrl.trim(), title: "My first minute" };
        }
        setBusy("Timing captions to your words…");
        const res = await call("create_audioscript", args);
        const jobId = find(res, ["jobId", "job_id"]);
        if (!jobId) throw new Error("No job came back. Try again.");
        setPageUrl(await poll("get_audioscript_status", jobId, ["pageUrl", "page_url", "url"]));
      }
      setStage("page");
    } catch (e) { setError(e instanceof Error && e.message !== "Invalid URL" ? e.message : "Enter a full website address, like https://yourbusiness.com."); }
    setBusy("");
  }

  async function renderMp4() {
    setError(""); setStage("rendering");
    try {
      const res = await call("request_mp4", { pageUrl });
      const jobId = find(res, ["jobId", "job_id"]);
      if (!jobId) throw new Error("No render job came back.");
      setMp4Url(await poll("get_mp4_status", jobId, ["mp4Url", "mp4_url", "url"]));
      setStage("video");
    } catch (e) { setError(e instanceof Error ? e.message : "Rendering failed."); setStage("page"); }
  }

  function reset() { setStage("input"); setPageUrl(""); setMp4Url(""); setError(""); }

  const title = !apiKey ? "Connect your key." : stage === "video" ? "Your minute is ready." : stage === "input" ? "Start with something you." : "Your story starts here.";
  const description = !apiKey ? "Your key stays in this browser and powers your videos." : stage === "input" ? "A voice. A thought. A business. Pick your starting point." : stage === "page" ? "Preview it. Love it? Render the video." : stage === "rendering" ? "Rendering your video. 1–3 minutes." : "Watch it, save it, share it.";

  return <Dialog open={open} onOpenChange={value => { onOpenChange(value); if (!value) reset(); }}>
    <DialogContent className="create-dialog">
      <span className="eyebrow"><span className="eyebrow-dot" /> YOUR FIRST MINUTE</span>
      <DialogTitle className="create-title">{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>

      {!apiKey ? <form onSubmit={e => { e.preventDefault(); void saveKey(); }}>
        <label className="create-label mt-3" htmlFor="api-key">API key</label>
        <input id="api-key" className="create-input" type="password" autoComplete="off" placeholder="Paste your API key" value={keyDraft} onChange={e => setKeyDraft(e.target.value)} />
        {error && <p role="alert" className="form-note text-destructive">{error}</p>}
        <Button variant="minute" type="submit" className="mt-5 w-full" disabled={!!busy || keyDraft.trim().length < 8}>{busy ? <><Loader2 className="animate-spin" /> {busy}</> : <><KeyRound /> SAVE MY KEY</>}</Button>
        <p className="form-note text-center">Saved only on this device. Each video uses credits.</p>
      </form> : stage === "input" ? <>
        <div className="create-tabs" role="tablist" aria-label="Starting point">{options.map(option => <Button role="tab" aria-selected={mode === option.id} key={option.id} variant="quiet" className="create-tab" data-active={mode === option.id} onClick={() => { setMode(option.id); setError(""); }}><option.icon />{option.title}</Button>)}</div>
        <form onSubmit={event => { event.preventDefault(); void submit(); }}>
          {mode === "idea" && <><label className="create-label" htmlFor="idea">What’s your story? <span className="text-muted-foreground">({wordCount(idea)}/149 words)</span></label><textarea id="idea" className="create-input" rows={5} placeholder="It all started when…" value={idea} onChange={e => setIdea(e.target.value)} maxLength={1200} /></>}
          {mode === "url" && <><label className="create-label" htmlFor="business-url">Your business website</label><input id="business-url" className="create-input" type="url" placeholder="https://yourbusiness.com" value={url} onChange={e => setUrl(e.target.value)} /></>}
          {mode === "voice" && <><label className="create-label" htmlFor="voice-url">Link to your voice note</label><input id="voice-url" className="create-input" type="url" placeholder="https://…/my-note.mp3" value={audioUrl} onChange={e => setAudioUrl(e.target.value)} /><p className="form-note">MP3, M4A or WAV · up to 3 minutes · public https link.</p></>}
          {error && <p role="alert" className="form-note text-destructive">{error}</p>}
          <Button variant="minute" type="submit" className="mt-5 w-full" disabled={!!busy}>{busy ? <><Loader2 className="animate-spin" /> {busy}</> : <>CREATE MY MINUTE <ArrowRight /></>}</Button>
          <p className="form-note text-center">{credits ? `Credits: ${credits} · ` : ""}<button type="button" className="underline" onClick={forgetKey}>Change key</button></p>
        </form>
      </> : stage === "video" ? <>
        <video src={mp4Url} controls autoPlay playsInline className="mt-3 w-full rounded-md" style={{ maxHeight: 420 }} />
        <div className="flex items-center justify-between gap-2"><Button variant="quiet" onClick={reset}><ArrowLeft /> New minute</Button><Button variant="minute" asChild><a href={mp4Url} target="_blank" rel="noreferrer" download><Download /> SAVE VIDEO</a></Button></div>
      </> : <>
        <a href={pageUrl} target="_blank" rel="noreferrer" className="upload-zone mt-3"><ExternalLink size={22} /><span>Open your preview</span><small>Opens in a new tab</small></a>
        {error && <p role="alert" className="form-note text-destructive">{error}</p>}
        <div className="mt-4 flex items-center justify-between gap-2"><Button variant="quiet" onClick={reset} disabled={stage === "rendering"}><ArrowLeft /> Edit</Button><Button variant="minute" onClick={() => void renderMp4()} disabled={stage === "rendering"}>{stage === "rendering" ? <><Loader2 className="animate-spin" /> RENDERING…</> : <><Film /> RENDER VIDEO</>}</Button></div>
        <p className="form-note text-center">Rendering uses 3 credits, refunded if it fails.</p>
      </>}
    </DialogContent>
  </Dialog>;
}
