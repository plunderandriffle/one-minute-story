import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Play, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MinutePhone } from "@/components/minute-phone";
import { CreateMinute } from "@/components/create-minute";
import { minutes, SEGMENT_DURATION } from "@/lib/minutes";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({ meta: [
    { title: "One Minute — Your story. One minute." },
    { name: "description", content: "Turn a voice, an idea, or a business into the beginning of your story. Discover Founder, Creator, Business and Personal Minutes." },
    { property: "og:title", content: "One Minute — Your story. One minute." },
    { property: "og:description", content: "One minute. Entirely you. Explore short founder and creator stories and start your first minute." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
});

function Wordmark() { return <a href="#" className="wordmark" aria-label="One Minute home"><Clock3 className="brand-mark" strokeWidth={2.2} />one minute<span className="text-primary">.</span></a>; }

function Index() {
  const [active, setActive] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const clock = useRef(0);
  useEffect(() => {
    if (!playing || createOpen) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      if (!document.hidden) {
        clock.current += Math.min(now - last, 250);
        if (clock.current >= SEGMENT_DURATION) { clock.current = 0; setActive(value => (value + 1) % minutes.length); }
        setElapsed(clock.current);
      }
      last = now;
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, createOpen]);
  function selectSample(index: number) { setActive(index); clock.current = 0; setElapsed(0); setPlaying(true); document.getElementById("demo")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" }); }
  return <>
    <header className="site-header"><Wordmark /><nav className="header-nav"><a className="header-link" href="#examples">The possibilities</a><Button variant="minute" className="header-cta" onClick={() => setCreateOpen(true)}>Make a minute <ArrowRight /></Button></nav></header>
    <main>
      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-dot" /> SMALL FORMAT. BIG FEELING.</div>
        <h1>YOUR STORY.<br /><span>ONE MINUTE.</span></h1>
        <p className="hero-subtitle">A voice, an idea, a spark. Turn it into something worth watching.</p>
        <MinutePhone active={active} elapsed={elapsed} playing={playing} onToggle={() => setPlaying(value => !value)} />
        <div className="sample-selector" aria-label="Demo samples">{minutes.map((minute, i) => <Button key={minute.category} variant="ghost" className="sample-dot" data-active={i === active} aria-label={`Show ${minute.category}`} aria-pressed={i === active} onClick={() => selectSample(i)} />)}</div>
        <div className="hero-actions"><Button variant="minute" onClick={() => setCreateOpen(true)}>MAKE MY FIRST MINUTE <ArrowRight /></Button><Button variant="quiet" onClick={() => selectSample(0)}><Play size={13} /> WATCH THE DEMO</Button></div>
        <p className="microcopy">Your story, not a production. Just you, in one minute.</p>
      </section>
      <section className="examples-section" id="examples">
        <div className="section-heading"><h2>One minute. Many possibilities.</h2><p>Different stories. The same feeling.</p></div>
        <div className="examples-grid">{minutes.map((minute, i) => <Button variant="example" key={minute.category} onClick={() => selectSample(i)} aria-label={`Watch ${minute.category}`}>
          <div className="example-image-wrap"><img src={minute.image} alt={`${minute.name}'s ${minute.category.toLowerCase()} sample`} width={768} height={1152} loading="lazy" className="example-image" /><span className="example-duration">01:00</span><span className="example-play"><Play fill="currentColor" /></span></div>
          <span className="example-title">{minute.category}<ArrowRight /></span><p className="example-description">{minute.description}</p>
        </Button>)}</div>
      </section>
      <section className="bottom-invitation"><h2>You already have a story.</h2><p>Let’s give it a minute.</p><Button variant="minute" onClick={() => setCreateOpen(true)}>MAKE MY FIRST MINUTE <ArrowRight /></Button></section>
    </main>
    <footer className="site-footer"><Wordmark /><p>A little time. Something real.</p></footer>
    <CreateMinute open={createOpen} onOpenChange={setCreateOpen} />
  </>;
}
