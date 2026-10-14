import { Pause, Play, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { minutes, CAPTION_DURATION, SEGMENT_DURATION } from "@/lib/minutes";

export function MinutePhone({ active, elapsed, playing, onToggle }: { active: number; elapsed: number; playing: boolean; onToggle: () => void }) {
  const minute = minutes[active] ?? minutes[0];
  if (!minute) return null;
  const caption = minute.captions[Math.min(Math.floor(elapsed / CAPTION_DURATION), minute.captions.length - 1)];
  return <div className="phone-stage" id="demo">
    <div className="orbit" /><div className="orbit orbit-second" />
    <div className="stage-note stage-note-left"><div className="note-icon">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div><p>A little of your voice.</p><span>A lot of your story.</span></div>
    <div className="phone" aria-label={`${minute.category} sample`}>
      <div className="phone-screen">
        {minutes.map((item, i) => <img key={item.name} src={item.image} alt={item.name} width={768} height={1152} loading={i === 0 ? "eager" : "lazy"} className={`phone-image ${active === i ? "is-current" : ""}`} />)}
        <div className="phone-shade" /><div className="dynamic-island" />
        <div className="phone-topline"><span><Clock3 size={10} /> one minute</span><span>01:00</span></div>
        <span className="phone-label">{minute.label}</span>
        <p className="phone-caption" key={`${active}-${caption}`}>{caption}</p>
        <div className="phone-person"><strong>{minute.name}</strong><span>{minute.role}</span></div>
        <div className="phone-controls"><Button variant="media" onClick={onToggle} aria-label={playing ? "Pause demo" : "Play demo"} title={playing ? "Pause demo" : "Play demo"}>{playing ? <Pause /> : <Play />}</Button></div>
        <progress className="segment-progress" value={elapsed} max={SEGMENT_DURATION} aria-label="Sample progress" />
        <div className="home-indicator" />
      </div>
    </div>
    <div className="stage-note stage-note-right"><Clock3 size={20} className="text-primary" /><p>One minute.</p><span>Entirely you.</span></div>
    <span className="demo-tag"><span className="eyebrow-dot" /> SAMPLE MINUTE</span>
  </div>;
}