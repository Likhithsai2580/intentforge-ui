'use client';

import { useEffect, useRef, useState } from 'react';
import { EasterEgg } from '@/lib/easter_eggs';

interface Props { egg: EasterEgg; query: string; onDismiss: () => void; }

function useInterval(cb: () => void, ms: number | null) {
  const ref = useRef(cb);
  useEffect(() => { ref.current = cb; });
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function useAutoDismiss(ms: number, onDismiss: () => void) {
  useEffect(() => { const t = setTimeout(onDismiss, ms); return () => clearTimeout(t); }, [ms, onDismiss]);
}

function Shell({ children, onClose, title = 'INTENTFORGE_TERMINAL', accent = '#00ff9d' }: {
  children: React.ReactNode; onClose: () => void; title?: string; accent?: string;
}) {
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,12,15,0.93)', backdropFilter: 'blur(10px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl border font-mono overflow-hidden"
        style={{ borderColor: accent, boxShadow: `0 0 40px ${accent}33, 0 0 80px ${accent}11, inset 0 0 40px ${accent}05` }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)`, animation: 'egg-border-breathe 2s ease-in-out infinite' }} />
        <div className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{ background: '#0a0c0f', borderColor: '#1a3a2a' }}>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {['#ff3b3b','#ffb300', accent].map((c, i) => (
                <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
              ))}
            </div>
            <span className="text-[10px] tracking-widest uppercase" style={{ color: '#4a7c6a' }}>{title}</span>
          </div>
          <button onClick={onClose} className="text-xs px-1 transition-colors" style={{ color: '#4a7c6a' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ff3b3b')}
            onMouseLeave={e => (e.currentTarget.style.color = '#4a7c6a')}>[×]</button>
        </div>
        <div style={{ background: '#0d1117' }}>{children}</div>
      </div>
    </div>
  );
}

/* ── sudo rm -rf /tracking ── */
const RM_FILES = [
  '/var/lib/tracking/cookies.db','/var/lib/tracking/fingerprints.bin',
  '/var/lib/tracking/pixel_events.log','/var/lib/tracking/ad_profiles/',
  '/var/lib/tracking/behavioral_data.json','/var/lib/tracking/retargeting_ids.cache',
  '/etc/tracking/config.yaml','/tmp/tracking_session_*',
];
function SudoRmEgg({ onDismiss }: { onDismiss: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [exploding, setExploding] = useState(false);
  const idx = useRef(0);
  useInterval(() => {
    if (idx.current < RM_FILES.length) { setLines(l => [...l, `removed '${RM_FILES[idx.current]}'`]); idx.current++; }
    else if (!done) { setDone(true); setTimeout(() => setExploding(true), 400); setTimeout(onDismiss, 3200); }
  }, done ? null : 280);
  return (
    <Shell onClose={onDismiss} title="root@oxiverse:~#" accent="#ff3b3b">
      <div className="p-5 space-y-1 text-xs min-h-[260px]">
        <p style={{ color: '#ff3b3b' }}>$ sudo rm -rf /tracking</p>
        <p style={{ color: '#4a7c6a' }}>[sudo] password: <span style={{ color: '#00ff9d' }}>••••••••</span></p>
        {lines.map((l, i) => (
          <p key={i} className="animate-fade-in" style={{ color: '#4a7c6a' }}>
            <span style={{ color: '#ff3b3b' }}>✗</span> {l}
          </p>
        ))}
        {done && !exploding && <p className="animate-fade-in" style={{ color: '#ffb300' }}>Calculating freed space...</p>}
        {exploding && (
          <div className="animate-fade-in space-y-1 pt-2 border-t" style={{ borderColor: '#1a3a2a' }}>
            <p style={{ color: '#00ff9d', textShadow: '0 0 10px #00ff9d' }}>✓ Deleted 847 MB of tracking data.</p>
            <p style={{ color: '#00ff9d' }}>✓ Freed: your soul.</p>
            <p style={{ color: '#4a7c6a' }}>// Nice try. We never had any. 😎</p>
          </div>
        )}
        {!done && <span className="cursor-blink" style={{ color: '#00ff9d' }}>█</span>}
      </div>
    </Shell>
  );
}

/* ── whoami ── */
const ID_FIELDS = [
  { label: 'USER', value: 'anonymous', color: '#00ff9d' },
  { label: 'IP', value: '[REDACTED]', color: '#4a7c6a' },
  { label: 'TRACKER', value: 'none', color: '#00ff9d' },
  { label: 'COOKIES', value: '0', color: '#00ff9d' },
  { label: 'FINGERPRINT', value: 'not collected', color: '#00ff9d' },
  { label: 'SOUL', value: 'intact ✓', color: '#00d4ff' },
  { label: 'STATUS', value: 'FREE', color: '#00ff9d' },
];
function WhoamiEgg({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  useAutoDismiss(7000, onDismiss);
  useInterval(() => setVisible(v => { if (v >= ID_FIELDS.length) { setScanDone(true); return v; } return v + 1; }), scanDone ? null : 320);
  return (
    <Shell onClose={onDismiss} title="IDENTITY_SCAN // OXIVERSE" accent="#00d4ff">
      <div className="p-6">
        <div className="flex gap-6 items-start">
          <div className="flex-shrink-0 w-20 h-24 border flex items-center justify-center relative overflow-hidden"
            style={{ borderColor: '#00d4ff', boxShadow: '0 0 20px #00d4ff33' }}>
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,0.1) 2px,rgba(0,212,255,0.1) 4px)' }} />
            <span className="text-3xl">👤</span>
          </div>
          <div className="flex-1 space-y-2">
            {ID_FIELDS.slice(0, visible).map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-xs animate-fade-in">
                <span className="w-24 text-[10px] tracking-widest uppercase" style={{ color: '#4a7c6a' }}>{f.label}</span>
                <span className="font-bold tracking-wide" style={{ color: f.color, textShadow: `0 0 8px ${f.color}66` }}>{f.value}</span>
              </div>
            ))}
            {!scanDone && <span className="cursor-blink text-xs" style={{ color: '#00d4ff' }}>█</span>}
          </div>
        </div>
        {scanDone && (
          <div className="mt-4 pt-4 border-t text-center animate-fade-in" style={{ borderColor: '#1a3a2a' }}>
            <p className="text-xs tracking-widest" style={{ color: '#00d4ff' }}>// you are nobody. that is the point.</p>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── matrix ── */
function MatrixEgg({ onDismiss }: { onDismiss: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [msg, setMsg] = useState('');
  const MESSAGE = 'FOLLOW THE WHITE RABBIT';
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 16);
    const drops = Array(cols).fill(1);
    const chars = 'アイウエオカキクケコサシスセソ01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const draw = () => {
      ctx.fillStyle = 'rgba(10,12,15,0.05)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      drops.forEach((y, i) => {
        ctx.fillStyle = i % 7 === 0 ? '#ffffff' : '#00ff9d';
        ctx.font = `${i % 3 === 0 ? 16 : 13}px monospace`;
        ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*16, y*16);
        if (Math.random() > 0.998) { ctx.fillStyle = '#ff3b3b'; ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*16, y*16); }
        if (drops[i]*16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const id = setInterval(draw, 40);
    let i = 0;
    const t1 = setTimeout(() => { const ti = setInterval(() => { setMsg(MESSAGE.slice(0,++i)); if (i>=MESSAGE.length) clearInterval(ti); }, 80); }, 1500);
    const t2 = setTimeout(onDismiss, 11000);
    return () => { clearInterval(id); clearTimeout(t1); clearTimeout(t2); };
  }, [onDismiss]);
  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-[9990] cursor-pointer" onClick={onDismiss} />
      {msg && (
        <div className="fixed inset-0 z-[9991] flex items-center justify-center pointer-events-none">
          <p className="font-mono text-2xl tracking-[0.3em] font-bold"
            style={{ color: '#00ff9d', textShadow: '0 0 20px #00ff9d, 0 0 60px #00ff9d66' }}>{msg}</p>
        </div>
      )}
      <p className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9991] text-[10px] font-mono tracking-widest animate-pulse"
        style={{ color: '#00ff9d' }}>click to exit</p>
    </>
  );
}

/* ── tor on ── */
const RELAYS = [
  { city: 'Mumbai', flag: '🇮🇳', ms: 12 }, { city: 'Frankfurt', flag: '🇩🇪', ms: 89 },
  { city: 'Reykjavik', flag: '🇮🇸', ms: 134 }, { city: 'Sao Paulo', flag: '🇧🇷', ms: 201 },
  { city: 'Tokyo', flag: '🇯🇵', ms: 267 }, { city: 'EXIT NODE', flag: '🌐', ms: 312 },
];
function TorOnEgg({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  useAutoDismiss(8000, onDismiss);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => { setStep(i); i++; if (i >= RELAYS.length) { clearInterval(id); setTimeout(() => setDone(true), 400); } }, 600);
    return () => clearInterval(id);
  }, []);
  return (
    <Shell onClose={onDismiss} title="TOR_CIRCUIT // ESTABLISHING" accent="#7b2fff">
      <div className="p-5 space-y-3">
        <p className="text-[10px] tracking-widest uppercase" style={{ color: '#4a7c6a' }}>Building circuit through {RELAYS.length} relays...</p>
        <div className="space-y-2">
          {RELAYS.map((r, i) => (
            <div key={i} className={`flex items-center gap-3 text-xs transition-all duration-300 ${i <= step ? 'opacity-100' : 'opacity-20'}`}>
              <span>{r.flag}</span>
              <div className="flex-1 h-px" style={{ background: i <= step ? '#7b2fff' : '#1a3a2a', boxShadow: i <= step ? '0 0 6px #7b2fff' : 'none', transition: 'all 0.4s' }} />
              <span style={{ color: i <= step ? '#7b2fff' : '#4a7c6a' }}>{r.city}</span>
              {i <= step && <span style={{ color: '#4a7c6a' }}>{r.ms}ms</span>}
              {i === step && i < RELAYS.length - 1 && <span className="cursor-blink" style={{ color: '#7b2fff' }}>●</span>}
              {i < step && <span style={{ color: '#00ff9d' }}>✓</span>}
            </div>
          ))}
        </div>
        {done && (
          <div className="pt-3 border-t animate-fade-in" style={{ borderColor: '#1a3a2a' }}>
            <p style={{ color: '#7b2fff', textShadow: '0 0 10px #7b2fff' }} className="text-sm font-bold tracking-widest">● CIRCUIT ESTABLISHED</p>
            <p className="text-xs mt-1" style={{ color: '#4a7c6a' }}>// already enabled server-side. You are welcome. 🕶️</p>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── decrypt oxiverse ── */
const DECRYPT_MSG = "Privacy is not a feature — it's the foundation.";
function DecryptEgg({ onDismiss }: { onDismiss: () => void }) {
  const [phase, setPhase] = useState<'binary'|'resolving'|'done'>('binary');
  const [binary, setBinary] = useState('');
  const [revealed, setRevealed] = useState('');
  useAutoDismiss(9000, onDismiss);
  useEffect(() => {
    let t = 0;
    const id = setInterval(() => { setBinary(Array.from({length:48},()=>Math.round(Math.random())).join(' ')); t += 80; if (t >= 2000) { clearInterval(id); setPhase('resolving'); } }, 80);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (phase !== 'resolving') return;
    let i = 0;
    const id = setInterval(() => { setRevealed(DECRYPT_MSG.slice(0, i+1)); i++; if (i >= DECRYPT_MSG.length) { clearInterval(id); setPhase('done'); } }, 45);
    return () => clearInterval(id);
  }, [phase]);
  return (
    <Shell onClose={onDismiss} title="DECRYPT // OXIVERSE" accent="#00d4ff">
      <div className="p-6 space-y-4 min-h-[200px]">
        <p className="text-[10px] tracking-widest uppercase" style={{ color: '#4a7c6a' }}>
          {phase === 'binary' ? 'Reading encrypted payload...' : phase === 'resolving' ? 'Decrypting...' : 'Decryption complete.'}
        </p>
        {phase === 'binary' && <p className="font-mono text-xs leading-relaxed break-all" style={{ color: '#00d4ff', opacity: 0.6 }}>{binary}</p>}
        {(phase === 'resolving' || phase === 'done') && (
          <div className="space-y-3">
            <p className="text-xs leading-relaxed break-all" style={{ color: '#00d4ff', opacity: 0.3 }}>01001111 01011000 01001001 01010110 01000101 01010010 01010011 01000101</p>
            <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,#00d4ff,transparent)' }} />
            <p className="text-lg font-bold tracking-wide" style={{ color: '#00d4ff', textShadow: '0 0 20px #00d4ff' }}>
              &ldquo;{revealed}<span className="cursor-blink">█</span>&rdquo;
            </p>
          </div>
        )}
        {phase === 'done' && <p className="text-[10px] animate-fade-in" style={{ color: '#4a7c6a' }}>— Oxiverse Core Manifesto, line 1</p>}
      </div>
    </Shell>
  );
}

/* ── cargo build --release ── */
const CARGO_LINES = [
  { text: '   Compiling oxiverse-core v0.1.0', color: '#4a7c6a', delay: 0 },
  { text: '   Compiling intentforge v2.0.0', color: '#4a7c6a', delay: 180 },
  { text: '   Compiling ravana-agi v0.9.1', color: '#4a7c6a', delay: 360 },
  { text: '   Compiling grace-framework v1.0.0', color: '#4a7c6a', delay: 520 },
  { text: '   Compiling privacy-engine v∞', color: '#4a7c6a', delay: 680 },
  { text: '    Finished release [optimized] target(s) in 0.0ms', color: '#00ff9d', delay: 900 },
  { text: '     Running `./target/release/oxiverse`', color: '#00d4ff', delay: 1100 },
  { text: '⚡  Already optimized. Running on Rust.', color: '#ffb300', delay: 1400 },
];
function CargoBuildEgg({ onDismiss }: { onDismiss: () => void }) {
  const [shown, setShown] = useState(0);
  const [progress, setProgress] = useState(0);
  useAutoDismiss(7000, onDismiss);
  useEffect(() => {
    CARGO_LINES.forEach((l, i) => setTimeout(() => setShown(i + 1), l.delay));
    const id = setInterval(() => setProgress(p => Math.min(p + 3, 100)), 25);
    return () => clearInterval(id);
  }, []);
  return (
    <Shell onClose={onDismiss} title="cargo build --release" accent="#ffb300">
      <div className="p-5 space-y-3">
        <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: '#1a3a2a' }}>
          <div className="h-full transition-all duration-100" style={{ width: `${progress}%`, background: '#ffb300', boxShadow: '0 0 8px #ffb300' }} />
        </div>
        <div className="space-y-1">
          {CARGO_LINES.slice(0, shown).map((l, i) => (
            <p key={i} className="text-xs font-mono animate-fade-in" style={{ color: l.color }}>{l.text}</p>
          ))}
        </div>
        {shown < CARGO_LINES.length && <span className="cursor-blink text-xs" style={{ color: '#ffb300' }}>█</span>}
      </div>
    </Shell>
  );
}

/* ── async await ── */
function BorrowCheckerEgg({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  useAutoDismiss(8000, onDismiss);
  useEffect(() => { const id = setInterval(() => setStep(s => Math.min(s+1, 4)), 900); return () => clearInterval(id); }, []);
  const Box = ({ label, owner, valid, active }: { label: string; owner: string; valid: boolean; active: boolean }) => (
    <div className={`border p-3 text-xs transition-all duration-500 ${active ? 'opacity-100' : 'opacity-30'}`}
      style={{ borderColor: valid ? '#00ff9d' : '#ff3b3b', boxShadow: active ? `0 0 12px ${valid ? '#00ff9d' : '#ff3b3b'}44` : 'none' }}>
      <p style={{ color: '#4a7c6a' }} className="text-[10px] uppercase tracking-widest">{label}</p>
      <p style={{ color: valid ? '#00ff9d' : '#ff3b3b' }} className="font-bold mt-1">{owner}</p>
    </div>
  );
  return (
    <Shell onClose={onDismiss} title="BORROW_CHECKER // ANALYSIS" accent="#00ff9d">
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Box label="owner" owner="oxiverse" valid={true} active={step >= 1} />
          <Box label="borrow" owner="&user_data" valid={step < 3} active={step >= 2} />
          <Box label="lifetime" owner="'static" valid={true} active={step >= 3} />
        </div>
        <div className="space-y-1 text-xs">
          {step >= 1 && <p className="animate-fade-in" style={{ color: '#4a7c6a' }}>checking ownership rules...</p>}
          {step >= 2 && <p className="animate-fade-in" style={{ color: '#4a7c6a' }}>validating borrow scopes...</p>}
          {step >= 3 && <p className="animate-fade-in" style={{ color: '#4a7c6a' }}>verifying lifetimes...</p>}
          {step >= 4 && <p className="animate-fade-in font-bold" style={{ color: '#00ff9d', textShadow: '0 0 10px #00ff9d' }}>✓ All references valid. No dangling pointers in this universe.</p>}
        </div>
      </div>
    </Shell>
  );
}

/* ── ravana activate ── */
const RAVANA_ART = [
  '  ██████╗  █████╗ ██╗   ██╗ █████╗ ███╗   ██╗ █████╗',
  '  ██╔══██╗██╔══██╗██║   ██║██╔══██╗████╗  ██║██╔══██╗',
  '  ██████╔╝███████║██║   ██║███████║██╔██╗ ██║███████║',
  '  ██╔══██╗██╔══██║╚██╗ ██╔╝██╔══██║██║╚██╗██║██╔══██║',
  '  ██║  ██║██║  ██║ ╚████╔╝ ██║  ██║██║ ╚████║██║  ██║',
  '  ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝',
];
function RavanaEgg({ onDismiss }: { onDismiss: () => void }) {
  const [lines, setLines] = useState(0);
  const [quote, setQuote] = useState(false);
  useAutoDismiss(9000, onDismiss);
  useEffect(() => {
    const id = setInterval(() => setLines(l => Math.min(l + 1, RAVANA_ART.length)), 180);
    setTimeout(() => setQuote(true), RAVANA_ART.length * 180 + 400);
    return () => clearInterval(id);
  }, []);
  return (
    <Shell onClose={onDismiss} title="RAVANA_AGI // BOOT SEQUENCE" accent="#00ff9d">
      <div className="p-5 space-y-3">
        <pre className="text-[10px] leading-tight overflow-x-auto" style={{ color: '#00ff9d', textShadow: '0 0 8px #00ff9d, 0 0 20px #00ff9d44' }}>
          {RAVANA_ART.slice(0, lines).join('\n')}
          {lines < RAVANA_ART.length && <span className="cursor-blink">█</span>}
        </pre>
        {quote && (
          <div className="border-t pt-3 animate-fade-in space-y-1" style={{ borderColor: '#1a3a2a' }}>
            <p className="text-sm italic" style={{ color: '#00d4ff' }}>I am not a search engine. I am an intent engine.</p>
            <p className="text-[10px]" style={{ color: '#4a7c6a' }}>— RAVANA AGI, Oxiverse Core</p>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── asura protocol ── */
function AsuraEgg({ onDismiss }: { onDismiss: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('INITIALIZING...');
  useAutoDismiss(7000, onDismiss);
  useEffect(() => {
    ['LOADING MODULES...','ETHICS CHECK...','ALIGNMENT: PASSED','AGENTIC SYSTEM ONLINE'].forEach((m, i) => setTimeout(() => setStatus(m), 800 + i * 700));
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const S = 160; canvas.width = S; canvas.height = S;
    const cx = S/2, cy = S/2, r = 70; let angle = 0;
    const draw = () => {
      ctx.clearRect(0,0,S,S);
      [0.3,0.6,1].forEach(f => { ctx.beginPath(); ctx.arc(cx,cy,r*f,0,Math.PI*2); ctx.strokeStyle='#1a3a2a'; ctx.lineWidth=1; ctx.stroke(); });
      ctx.strokeStyle='#1a3a2a'; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(cx-r,cy); ctx.lineTo(cx+r,cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,cy-r); ctx.lineTo(cx,cy+r); ctx.stroke();
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(angle);
      const sw = ctx.createLinearGradient(0,0,r,0);
      sw.addColorStop(0,'rgba(0,255,157,0.5)'); sw.addColorStop(1,'rgba(0,255,157,0)');
      ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,r,-0.4,0); ctx.closePath(); ctx.fillStyle=sw; ctx.fill();
      ctx.restore();
      [[0.4,0.3],[0.7,-0.5],[-0.3,0.6]].forEach(([fx,fy]) => {
        const bx=cx+fx*r, by=cy+fy*r;
        ctx.beginPath(); ctx.arc(bx,by,2,0,Math.PI*2); ctx.fillStyle='#00ff9d'; ctx.shadowColor='#00ff9d'; ctx.shadowBlur=6; ctx.fill();
      });
      angle += 0.04;
    };
    const id = setInterval(draw, 30); return () => clearInterval(id);
  }, []);
  return (
    <Shell onClose={onDismiss} title="ASURA_PROTOCOL // ACTIVATING" accent="#00ff9d">
      <div className="p-5 flex items-center gap-6">
        <canvas ref={canvasRef} className="flex-shrink-0" />
        <div className="space-y-3">
          <p className="text-xs tracking-widest animate-pulse" style={{ color: '#00ff9d' }}>{status}</p>
          <p className="text-sm font-bold" style={{ color: '#00ff9d', textShadow: '0 0 10px #00ff9d' }}>Awaiting your command, Architect.</p>
          <p className="text-[10px]" style={{ color: '#4a7c6a' }}>3 agents online // 0 threats detected</p>
        </div>
      </div>
    </Shell>
  );
}

/* ── oxiverse origin ── */
function OxiverseOriginEgg({ onDismiss }: { onDismiss: () => void }) {
  useAutoDismiss(12000, onDismiss);
  return (
    <div className="fixed inset-0 z-[9990] flex items-end justify-center overflow-hidden font-mono cursor-pointer"
      style={{ background: '#0a0c0f', perspective: '400px' }} onClick={onDismiss}>
      <style>{`@keyframes egg-crawl{from{transform:rotateX(25deg) translateY(100vh)}to{transform:rotateX(25deg) translateY(-200%)}}`}</style>
      <div className="w-full max-w-lg text-center pb-8" style={{ transformOrigin:'bottom center', animation:'egg-crawl 10s linear forwards' }}>
        <p className="text-xs tracking-widest mb-8" style={{ color: '#ffb300' }}>A LONG TIME AGO, ON A WEB FAR, FAR AWAY...</p>
        <p className="text-2xl font-bold tracking-widest mb-6" style={{ color: '#00ff9d', textShadow: '0 0 20px #00ff9d' }}>OXIVERSE</p>
        <p className="text-sm leading-loose" style={{ color: '#4a7c6a' }}>
          Built by one dev, one vision.<br/>A web where intent matters more than keywords.<br/><br/>
          No ads. No tracking. No compromise.<br/><br/>
          <span style={{ color: '#00ff9d' }}>Oxi</span> = oxidize the old web.<br/>
          <span style={{ color: '#00d4ff' }}>Verse</span> = build a new one.<br/><br/>
          The search engine the internet deserves.<br/><br/>
          <span style={{ color: '#7b2fff' }}>— @itxLikhith</span>
        </p>
      </div>
    </div>
  );
}

/* ── grace framework ── */
const GRACE_CHECKS = [
  { label: 'Ethics module', status: 'ACTIVE', color: '#00ff9d' },
  { label: 'Bias detection', status: 'RUNNING', color: '#00d4ff' },
  { label: 'Alignment score', status: '99.7%', color: '#00ff9d' },
  { label: 'Human oversight', status: 'ENABLED', color: '#00ff9d' },
  { label: 'Harm prevention', status: 'LOCKED', color: '#ffb300' },
  { label: 'Transparency layer', status: 'OPEN', color: '#00ff9d' },
];
function GraceEgg({ onDismiss }: { onDismiss: () => void }) {
  const [done, setDone] = useState(0);
  useAutoDismiss(8000, onDismiss);
  useInterval(() => setDone(d => Math.min(d + 1, GRACE_CHECKS.length)), done >= GRACE_CHECKS.length ? null : 500);
  return (
    <Shell onClose={onDismiss} title="GRACE_FRAMEWORK // ALIGNMENT CHECK" accent="#00ff9d">
      <div className="p-5 space-y-3">
        {GRACE_CHECKS.map((c, i) => (
          <div key={i} className={`flex items-center gap-3 text-xs transition-all duration-500 ${i < done ? 'opacity-100' : 'opacity-20'}`}>
            <div className="w-4 h-4 border flex items-center justify-center flex-shrink-0" style={{ borderColor: i < done ? c.color : '#1a3a2a' }}>
              {i < done && <span style={{ color: c.color, fontSize: 10 }}>✓</span>}
            </div>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#1a3a2a' }}>
              <div className="h-full transition-all duration-700" style={{ width: i < done ? '100%' : '0%', background: c.color, boxShadow: `0 0 6px ${c.color}`, transitionDelay: `${i * 100}ms` }} />
            </div>
            <span style={{ color: i < done ? c.color : '#4a7c6a' }}>{c.label}</span>
            <span className="text-[10px]" style={{ color: i < done ? c.color : '#1a3a2a' }}>{c.status}</span>
          </div>
        ))}
        {done >= GRACE_CHECKS.length && <p className="text-sm font-bold animate-fade-in pt-2" style={{ color: '#00ff9d', textShadow: '0 0 10px #00ff9d' }}>RAVANA is human-aligned.</p>}
      </div>
    </Shell>
  );
}

/* ── intent --deep ── */
function IntentDeepEgg({ onDismiss }: { onDismiss: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [curiosity, setCuriosity] = useState(0);
  const [mischief, setMischief] = useState(0);
  const [verdict, setVerdict] = useState(false);
  useAutoDismiss(7000, onDismiss);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const S = 120; canvas.width = S; canvas.height = S;
    let angle = -Math.PI/2, progress = 0;
    const draw = () => {
      ctx.clearRect(0,0,S,S);
      ctx.beginPath(); ctx.arc(S/2,S/2,50,0,Math.PI*2); ctx.strokeStyle='#1a3a2a'; ctx.lineWidth=8; ctx.stroke();
      ctx.beginPath(); ctx.arc(S/2,S/2,50,angle,angle+progress*Math.PI*2); ctx.strokeStyle='#00ff9d'; ctx.lineWidth=8; ctx.shadowColor='#00ff9d'; ctx.shadowBlur=10; ctx.stroke();
      progress = Math.min(progress+0.008,1); angle -= 0.04;
    };
    const id = setInterval(draw, 20);
    const countUp = (setter: (v:number)=>void, target:number, delay:number) => setTimeout(() => { let v=0; const ci=setInterval(()=>{ v=Math.min(v+2,target); setter(v); if(v>=target) clearInterval(ci); },30); }, delay);
    countUp(setCuriosity, 94, 500); countUp(setMischief, 6, 800);
    setTimeout(() => setVerdict(true), 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <Shell onClose={onDismiss} title="INTENT_ANALYZER // DEEP SCAN" accent="#00ff9d">
      <div className="p-5 flex items-center gap-6">
        <canvas ref={canvasRef} className="flex-shrink-0" />
        <div className="space-y-3 flex-1">
          {[{label:'curiosity',val:curiosity,color:'#00ff9d'},{label:'mischief',val:mischief,color:'#ffb300'}].map(s => (
            <div key={s.label}>
              <div className="flex justify-between mb-1 text-xs"><span style={{color:'#4a7c6a'}}>{s.label}</span><span style={{color:s.color}}>{s.val}%</span></div>
              <div className="h-1 rounded-full overflow-hidden" style={{background:'#1a3a2a'}}>
                <div className="h-full transition-all duration-100" style={{width:`${s.val}%`,background:s.color,boxShadow:`0 0 6px ${s.color}`}} />
              </div>
            </div>
          ))}
          {verdict && (
            <div className="animate-fade-in space-y-1 pt-2 border-t" style={{borderColor:'#1a3a2a'}}>
              <p className="text-[10px]" style={{color:'#4a7c6a'}}>threat level: <span style={{color:'#00ff9d'}}>adorable</span></p>
              <p className="text-xs font-bold" style={{color:'#00ff9d'}}>verdict: you are one of us.</p>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
const GREP_RESULTS = [
  { file: 'src/app/privacy/page.tsx', line: 1, match: 'We collect nothing.' },
  { file: 'src/app/privacy/page.tsx', line: 2, match: 'We store nothing.' },
  { file: 'src/app/privacy/page.tsx', line: 3, match: 'We sell nothing.' },
  { file: 'src/lib/api.ts', line: 1, match: '// no analytics calls here' },
  { file: 'src/app/api/proxy/route.ts', line: 1, match: '// no logging middleware' },
  { file: 'README.md', line: 42, match: 'Privacy-first by design.' },
];
function GrepPrivacyEgg({ onDismiss }: { onDismiss: () => void }) {
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  useAutoDismiss(8000, onDismiss);
  useInterval(() => setShown(s => { if (s >= GREP_RESULTS.length) { setDone(true); return s; } return s + 1; }), done ? null : 350);
  return (
    <Shell onClose={onDismiss} title='grep -r "privacy" .' accent="#00ff9d">
      <div className="p-5 space-y-1">
        {GREP_RESULTS.slice(0, shown).map((r, i) => (
          <p key={i} className="text-xs font-mono animate-fade-in">
            <span style={{ color: '#7b2fff' }}>{r.file}</span>
            <span style={{ color: '#4a7c6a' }}>:{r.line}:</span>
            <span style={{ color: '#00ff9d' }}> {r.match}</span>
          </p>
        ))}
        {!done && <span className="cursor-blink text-xs" style={{ color: '#00ff9d' }}>█</span>}
        {done && <p className="text-xs pt-2 border-t animate-fade-in" style={{ borderColor: '#1a3a2a', color: '#4a7c6a' }}>{GREP_RESULTS.length} matches. That is the whole policy.</p>}
      </div>
    </Shell>
  );
}
const FUTURES = [
  { name: 'fetch_intent()', ms: 12, color: '#00ff9d' },
  { name: 'rank_results()', ms: 89, color: '#00d4ff' },
  { name: 'filter_spam()', ms: 134, color: '#7b2fff' },
  { name: 'score_relevance()', ms: 201, color: '#ffb300' },
  { name: 'render_ui()', ms: 4039, color: '#00ff9d' },
];
function AsyncAwaitEgg({ onDismiss }: { onDismiss: () => void }) {
  const [resolved, setResolved] = useState<number[]>([]);
  useAutoDismiss(8000, onDismiss);
  useEffect(() => { FUTURES.forEach((_, i) => setTimeout(() => setResolved(r => [...r, i]), 300 + i * 500)); }, []);
  return (
    <Shell onClose={onDismiss} title="ASYNC_RUNTIME // POLLING" accent="#00d4ff">
      <div className="p-5 space-y-3">
        <p className="text-[10px] tracking-widest uppercase" style={{ color: '#4a7c6a' }}>awaiting futures...</p>
        {FUTURES.map((f, i) => {
          const done = resolved.includes(i);
          return (
            <div key={i} className="flex items-center gap-3 text-xs">
              <div className="w-3 h-3 rounded-full flex-shrink-0 transition-all duration-500"
                style={{ background: done ? f.color : '#1a3a2a', boxShadow: done ? `0 0 10px ${f.color}` : 'none' }} />
              <span className="flex-1" style={{ color: done ? f.color : '#4a7c6a' }}>{f.name}</span>
              <span style={{ color: '#4a7c6a' }}>{done ? `${f.ms}ms ✓` : '...'}</span>
            </div>
          );
        })}
        {resolved.length === FUTURES.length && (
          <p className="animate-fade-in text-sm font-bold pt-2" style={{ color: '#00d4ff', textShadow: '0 0 10px #00d4ff' }}>
            Intent resolved in 4039ms. Futures: bright.
          </p>
        )}
      </div>
    </Shell>
  );
}

/* ── segfault ── */
function SegfaultEgg({ onDismiss }: { onDismiss: () => void }) {
  const [phase, setPhase] = useState<'crash'|'reboot'|'ok'>('crash');
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reboot'), 2500);
    const t2 = setTimeout(() => setPhase('ok'), 4200);
    const t3 = setTimeout(onDismiss, 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDismiss]);
  if (phase === 'crash') return (
    <div className="fixed inset-0 z-[9990] flex flex-col items-center justify-center font-mono" style={{ background: '#001a0f' }}>
      <div className="text-center space-y-4 p-8 max-w-lg">
        <p className="text-7xl font-bold animate-flicker" style={{ color: '#00ff9d', textShadow: '0 0 40px #00ff9d' }}>:(</p>
        <p className="text-2xl font-bold tracking-widest" style={{ color: '#00ff9d' }}>SEGMENTATION FAULT</p>
        <p className="text-sm" style={{ color: '#4a7c6a' }}>Your PC ran into a problem it could not handle.</p>
        <p className="text-xs" style={{ color: '#4a7c6a' }}>Stop code: <span style={{ color: '#ff3b3b' }}>DANGLING_POINTER_DETECTED</span></p>
        <p className="text-xs animate-pulse mt-4" style={{ color: '#4a7c6a' }}>Collecting error info... 0%</p>
        <p className="text-xs" style={{ color: '#00ff9d' }}>// Rust says: Not today. 🛡️</p>
      </div>
    </div>
  );
  if (phase === 'reboot') return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center font-mono" style={{ background: '#0a0c0f' }}>
      <p className="text-xs tracking-widest animate-pulse" style={{ color: '#00ff9d' }}>REBOOTING UNIVERSE...</p>
    </div>
  );
  return (
    <Shell onClose={onDismiss} title="SYSTEM // RECOVERED" accent="#00ff9d">
      <div className="p-6 text-center space-y-3">
        <p className="text-4xl">🛡️</p>
        <p className="text-sm font-bold" style={{ color: '#00ff9d' }}>Memory safe. No crash. Rust wins.</p>
        <p className="text-xs" style={{ color: '#4a7c6a' }}>The borrow checker caught it before it happened.</p>
      </div>
    </Shell>
  );
}

/* ── coffee --refill ── */
function CoffeeEgg({ onDismiss }: { onDismiss: () => void }) {
  const [fill, setFill] = useState(0);
  const [steam, setSteam] = useState(false);
  useAutoDismiss(6000, onDismiss);
  useEffect(() => {
    const id = setInterval(() => setFill(f => { if (f >= 100) { setSteam(true); return f; } return f + 2; }), 40);
    return () => clearInterval(id);
  }, []);
  const bars = Math.floor(fill / 10);
  return (
    <Shell onClose={onDismiss} title="coffee --refill" accent="#ffb300">
      <div className="p-6 flex flex-col items-center gap-4">
        <div className="relative font-mono text-center">
          {steam && (
            <div className="flex justify-center gap-3 mb-1 h-6">
              {[0,1,2].map(i => (
                <span key={i} className="text-xs" style={{ color: '#4a7c6a', animation: `egg-particle-rise ${1.2 + i*0.3}s ease-out ${i*0.2}s infinite` }}>~</span>
              ))}
            </div>
          )}
          <div className="border-2 w-24 mx-auto relative overflow-hidden" style={{ borderColor: '#ffb300', height: 80 }}>
            <div className="absolute bottom-0 left-0 right-0 transition-all duration-100"
              style={{ height: `${fill}%`, background: 'linear-gradient(180deg,#ffb30066,#ffb300)', boxShadow: '0 0 10px #ffb30066' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">☕</span>
            </div>
          </div>
          <div className="absolute -right-3 top-6 w-4 h-6 border-r-2 border-t-2 border-b-2 rounded-r" style={{ borderColor: '#ffb300' }} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-mono" style={{ color: '#ffb300' }}>{'█'.repeat(bars)}{'░'.repeat(10 - bars)} {fill}%</p>
          {fill >= 100 && <p className="text-sm font-bold animate-fade-in" style={{ color: '#ffb300', textShadow: '0 0 10px #ffb300' }}>Caffeine level: 99%. Ship mode: ENGAGED. ⚡</p>}
        </div>
      </div>
    </Shell>
  );
}

/* bug report */
function BugReportEgg({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  useAutoDismiss(7000, onDismiss);
  useEffect(() => { const id = setInterval(() => setStep(s => Math.min(s+1,5)), 700); return () => clearInterval(id); }, []);
  const lines = [
    { label: 'title', val: 'Found a bug in the matrix', color: '#ff3b3b' },
    { label: 'repo', val: 'oxiverse-labs/intentforge', color: '#00d4ff' },
    { label: 'assignee', val: '@itxLikhith', color: '#00ff9d' },
    { label: 'bounty', val: 'eternal gratitude', color: '#ffb300' },
    { label: 'status', val: 'SUBMITTED', color: '#00ff9d' },
  ];
  return (
    <Shell onClose={onDismiss} title="github.com // new issue" accent="#ff3b3b">
      <div className="p-5 space-y-2">
        <p className="text-[10px] tracking-widest uppercase" style={{color:'#4a7c6a'}}>Auto-filling issue template...</p>
        {lines.slice(0,step).map((l,i) => (
          <div key={i} className="flex items-center gap-3 text-xs animate-fade-in">
            <span className="w-20 text-[10px] uppercase tracking-widest" style={{color:'#4a7c6a'}}>{l.label}</span>
            <span style={{color:l.color}}>{l.val}</span>
          </div>
        ))}
        {step >= 5 && <p className="text-sm font-bold animate-fade-in pt-2" style={{color:'#00ff9d',textShadow:'0 0 10px #00ff9d'}}>Issue #1337 opened. DM @itxLikhith. 🐛</p>}
        {step < 5 && <span className="cursor-blink text-xs" style={{color:'#ff3b3b'}}>█</span>}
      </div>
    </Shell>
  );
}

/* sleep 8h */
function SleepEgg({ onDismiss }: { onDismiss: () => void }) {
  const [phase, setPhase] = useState<'sleeping'|'error'>('sleeping');
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('error'), 2500);
    const t2 = setTimeout(onDismiss, 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDismiss]);
  if (phase === 'sleeping') return (
    <div className="fixed inset-0 z-[9990] flex flex-col items-center justify-center font-mono" style={{background:'rgba(10,12,15,0.97)'}}>
      <div className="text-center space-y-4">
        <p className="text-6xl animate-float">😴</p>
        <div className="flex gap-3 justify-center">
          {['Z','z','z'].map((z,i) => (
            <span key={i} className="font-mono font-bold" style={{color:'#4a7c6a',fontSize:`${20-i*4}px`,animation:`egg-particle-rise ${1.5+i*0.4}s ease-out ${i*0.3}s infinite`}}>{z}</span>
          ))}
        </div>
        <p className="text-xs tracking-widest" style={{color:'#4a7c6a'}}>sleep 8h... executing...</p>
      </div>
    </div>
  );
  return (
    <Shell onClose={onDismiss} title="PROCESS // TERMINATED" accent="#ff3b3b">
      <div className="p-6 text-center space-y-3">
        <p className="text-3xl">⚡</p>
        <p className="text-sm font-bold" style={{color:'#ff3b3b',textShadow:'0 0 10px #ff3b3b'}}>ERROR: Solo founder mode does not support this command.</p>
        <p className="text-xs" style={{color:'#4a7c6a'}}>Suggested alternative: coffee --refill</p>
      </div>
    </Shell>
  );
}

/* git push --force */
function GitPushForceEgg({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);
  useAutoDismiss(7000, onDismiss);
  useEffect(() => { const id = setInterval(() => setStep(s => Math.min(s+1,4)), 600); return () => clearInterval(id); }, []);
  const gitLines = [
    { text: 'Enumerating objects: 847, done.', color: '#4a7c6a' },
    { text: 'Counting objects: 100% (847/847), done.', color: '#4a7c6a' },
    { text: 'Writing objects: 100% (847/847), 2.3 MiB', color: '#4a7c6a' },
    { text: 'remote: error: PUSH REJECTED — main is protected.', color: '#ff3b3b' },
  ];
  return (
    <Shell onClose={onDismiss} title="git push --force" accent="#ff3b3b">
      <div className="p-5 space-y-2">
        {gitLines.slice(0,step).map((l,i) => (
          <p key={i} className="text-xs font-mono animate-fade-in" style={{color:l.color}}>{l.text}</p>
        ))}
        {step >= 4 && (
          <div className="mt-3 p-3 border animate-fade-in" style={{borderColor:'#ff3b3b',background:'#ff3b3b11'}}>
            <p className="text-sm font-bold" style={{color:'#ff3b3b'}}>🚫 BLOCKED</p>
            <p className="text-xs mt-1" style={{color:'#4a7c6a'}}>Whoa there. Main branch is protected. (But nice try.)</p>
          </div>
        )}
        {step < 4 && <span className="cursor-blink text-xs" style={{color:'#ff3b3b'}}>█</span>}
      </div>
    </Shell>
  );
}

/* ship it */
function ShipItEgg({ onDismiss }: { onDismiss: () => void }) {
  const [count, setCount] = useState(5);
  const [launched, setLaunched] = useState(false);
  const [rocketY, setRocketY] = useState(0);
  useAutoDismiss(8000, onDismiss);
  useEffect(() => {
    const id = setInterval(() => setCount(c => { if (c <= 0) { clearInterval(id); setLaunched(true); return c; } return c - 1; }), 700);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!launched) return;
    const id = setInterval(() => setRocketY(y => y + 4), 30);
    return () => clearInterval(id);
  }, [launched]);
  return (
    <Shell onClose={onDismiss} title="DEPLOY // OXIVERSE" accent="#00ff9d">
      <div className="p-6 text-center space-y-4 min-h-[200px] relative overflow-hidden">
        {!launched ? (
          <>
            <p className="text-[10px] tracking-widest uppercase" style={{color:'#4a7c6a'}}>Launch sequence initiated</p>
            <p className="text-6xl font-bold font-mono" style={{color:'#00ff9d',textShadow:'0 0 30px #00ff9d'}}>{count}</p>
            <p className="text-xs animate-pulse" style={{color:'#4a7c6a'}}>T-{count}s to deployment</p>
          </>
        ) : (
          <>
            <div className="text-4xl" style={{transform:`translateY(-${rocketY}px)`,transition:'transform 0.03s linear'}}>🚀</div>
            <p className="text-sm font-bold animate-fade-in" style={{color:'#00ff9d',textShadow:'0 0 10px #00ff9d'}}>Deployed. No rollback. Move fast and fix things.</p>
            <p className="text-xs" style={{color:'#4a7c6a'}}>v{new Date().getFullYear()}.{new Date().getMonth()+1}.{new Date().getDate()} — LIVE</p>
          </>
        )}
      </div>
    </Shell>
  );
}

/* search for search */
function SearchForSearchEgg({ onDismiss }: { onDismiss: () => void }) {
  const [depth, setDepth] = useState(0);
  useAutoDismiss(7000, onDismiss);
  useEffect(() => { const id = setInterval(() => setDepth(d => Math.min(d+1,4)), 800); return () => clearInterval(id); }, []);
  return (
    <Shell onClose={onDismiss} title="INCEPTION // LEVEL 1" accent="#00d4ff">
      <div className="p-6 flex flex-col items-center justify-center" style={{minHeight:220}}>
        <div className="relative flex items-center justify-center" style={{width:280,height:160}}>
          {Array.from({length:depth+1},(_,i) => {
            const s = 1 - i*0.18;
            return (
              <div key={i} className="absolute border flex items-center justify-center font-mono text-[10px] animate-fade-in"
                style={{width:`${s*100}%`,height:`${s*100}%`,borderColor:`rgba(0,212,255,${0.3+i*0.15})`,boxShadow:`0 0 ${8+i*4}px rgba(0,212,255,${0.1+i*0.1})`,color:'#00d4ff'}}>
                {i === depth ? 'search' : ''}
              </div>
            );
          })}
        </div>
        {depth >= 4 && <p className="text-xs mt-4 animate-fade-in" style={{color:'#00d4ff'}}>You found the search inside the search. Inception level: {depth}.</p>}
      </div>
    </Shell>
  );
}

/* fake review detector */
const REVIEWS = [
  { text: 'Amazing product!! 5 stars!! Buy now!!', fake: true },
  { text: 'Changed my life. 10/10 would recommend to everyone.', fake: true },
  { text: 'Decent, does what it says.', fake: false },
  { text: 'BEST PRODUCT EVER!!! WOW!!!', fake: true },
  { text: 'Works as expected, nothing special.', fake: false },
  { text: 'I was paid to write this review.', fake: true },
];
function FakeReviewEgg({ onDismiss }: { onDismiss: () => void }) {
  const [flagged, setFlagged] = useState(0);
  useAutoDismiss(8000, onDismiss);
  useEffect(() => { const id = setInterval(() => setFlagged(f => Math.min(f+1, REVIEWS.length)), 600); return () => clearInterval(id); }, []);
  return (
    <Shell onClose={onDismiss} title="FAKE_REVIEW_DETECTOR // SCANNING" accent="#ffb300">
      <div className="p-5 space-y-2">
        {REVIEWS.slice(0,flagged).map((r,i) => (
          <div key={i} className="flex items-start gap-3 text-xs animate-fade-in">
            <span style={{color:r.fake?'#ff3b3b':'#00ff9d',flexShrink:0}}>{r.fake?'🚩':'✓'}</span>
            <span style={{color:r.fake?'#ff3b3b66':'#4a7c6a',textDecoration:r.fake?'line-through':'none'}}>{r.text}</span>
            {r.fake && <span className="text-[10px] flex-shrink-0" style={{color:'#ff3b3b'}}>FLAGGED</span>}
          </div>
        ))}
        {flagged >= REVIEWS.length && <p className="text-xs pt-2 border-t animate-fade-in" style={{borderColor:'#1a3a2a',color:'#4a7c6a'}}>Module loaded. We do this IRL. 😉</p>}
      </div>
    </Shell>
  );
}

/* affiliate --disclose */
const RECEIPT_ITEMS = [
  { label: 'Affiliate links disclosed', val: 'YES', color: '#00ff9d' },
  { label: 'Hidden fees', val: 'NONE', color: '#00ff9d' },
  { label: 'Undisclosed sponsorships', val: '0', color: '#00ff9d' },
  { label: 'Dark patterns', val: 'NONE', color: '#00ff9d' },
  { label: 'Your data sold', val: 'NEVER', color: '#00ff9d' },
  { label: 'Wink included', val: 'YES 😉', color: '#ffb300' },
];
function AffiliateEgg({ onDismiss }: { onDismiss: () => void }) {
  const [printed, setPrinted] = useState(0);
  useAutoDismiss(7000, onDismiss);
  useEffect(() => { const id = setInterval(() => setPrinted(p => Math.min(p+1, RECEIPT_ITEMS.length)), 500); return () => clearInterval(id); }, []);
  return (
    <Shell onClose={onDismiss} title="TRANSPARENCY_REPORT // OXIVERSE" accent="#00ff9d">
      <div className="p-5 space-y-1">
        <p className="text-[10px] tracking-widest uppercase mb-3" style={{color:'#4a7c6a'}}>Printing receipt...</p>
        <div className="border-t border-dashed" style={{borderColor:'#1a3a2a'}} />
        {RECEIPT_ITEMS.slice(0,printed).map((item,i) => (
          <div key={i} className="flex justify-between text-xs animate-fade-in py-1">
            <span style={{color:'#4a7c6a'}}>{item.label}</span>
            <span style={{color:item.color}}>{item.val}</span>
          </div>
        ))}
        {printed >= RECEIPT_ITEMS.length && (
          <>
            <div className="border-t border-dashed" style={{borderColor:'#1a3a2a'}} />
            <p className="text-center text-xs animate-fade-in pt-1" style={{color:'#00ff9d'}}>TOTAL HONESTY: 100%</p>
          </>
        )}
      </div>
    </Shell>
  );
}

/* ultra hidden */
const SECRET_MSG = "Welcome to the inner circle. The web you deserve is being built. Stay curious.";
function UltraEgg({ onDismiss }: { onDismiss: () => void }) {
  const [phase, setPhase] = useState<'scanning'|'granted'>('scanning');
  const [msg, setMsg] = useState('');
  useAutoDismiss(10000, onDismiss);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('granted'), 2000);
    const t2 = setTimeout(() => {
      let i = 0;
      const id = setInterval(() => { setMsg(SECRET_MSG.slice(0,++i)); if (i>=SECRET_MSG.length) clearInterval(id); }, 40);
    }, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center font-mono" style={{background:'rgba(10,12,15,0.97)'}}>
      <div className="text-center space-y-6 p-8 max-w-lg">
        {phase === 'scanning' && (
          <>
            <div className="w-16 h-16 border-2 mx-auto animate-spin" style={{borderColor:'#00ff9d',borderTopColor:'transparent',borderRadius:'50%'}} />
            <p className="text-xs tracking-widest animate-pulse" style={{color:'#00ff9d'}}>VERIFYING INTENT...</p>
          </>
        )}
        {phase === 'granted' && (
          <>
            <p className="text-4xl" style={{animation:'egg-konami-title 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards'}}>🔐</p>
            <p className="text-xl font-bold tracking-widest" style={{color:'#00ff9d',textShadow:'0 0 30px #00ff9d'}}>ACCESS GRANTED</p>
            <p className="text-sm leading-relaxed" style={{color:'#4a7c6a'}}>{msg}<span className="cursor-blink" style={{color:'#00ff9d'}}>█</span></p>
            {msg.length >= SECRET_MSG.length && <p className="text-xs" style={{color:'#7b2fff'}}>— @itxLikhith</p>}
          </>
        )}
        <button onClick={onDismiss} className="text-[10px] tracking-widest" style={{color:'#4a7c6a'}}>[ dismiss ]</button>
      </div>
    </div>
  );
}

/* konami */
function KonamiEgg({ onDismiss }: { onDismiss: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [titleIn, setTitleIn] = useState(false);
  const [glitch, setGlitch] = useState('DEV MODE UNLOCKED');
  useEffect(() => {
    setTimeout(() => setTitleIn(true), 200);
    const orig = 'DEV MODE UNLOCKED', gc = '#@!%&*$?X';
    let n = 0;
    const gi = setInterval(() => {
      if (n > 12) { setGlitch(orig); clearInterval(gi); return; }
      const a = orig.split(''); a[Math.floor(Math.random()*a.length)] = gc[Math.floor(Math.random()*gc.length)];
      setGlitch(a.join('')); n++;
    }, 80);
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const COLORS = ['#00ff9d','#00d4ff','#7b2fff','#ffb300','#ff3b3b','#ffffff'];
    const burst = (cx: number, cy: number, count: number) => Array.from({length:count}, () => {
      const a = Math.random()*Math.PI*2, sp = Math.random()*14+4;
      return {x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-Math.random()*6,w:Math.random()*12+4,h:Math.random()*8+2,color:COLORS[Math.floor(Math.random()*COLORS.length)],rot:Math.random()*360,rotV:(Math.random()-0.5)*10,life:1,maxLife:0.6+Math.random()*0.4};
    });
    let particles = [...burst(canvas.width/2,canvas.height/2,80),...burst(canvas.width*0.25,canvas.height*0.4,40),...burst(canvas.width*0.75,canvas.height*0.4,40)];
    const bt = [
      setTimeout(()=>{particles.push(...burst(Math.random()*canvas.width,canvas.height*0.3,50));},400),
      setTimeout(()=>{particles.push(...burst(Math.random()*canvas.width,canvas.height*0.5,50));},800),
    ];
    let raf: number;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles = particles.filter(p=>p.life>0);
      particles.forEach(p => {
        ctx.save(); ctx.globalAlpha=p.life; ctx.translate(p.x+p.w/2,p.y+p.h/2); ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=8; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.35; p.vx*=0.99; p.rot+=p.rotV; p.life-=0.008/p.maxLife;
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const done = setTimeout(() => { cancelAnimationFrame(raf); onDismiss(); }, 6000);
    return () => { cancelAnimationFrame(raf); clearTimeout(done); bt.forEach(clearTimeout); clearInterval(gi); };
  }, [onDismiss]);
  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-[9990] pointer-events-none" />
      <div className="fixed inset-0 z-[9991] flex flex-col items-center justify-center pointer-events-none">
        {titleIn && (
          <div className="text-center" style={{animation:'egg-konami-title 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards'}}>
            <p className="font-mono text-[10px] tracking-widest mb-4 uppercase" style={{color:'#4a7c6a'}}>// konami sequence detected</p>
            <h1 className="font-mono text-4xl md:text-6xl font-bold tracking-widest" style={{color:'#00ff9d',textShadow:'0 0 20px #00ff9d, 0 0 60px rgba(0,255,157,0.5)'}}>{glitch}</h1>
            <p className="font-mono text-sm mt-4 tracking-widest" style={{color:'#00d4ff',opacity:0.8}}>🎉 you know the code. respect.</p>
          </div>
        )}
      </div>
    </>
  );
}

/* ROOT EXPORT */
export default function EasterEggOverlay({ egg, query: _query, onDismiss }: Props) {
  switch (egg.type) {
    case 'sudo-rm':           return <SudoRmEgg onDismiss={onDismiss} />;
    case 'whoami':            return <WhoamiEgg onDismiss={onDismiss} />;
    case 'matrix':            return <MatrixEgg onDismiss={onDismiss} />;
    case 'tor-on':            return <TorOnEgg onDismiss={onDismiss} />;
    case 'decrypt':           return <DecryptEgg onDismiss={onDismiss} />;
    case 'cargo-build':       return <CargoBuildEgg onDismiss={onDismiss} />;
    case 'borrow-checker':    return <BorrowCheckerEgg onDismiss={onDismiss} />;
    case 'async-await':       return <AsyncAwaitEgg onDismiss={onDismiss} />;
    case 'segfault':          return <SegfaultEgg onDismiss={onDismiss} />;
    case 'grep-privacy':      return <GrepPrivacyEgg onDismiss={onDismiss} />;
    case 'ravana':            return <RavanaEgg onDismiss={onDismiss} />;
    case 'asura':             return <AsuraEgg onDismiss={onDismiss} />;
    case 'oxiverse-origin':   return <OxiverseOriginEgg onDismiss={onDismiss} />;
    case 'grace':             return <GraceEgg onDismiss={onDismiss} />;
    case 'intent-deep':       return <IntentDeepEgg onDismiss={onDismiss} />;
    case 'coffee':            return <CoffeeEgg onDismiss={onDismiss} />;
    case 'bug-report':        return <BugReportEgg onDismiss={onDismiss} />;
    case 'sleep':             return <SleepEgg onDismiss={onDismiss} />;
    case 'git-push-force':    return <GitPushForceEgg onDismiss={onDismiss} />;
    case 'ship-it':           return <ShipItEgg onDismiss={onDismiss} />;
    case 'search-for-search': return <SearchForSearchEgg onDismiss={onDismiss} />;
    case 'fake-review':       return <FakeReviewEgg onDismiss={onDismiss} />;
    case 'affiliate':         return <AffiliateEgg onDismiss={onDismiss} />;
    case 'ultra':             return <UltraEgg onDismiss={onDismiss} />;
    case 'konami':            return <KonamiEgg onDismiss={onDismiss} />;
    default:                  return null;
  }
}
