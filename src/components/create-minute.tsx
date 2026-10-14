import { useState, useRef } from "react";
import { Mic, Lightbulb, Link2, Upload, ArrowRight, ArrowLeft, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type Mode = "voice" | "idea" | "url";
const options = [{ id: "voice" as const, title: "Voice note", icon: Mic }, { id: "idea" as const, title: "An idea", icon: Lightbulb }, { id: "url" as const, title: "Business URL", icon: Link2 }];

export function CreateMinute({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [mode, setMode] = useState<Mode>("idea");
  const [idea, setIdea] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  function submit() {
    setError("");
    if (mode === "idea") {
      if (!idea.trim()) { setError("Add a little of your story first."); return; }
      setDraft(idea.trim());
    } else if (mode === "url") {
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid URL");
        setDraft(`Your business minute\n\n${parsed.hostname}\n\nThe beginning — Why you started.\nThe heart — What makes your business different.\nThe invitation — What comes next.\n\nSource: ${parsed.href}`);
      } catch { setError("Enter a full website address, like https://yourbusiness.com."); }
    } else {
      if (!file) { setError("Choose a voice note first."); return; }
      setDraft(`Your voice-note minute\n\n${file.name}\n\nThe beginning — The idea that started it.\nThe heart — The part that matters most.\nThe invitation — What you want to share next.`);
    }
  }
  function download() {
    if (!draft) return;
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(new Blob([draft], { type: "text/plain" }));
    link.href = objectUrl; link.download = "my-first-minute.txt"; link.click(); URL.revokeObjectURL(objectUrl);
  }
  return <Dialog open={open} onOpenChange={value => { onOpenChange(value); if (!value) setDraft(null); }}>
    <DialogContent className="create-dialog">
      <span className="eyebrow"><span className="eyebrow-dot" /> YOUR FIRST MINUTE</span>
      <DialogTitle className="create-title">{draft ? "Your story starts here." : "Start with something you."}</DialogTitle>
      <DialogDescription>{draft ? "Your first draft. Ready to make your own." : "A voice. A thought. A business. Pick your starting point."}</DialogDescription>
      {draft ? <>
        <div className="draft-text">{draft}</div>
        <p className="form-note">Draft preview only. Audio transcription and video creation aren’t connected yet.</p>
        <div className="flex items-center justify-between gap-2"><Button variant="quiet" onClick={() => setDraft(null)}><ArrowLeft /> Edit</Button><Button variant="minute" onClick={download}><Download /> SAVE MY DRAFT</Button></div>
      </> : <>
        <div className="create-tabs" role="tablist" aria-label="Starting point">{options.map(option => <Button role="tab" aria-selected={mode === option.id} key={option.id} variant="quiet" className="create-tab" data-active={mode === option.id} onClick={() => { setMode(option.id); setError(""); }}><option.icon />{option.title}</Button>)}</div>
        <form onSubmit={event => { event.preventDefault(); submit(); }}>
          {mode === "idea" && <><label className="create-label" htmlFor="idea">What’s your story?</label><textarea id="idea" className="create-input" rows={5} placeholder="It all started when…" value={idea} onChange={e => setIdea(e.target.value)} maxLength={3000} /></>}
          {mode === "url" && <><label className="create-label" htmlFor="business-url">Your business website</label><input id="business-url" className="create-input" type="url" placeholder="https://yourbusiness.com" value={url} onChange={e => setUrl(e.target.value)} /><p className="form-note">We’ll use this address in your draft outline. Website content isn’t imported.</p></>}
          {mode === "voice" && <><input ref={uploadRef} id="voice-upload" className="sr-only" type="file" accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm" onChange={e => { const next = e.target.files?.[0]; if (next) { if (next.size > 25 * 1024 * 1024) { setError("Choose a voice note smaller than 25 MB."); return; } setFile(next); setError(""); } }} /><label htmlFor="voice-upload" className="upload-zone">{file ? <Check size={25} /> : <Upload size={25} />}<span>{file ? file.name : "Upload your voice note"}</span><small>MP3, M4A, WAV · Up to 25 MB</small></label></>}
          {error && <p role="alert" className="form-note text-destructive">{error}</p>}
          <Button variant="minute" type="submit" className="mt-5 w-full">PREVIEW MY DRAFT <ArrowRight /></Button>
          <p className="form-note text-center">Just a first draft. No account needed.</p>
        </form>
      </>}
    </DialogContent>
  </Dialog>;
}