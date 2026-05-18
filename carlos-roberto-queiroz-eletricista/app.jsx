// app.jsx — WhatsApp-first local-business mobile site
// One strong visual, minimal copy, one primary action. The page lives inside an iOS frame.

const { useState, useEffect, useRef, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "cream",
  "language": "pt",
  "density": "spacious",
  "italicHero": true,
  "showStatusPill": true,
  "showRecado": false,
  "showLastVisits": false,
  "showFotoChip": false,
  "useQuickReplies": false
}/*EDITMODE-END*/;

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────
const PALETTES = {
  cream: {
    bg: '#F0EBE0', ink: '#1B1814', mute: 'rgba(27,24,20,0.52)',
    line: 'rgba(27,24,20,0.12)', accent: '#2C5F4A', sheet: '#FAF6EC',
    chip: 'rgba(27,24,20,0.05)', placeholderTone: '#DCD3C1',
    name: 'Cream',
  },
  bone: {
    bg: '#FAFAF6', ink: '#0F0E0C', mute: 'rgba(15,14,12,0.5)',
    line: 'rgba(15,14,12,0.10)', accent: '#B8472F', sheet: '#FFFFFF',
    chip: 'rgba(15,14,12,0.04)', placeholderTone: '#EDEAE0',
    name: 'Bone',
  },
  moody: {
    bg: '#141210', ink: '#F2EBDC', mute: 'rgba(242,235,220,0.55)',
    line: 'rgba(242,235,220,0.14)', accent: '#E2A45C', sheet: '#1F1B16',
    chip: 'rgba(242,235,220,0.06)', placeholderTone: '#2A251D',
    name: 'Moody',
  },
};

// ── Client data ────────────────────────────────────────────────────────────
// Each client lives at clients/<id>.json. To add a new one:
//   1) cp clients/_template.json clients/<id>.json and fill it in
//   2) add an entry to CLIENTS below
//   3) preview at ?c=<id>
const CLIENTS = [
  { id: 'carlos', label: 'Carlos R. Queiroz — Eletricista' },
];

function getClientId() {
  const u = new URLSearchParams(window.location.search);
  return u.get('c') || CLIENTS[0]?.id || 'carlos';
}

// Strip _-prefixed keys from the JSON (used as inline comments).
function stripComments(obj) {
  if (Array.isArray(obj)) return obj.map(stripComments);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) {
      if (k.startsWith('_')) continue;
      out[k] = stripComments(obj[k]);
    }
    return out;
  }
  return obj;
}

function useClient(id) {
  const [state, setState] = React.useState({ loading: true, client: null, error: null });
  React.useEffect(() => {
    setState({ loading: true, client: null, error: null });
    // Inline-data path: production builds embed the client JSON in the page so
    // a single HTML file is fully self-contained (no fetch, works offline).
    const inline = document.getElementById('client-data');
    if (inline) {
      try {
        const json = JSON.parse(inline.textContent);
        setState({ loading: false, client: stripComments(json), error: null });
        return;
      } catch (e) {
        setState({ loading: false, client: null, error: 'Inline client JSON is invalid: ' + e.message });
        return;
      }
    }
    fetch(`clients/${id}.json`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`Client "${id}" not found`)))
      .then(json => setState({ loading: false, client: stripComments(json), error: null }))
      .catch(err => setState({ loading: false, client: null, error: err.message || String(err) }));
  }, [id]);
  return state;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiny iconography (no brand logos — original generic glyphs)
// ─────────────────────────────────────────────────────────────────────────────
const ChatGlyph = ({ size = 18, color = 'currentColor', stroke = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 11.5a8 8 0 1 1 3.9 6.86L3.6 19.4 4.8 15.4A7.96 7.96 0 0 1 4 11.5Z"
      stroke={color} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);

const QrGlyph = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="5" height="5" rx="0.5" stroke={color} strokeWidth="1.4"/>
    <rect x="10" y="1" width="5" height="5" rx="0.5" stroke={color} strokeWidth="1.4"/>
    <rect x="1" y="10" width="5" height="5" rx="0.5" stroke={color} strokeWidth="1.4"/>
    <rect x="3" y="3" width="1" height="1" fill={color}/>
    <rect x="12" y="3" width="1" height="1" fill={color}/>
    <rect x="3" y="12" width="1" height="1" fill={color}/>
    <rect x="9" y="9" width="2" height="2" fill={color}/>
    <rect x="13" y="9" width="2" height="2" fill={color}/>
    <rect x="9" y="13" width="2" height="2" fill={color}/>
    <rect x="12" y="11" width="1" height="1" fill={color}/>
    <rect x="11" y="14" width="1" height="1" fill={color}/>
    <rect x="14" y="14" width="1" height="1" fill={color}/>
  </svg>
);

const CameraGlyph = ({ size = 18, color = 'currentColor', stroke = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 8.5h3.2L9 6h6l1.8 2.5H20a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5Z"
      stroke={color} strokeWidth={stroke} strokeLinejoin="round"/>
    <circle cx="12" cy="13.5" r="3.4" stroke={color} strokeWidth={stroke}/>
  </svg>
);

// Generated, fake-but-plausible QR — corner finders + deterministic body.
function QrPattern({ size = 168, fg = '#000', bg = '#fff' }) {
  const N = 25;
  const cell = size / N;
  const rects = [];
  const inFinder = (x, y) => {
    const reg = (cx, cy) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
    return reg(0, 0) || reg(N - 7, 0) || reg(0, N - 7);
  };
  // Deterministic pseudo-random pattern
  const cellOn = (x, y) => {
    const v = ((x * 73856093) ^ (y * 19349663) ^ ((x + 1) * (y + 1) * 83492791)) >>> 0;
    return (v % 5) < 2;
  };
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inFinder(x, y)) continue;
      if (cellOn(x, y)) {
        rects.push(<rect key={x + '-' + y} x={x * cell} y={y * cell} width={cell + 0.4} height={cell + 0.4} fill={fg}/>);
      }
    }
  }
  // Finder patterns (3 of them)
  const finder = (cx, cy, k) => {
    const r = [];
    // outer
    r.push(<rect key={k+'o'} x={cx*cell} y={cy*cell} width={7*cell} height={cell} fill={fg}/>);
    r.push(<rect key={k+'os'} x={cx*cell} y={(cy+6)*cell} width={7*cell} height={cell} fill={fg}/>);
    r.push(<rect key={k+'ol'} x={cx*cell} y={cy*cell} width={cell} height={7*cell} fill={fg}/>);
    r.push(<rect key={k+'or'} x={(cx+6)*cell} y={cy*cell} width={cell} height={7*cell} fill={fg}/>);
    // inner 3x3
    r.push(<rect key={k+'i'} x={(cx+2)*cell} y={(cy+2)*cell} width={3*cell} height={3*cell} fill={fg}/>);
    return r;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', background: bg, borderRadius: 6 }}>
      {rects}
      {finder(0, 0, 'a')}
      {finder(N - 7, 0, 'b')}
      {finder(0, N - 7, 'c')}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// The actual local-business page
// ─────────────────────────────────────────────────────────────────────────────
// Mini audio-recado mock — fake play button with waveform + transcript.
function AudioRecado({ copy, palette }) {
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const totalSec = React.useMemo(() => {
    const m = (copy.recadoDuration || '0:15').match(/(\d+):(\d+)/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : 15;
  }, [copy.recadoDuration]);

  React.useEffect(() => {
    if (!playing) return;
    const start = performance.now() - progress * totalSec * 1000;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / (totalSec * 1000));
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setPlaying(false); setTimeout(() => setProgress(0), 1800); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, totalSec]);

  const N = 28;
  const bars = React.useMemo(() => Array.from({ length: N }, (_, i) => {
    const v = (Math.sin(i * 0.92) + Math.sin(i * 0.27) * 0.6 + Math.sin(i * 1.71) * 0.4 + 2) / 4;
    return 0.28 + v * 0.72;
  }), []);
  const elapsed = Math.floor(progress * totalSec);
  const ts = `0:${String(elapsed).padStart(2,'0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        onClick={() => setPlaying(p => !p)}
        style={{
          appearance: 'none', border: `0.5px solid ${palette.line}`,
          background: palette.chip, color: palette.ink,
          height: 38, padding: '0 14px 0 4px', borderRadius: 999,
          display: 'inline-flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', alignSelf: 'flex-start',
        }}
        aria-label={copy.recadoLabel}
      >
        <span style={{
          width: 30, height: 30, borderRadius: 999,
          background: palette.accent, color: palette.bg,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {playing ? (
            <svg width="10" height="12" viewBox="0 0 10 12"><rect x="0" y="0" width="3.2" height="12" rx="0.8" fill="currentColor"/><rect x="6.8" y="0" width="3.2" height="12" rx="0.8" fill="currentColor"/></svg>
          ) : (
            <svg width="10" height="12" viewBox="0 0 10 12"><path d="M1.5 1 L9 6 L1.5 11 Z" fill="currentColor"/></svg>
          )}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: 18 }}>
          {bars.map((h, i) => {
            const lit = (i / N) <= progress;
            return <span key={i} style={{
              width: 2, height: `${h * 18}px`, borderRadius: 1,
              background: lit ? palette.ink : palette.mute,
              opacity: lit ? 1 : 0.45,
              transition: 'background 0.18s, opacity 0.18s',
            }}/>;
          })}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, letterSpacing: '0.14em',
          color: palette.mute, marginLeft: 2,
          minWidth: 28, textAlign: 'right',
        }}>{playing ? ts : copy.recadoDuration}</span>
      </button>
      {(playing || progress > 0) && copy.recadoTranscript && (
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic',
          fontSize: 14.5, lineHeight: 1.35,
          color: palette.mute,
          paddingLeft: 4, maxWidth: '92%',
          opacity: playing ? 1 : 0.7,
          transition: 'opacity 0.4s ease',
        }}>
          “{copy.recadoTranscript}”
        </div>
      )}
    </div>
  );
}

// Rotating última visita ticker.
function LastVisitsTicker({ items, palette, intervalMs = 4500 }) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (!items || items.length < 2) return;
    const t = setInterval(() => setI(x => (x + 1) % items.length), intervalMs);
    return () => clearInterval(t);
  }, [items, intervalMs]);
  const current = items && items[i];
  if (!current) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      paddingTop: 10, borderTop: `0.5px solid ${palette.line}`,
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: palette.mute, overflow: 'hidden',
    }}>
      <span style={{
        flexShrink: 0,
        width: 6, height: 6, borderRadius: 999,
        background: palette.accent,
        boxShadow: `0 0 0 3px ${palette.accent}22`,
        animation: 'lvpulse 2s ease-in-out infinite',
      }}/>
      <span key={i} style={{
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        animation: 'lvfade 0.5s ease',
      }}>{current}</span>
    </div>
  );
}

// Service carousel — cross-fades between services with auto-advance + swipe.
// Each slide owns an image-slot keyed by service slug so dropped images persist
// per-service. In production deploy, image-slot falls back to a tinted placeholder.
function ServiceCarousel({ services, presetKey, palette, placeholder, preset, autoMs = 5000 }) {
  const [i, setI] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const dragX = React.useRef(null);
  const containerRef = React.useRef(null);
  const N = services.length;

  React.useEffect(() => {
    if (paused || N < 2) return;
    const t = setInterval(() => setI(x => (x + 1) % N), autoMs);
    return () => clearInterval(t);
  }, [paused, N, autoMs]);

  const go = (delta) => setI(x => (x + delta + N) % N);

  const onPointerDown = (e) => {
    dragX.current = { x: e.clientX, t: performance.now() };
    setPaused(true);
  };
  const onPointerUp = (e) => {
    if (!dragX.current) return;
    const dx = e.clientX - dragX.current.x;
    const dt = performance.now() - dragX.current.t;
    dragX.current = null;
    if (Math.abs(dx) > 40 && dt < 700) go(dx < 0 ? 1 : -1);
    setTimeout(() => setPaused(false), 1500);
  };
  const onPointerCancel = () => { dragX.current = null; setPaused(false); };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'absolute', inset: 0,
        overflow: 'hidden', touchAction: 'pan-y',
        cursor: N > 1 ? 'grab' : 'default',
      }}
    >
      {/* Stack of slides, cross-faded */}
      {services.map((svc, idx) => {
        const active = idx === i;
        const serviceSrc =
          (preset?.serviceImages && (preset.serviceImages[svc.slug] || preset.serviceImages[String(idx)])) || '';
        return (
          <div key={svc.slug || idx} style={{
            position: 'absolute', inset: 0,
            opacity: active ? 1 : 0,
            transition: 'opacity 0.7s ease',
            pointerEvents: active ? 'auto' : 'none',
          }}>
            <image-slot
              id={`hero-${presetKey}-${svc.slug || idx}`}
              shape="rounded"
              radius="2"
              src={serviceSrc}
              placeholder={`${svc.label.toLowerCase()} — ${placeholder || 'vertical'}`}
              style={{
                position: 'absolute', inset: 0,
                display: 'block', width: '100%', height: '100%',
                background: palette.placeholderTone,
              }}
            ></image-slot>
          </div>
        );
      })}

      {/* Bottom gradient for caption legibility */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: '52%',
        background: 'linear-gradient(180deg, rgba(8,6,3,0) 0%, rgba(8,6,3,0.55) 70%, rgba(8,6,3,0.78) 100%)',
        pointerEvents: 'none',
      }}/>

      {/* Caption — index, label, italic title */}
      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 14,
        color: '#fff',
        display: 'flex', flexDirection: 'column', gap: 6,
        pointerEvents: 'none',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.78)',
        }}>
          <span>{String(i+1).padStart(2,'0')} / {String(N).padStart(2,'0')}</span>
          <span style={{ opacity: 0.45 }}>—</span>
          <span>{services[i].label}</span>
        </div>
        <div key={`title-${i}`} style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic', fontWeight: 400,
          fontSize: 22, lineHeight: 1.1,
          letterSpacing: '-0.01em',
          color: '#fff',
          animation: 'svcfade 0.5s ease',
        }}>{services[i].title}</div>
        {services[i].caption && (
          <div key={`cap-${i}`} style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: 12.5, lineHeight: 1.4,
            color: 'rgba(255,255,255,0.78)',
            maxWidth: '90%',
            animation: 'svcfade 0.5s ease 0.05s both',
          }}>{services[i].caption}</div>
        )}
      </div>

      {/* Dots — top-right, light on dark image */}
      {N > 1 && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'flex', gap: 5,
        }}>
          {services.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setI(idx); setPaused(true); setTimeout(()=>setPaused(false),3000); }}
              aria-label={`Slide ${idx+1}`}
              style={{
                appearance: 'none', border: 'none', padding: 0,
                width: idx === i ? 18 : 6, height: 6,
                borderRadius: 999,
                background: idx === i ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                transition: 'width 0.3s ease, background 0.3s',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Page({ t, palette, copy, presetKey, placeholder, preset }) {
  const [sheet, setSheet] = useState(null); // null | 'whatsapp' | 'pix' | 'photo'
  const [copied, setCopied] = useState(false);
  const spacious = t.density === 'spacious';

  const onCopy = () => {
    try { navigator.clipboard && navigator.clipboard.writeText(copy.pixKey); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const openWhatsApp = () => {
    if (t.useQuickReplies && copy.quickReplies && copy.quickReplies.length > 0) {
      setSheet('whatsapp');
      return;
    }
    const phone = (preset.phone || '').replace(/\D/g, '');
    const text = preset.waText
      ? decodeURIComponent(preset.waText)
      : (copy.photoMsg || '');
    const href = phone
      ? `https://wa.me/${phone}${text ? '?text=' + encodeURIComponent(text) : ''}`
      : 'https://wa.me/';
    window.open(href, '_blank', 'noopener');
  };

  const callNow = () => {
    if (preset.phone) window.location.href = 'tel:' + preset.phone.replace(/\s/g,'');
  };

  const padX = spacious ? 28 : 22;

  return (
    <div style={{
      position: 'relative',
      width: '100%', height: 874, maxHeight: '100%',
      background: palette.bg, color: palette.ink,
      display: 'grid',
      gridTemplateRows: 'auto auto minmax(0, 1fr) auto auto',
      paddingTop: 50, // clear the dynamic island
      paddingBottom: 28, // clear the home indicator
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Top bar — portrait + wordmark + status */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${spacious ? 12 : 8}px ${padX}px ${spacious ? 14 : 10}px`,
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 999, flexShrink: 0,
            background: palette.placeholderTone,
            border: `0.5px solid ${palette.line}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', position: 'relative',
          }}>
            {preset.portrait ? (
              <img src={preset.portrait} alt={copy.name}
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            ) : (
              <span style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic', fontWeight: 400,
                fontSize: 19, color: palette.accent,
                lineHeight: 1, paddingTop: 1,
              }}>{preset.monogram || copy.name?.[0] || 'C'}.</span>
            )}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: palette.ink, fontWeight: 500, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{copy.name}</div>
        </div>
        {t.showStatusPill && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '4px 10px 4px 8px', borderRadius: 999,
            background: palette.chip,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 9.5, letterSpacing: '0.10em', textTransform: 'uppercase',
            color: palette.mute, whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 999,
              background: palette.accent, boxShadow: `0 0 0 3px ${palette.accent}22`,
            }}/>
            {copy.status}
          </div>
        )}
      </div>

      {/* Hero — the single strong idea */}
      <div style={{
        padding: `${spacious ? 22 : 14}px ${padX}px ${spacious ? 18 : 12}px`,
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', 'Cormorant Garamond', Georgia, serif",
          fontStyle: t.italicHero ? 'italic' : 'normal',
          fontWeight: 400,
          fontSize: spacious ? 46 : 40,
          lineHeight: 1.02,
          letterSpacing: '-0.018em',
          color: palette.ink,
        }}>
          {copy.heroLines.map((ln, i) => (
            <div key={i} style={{
              whiteSpace: 'nowrap',
              marginLeft: i === 1 ? (spacious ? 16 : 12) : 0,
            }}>{ln}</div>
          ))}
        </div>
        <div style={{
          marginTop: spacious ? 14 : 10,
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 15,
          color: palette.mute,
        }}>
          <span style={{
            width: 22, height: 1, background: palette.line, display: 'inline-block',
          }}/>
          {copy.subhead}
        </div>
        {copy.trades && (
          <div style={{
            marginTop: spacious ? 12 : 8,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: palette.ink,
          }}>{copy.trades}</div>
        )}
        {copy.serviceArea && (
          <div style={{
            marginTop: 6,
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: 13.5, lineHeight: 1.35,
            color: palette.mute,
            maxWidth: '92%',
          }}>{copy.serviceArea}</div>
        )}
        {t.showRecado && copy.recadoTranscript && (
          <div style={{ marginTop: spacious ? 16 : 12 }}>
            <AudioRecado copy={copy} palette={palette}/>
          </div>
        )}
      </div>

      {/* Image area — carousel if services array exists, single image otherwise */}
      <div style={{
        flex: '1 1 0%',
        minHeight: 0,
        position: 'relative',
        margin: `0 ${padX}px ${spacious ? 12 : 8}px`,
        overflow: 'hidden',
        borderRadius: 2,
      }}>
        {copy.services && copy.services.length > 0 ? (
          <ServiceCarousel
            services={copy.services}
            presetKey={presetKey}
            palette={palette}
            placeholder={placeholder}
            preset={preset}
          />
        ) : (
          <React.Fragment>
            <image-slot
              id={`hero-${presetKey}`}
              shape="rounded"
              radius="2"
              placeholder={placeholder || 'editorial image'}
              style={{
                position: 'absolute', inset: 0,
                display: 'block', width: '100%', height: '100%',
                background: palette.placeholderTone,
              }}
            ></image-slot>
            <div style={{
              position: 'absolute', right: 8, bottom: 8,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.85)',
              padding: '4px 7px', borderRadius: 4,
              background: 'rgba(15,12,8,0.32)',
              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
              pointerEvents: 'none', whiteSpace: 'nowrap',
            }}>
              <span>01</span>
              <span style={{opacity:0.6}}>—</span>
              <span>{(placeholder || 'image').split(' —')[0]}</span>
            </div>
          </React.Fragment>
        )}
      </div>

      {/* Footer meta — pure type */}
      <div style={{
        padding: `0 ${padX}px ${spacious ? 14 : 10}px`,
        display: 'flex', flexDirection: 'column', gap: 10,
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: palette.mute,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <div style={{ lineHeight: 1.6, whiteSpace: 'nowrap' }}>
            <div style={{ color: palette.ink }}>{copy.address}</div>
            <div>{copy.city}</div>
          </div>
          <div style={{ textAlign: 'right', lineHeight: 1.6, whiteSpace: 'nowrap' }}>
            {copy.yearsActive && <div style={{ color: palette.ink }}>{copy.yearsActive}</div>}
            {copy.crea && <div>{copy.crea}</div>}
            {!copy.yearsActive && !copy.crea && <div>{copy.hours}</div>}
          </div>
        </div>
        {t.showLastVisits !== false && copy.lastVisits && copy.lastVisits.length > 0 ? (
          <LastVisitsTicker items={copy.lastVisits} palette={palette}/>
        ) : copy.lastVisit && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            paddingTop: 10, borderTop: `0.5px solid ${palette.line}`,
            fontSize: 9.5, letterSpacing: '0.14em',
            color: palette.mute, overflow: 'hidden',
          }}>
            <span style={{
              flexShrink: 0,
              width: 6, height: 6, borderRadius: 999,
              background: palette.accent,
              boxShadow: `0 0 0 3px ${palette.accent}22`,
              animation: 'lvpulse 2s ease-in-out infinite',
            }}/>
            <span style={{
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{copy.lastVisit}</span>
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div style={{
        padding: `12px ${padX}px ${spacious ? 6 : 4}px`,
        display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8,
        background: `linear-gradient(180deg, ${palette.bg}00 0%, ${palette.bg} 28%)`,
        position: 'relative', zIndex: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={openWhatsApp}
            style={{
              flex: 1, height: 56, borderRadius: 999, border: 'none',
              background: palette.accent, color: palette.bg,
              fontFamily: "'Geist', sans-serif", fontSize: 16, fontWeight: 500,
              letterSpacing: '-0.005em',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              cursor: 'pointer',
              boxShadow: `0 12px 30px ${palette.accent}3a, 0 1px 0 rgba(255,255,255,0.18) inset`,
              transition: 'transform 0.12s ease, box-shadow 0.2s ease',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.985)'}
            onMouseUp={e => e.currentTarget.style.transform = ''}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            <ChatGlyph size={19} color={palette.bg} stroke={1.7}/>
            <span>{copy.primary}</span>
          </button>
          {t.showFotoChip && (
            <button
              onClick={() => setSheet('photo')}
              aria-label="Foto"
              style={{
                width: 56, height: 56, borderRadius: 999, border: `0.5px solid ${palette.line}`,
                background: palette.chip, color: palette.ink,
                display: 'inline-flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 1,
                cursor: 'pointer',
              }}
            >
              <CameraGlyph size={19} color={palette.ink} stroke={1.6}/>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 8, letterSpacing: '0.18em', color: palette.mute,
              }}>FOTO</span>
            </button>
          )}
        </div>
        {preset.phone && (
          <button
            onClick={callNow}
            style={{
              appearance: 'none', background: 'transparent', border: 'none',
              color: palette.mute, padding: '4px 0 0',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            {(copy.callAction || 'ou ligar')} · {preset.phone.replace(/^\+55/, '')}
          </button>
        )}
        {copy.responseTime && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            color: palette.mute,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: 999,
              background: palette.accent,
              boxShadow: `0 0 0 2px ${palette.accent}22`,
              animation: 'lvpulse 2s ease-in-out infinite',
            }}/>
            {copy.responseTime}
          </div>
        )}
      </div>

      {/* Bottom sheets */}
      <Sheet open={sheet !== null} onClose={() => setSheet(null)} palette={palette}>
        {sheet === 'whatsapp' && (
          <WhatsAppSheet copy={copy} palette={palette} preset={preset} onClose={() => setSheet(null)}/>
        )}
        {sheet === 'photo' && (
          <PhotoSheet copy={copy} palette={palette} preset={preset} onClose={() => setSheet(null)}/>
        )}
        {sheet === 'pix' && (
          <PixSheet copy={copy} palette={palette} onCopy={onCopy} copied={copied} onClose={() => setSheet(null)}/>
        )}
      </Sheet>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom sheet shell
// ─────────────────────────────────────────────────────────────────────────────
function Sheet({ open, onClose, palette, children }) {
  return (
    <React.Fragment>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(8,6,3,0.42)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 31,
        transform: open ? 'translateY(0)' : 'translateY(105%)',
        transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        background: palette.sheet,
        borderTopLeftRadius: 26, borderTopRightRadius: 26,
        boxShadow: '0 -18px 50px rgba(0,0,0,0.18)',
        paddingBottom: 36, // home-indicator clearance
        color: palette.ink,
      }}>
        <div style={{
          padding: '10px 0 6px', display: 'flex', justifyContent: 'center',
        }}>
          <div style={{ width: 38, height: 4, borderRadius: 4, background: palette.line }}/>
        </div>
        {children}
      </div>
    </React.Fragment>
  );
}

function WhatsAppSheet({ copy, palette, preset, onClose }) {
  const [selected, setSelected] = useState(0);
  const openChat = () => {
    const phone = (preset.phone || '').replace(/\D/g, '');
    const q = copy.quickReplies[selected] || '';
    const text = preset.waText
      ? decodeURIComponent(preset.waText) + ' (' + q + ')'
      : q;
    const href = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(href, '_blank', 'noopener');
    onClose();
  };
  const callNow = () => {
    if (preset.phone) window.location.href = 'tel:' + preset.phone.replace(/\s/g,'');
  };
  return (
    <div style={{ padding: '8px 26px 16px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 18,
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic', fontSize: 26, lineHeight: 1,
          color: palette.ink,
        }}>{copy.sheetTitle}</div>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: palette.mute, cursor: 'pointer', padding: 0,
        }}>{copy.backLabel}</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        {copy.quickReplies.map((q, i) => {
          const active = selected === i;
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                appearance: 'none',
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 14,
                border: `0.5px solid ${active ? palette.ink : palette.line}`,
                background: active ? palette.ink : 'transparent',
                color: active ? palette.bg : palette.ink,
                fontFamily: "'Geist', sans-serif",
                fontSize: 15, fontWeight: 400,
                letterSpacing: '-0.005em',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
              }}
            >
              <span>{q}</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, opacity: active ? 0.7 : 0.45,
              }}>{String(i+1).padStart(2,'0')}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={openChat}
        style={{
          width: '100%', height: 54, borderRadius: 999, border: 'none',
          background: palette.accent, color: palette.bg,
          fontFamily: "'Geist', sans-serif", fontSize: 16, fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer',
          boxShadow: `0 10px 24px ${palette.accent}33`,
        }}
      >
        <ChatGlyph size={18} color={palette.bg}/>
        <span>{copy.open}</span>
      </button>

      {preset.phone && copy.callAction && (
        <button
          onClick={callNow}
          style={{
            marginTop: 12,
            width: '100%', height: 40,
            background: 'transparent', border: 'none',
            color: palette.mute,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {copy.callAction} · {preset.phone.replace(/^\+55/, '')}
        </button>
      )}
    </div>
  );
}

function PhotoSheet({ copy, palette, preset, onClose }) {
  const openPhotoChat = () => {
    const phone = (preset.phone || '').replace(/\D/g, '');
    const text = copy.photoMsg || 'Olá, segue foto do problema:';
    const href = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(href, '_blank', 'noopener');
    onClose();
  };
  return (
    <div style={{ padding: '6px 26px 16px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic', fontSize: 26, lineHeight: 1.05,
          color: palette.ink, maxWidth: '78%',
        }}>{copy.photoTitle}</div>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: palette.mute, cursor: 'pointer', padding: 0,
        }}>{copy.backLabel}</button>
      </div>

      <div style={{
        fontFamily: "'Geist', sans-serif",
        fontSize: 14.5, lineHeight: 1.45,
        color: palette.mute,
        marginBottom: 18,
      }}>{copy.photoBody}</div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 22,
        borderTop: `0.5px solid ${palette.line}`,
      }}>
        {(copy.photoSteps || []).map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 0',
            borderBottom: `0.5px solid ${palette.line}`,
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '0.14em',
              color: palette.mute, width: 18, flexShrink: 0,
            }}>{String(i+1).padStart(2,'0')}</span>
            <span style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: 15, color: palette.ink, letterSpacing: '-0.005em',
            }}>{s}</span>
          </div>
        ))}
      </div>

      <button
        onClick={openPhotoChat}
        style={{
          width: '100%', height: 54, borderRadius: 999, border: 'none',
          background: palette.accent, color: palette.bg,
          fontFamily: "'Geist', sans-serif", fontSize: 15.5, fontWeight: 500,
          letterSpacing: '-0.005em',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer',
          boxShadow: `0 10px 24px ${palette.accent}33`,
        }}
      >
        <CameraGlyph size={18} color={palette.bg} stroke={1.6}/>
        <span>{copy.photoCTA}</span>
      </button>
    </div>
  );
}

function PixSheet({ copy, palette, onCopy, copied, onClose }) {
  return (
    <div style={{ padding: '6px 26px 16px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 18,
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: 'italic', fontSize: 26, lineHeight: 1,
          color: palette.ink,
        }}>{copy.pixTitle}</div>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: palette.mute, cursor: 'pointer', padding: 0,
        }}>{copy.backLabel}</button>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        padding: '20px 0 22px',
      }}>
        <div style={{
          padding: 14, background: '#fff', borderRadius: 10,
          boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
          border: `0.5px solid ${palette.line}`,
        }}>
          <QrPattern size={172} fg="#0E0E0C" bg="#fff" />
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: palette.mute,
        }}>{copy.pixSub}</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 15, color: palette.ink, letterSpacing: '0.02em',
        }}>{copy.pixKey}</div>
      </div>

      <button
        onClick={onCopy}
        style={{
          width: '100%', height: 54, borderRadius: 999,
          border: `0.5px solid ${palette.line}`,
          background: copied ? palette.ink : 'transparent',
          color: copied ? palette.bg : palette.ink,
          fontFamily: "'Geist', sans-serif", fontSize: 15, fontWeight: 500,
          letterSpacing: '-0.005em',
          cursor: 'pointer',
          transition: 'background 0.18s, color 0.18s',
        }}
      >
        {copied ? copy.pixCopied : copy.pixCopy}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage scaling — phone fits viewport
// ─────────────────────────────────────────────────────────────────────────────
function useStageScale(deviceW, deviceH) {
  const [scale, setScale] = useState(1);
  const [bare, setBare] = useState(false);
  useEffect(() => {
    const calc = () => {
      const isPhone = window.innerWidth < 500;
      setBare(isPhone);
      if (isPhone) { setScale(1); return; }
      const padW = 80, padH = 60;
      const w = window.innerWidth - padW;
      const h = window.innerHeight - padH;
      const s = Math.min(w / deviceW, h / deviceH, 1.05);
      setScale(s);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [deviceW, deviceH]);
  return { scale, bare };
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const palette = PALETTES[t.palette] || PALETTES.cream;
  const clientId = React.useMemo(() => getClientId(), []);
  const { loading, client, error } = useClient(clientId);

  const copy = client && (client[t.language] || client.pt);
  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  return (
    <React.Fragment>
      <div style={{ width: '100vw', minHeight: '100vh', position: 'relative', overflow: 'hidden', background: palette.bg }}>
        {loading || !client ? (
          <LoadingScreen palette={palette} error={error} clientId={clientId}/>
        ) : (
          <Page t={t} palette={palette} copy={copy} presetKey={clientId}
                placeholder={client.placeholder} preset={client}/>
        )}
      </div>
    </React.Fragment>
  );
}

function LoadingScreen({ palette, error, clientId }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: palette.bg, color: palette.ink,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 14, padding: 40, textAlign: 'center',
    }}>
      {error ? (
        <React.Fragment>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: palette.mute,
          }}>404 · CLIENT NOT FOUND</div>
          <div style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
            fontSize: 22, lineHeight: 1.15, color: palette.ink,
          }}>“{clientId}”</div>
          <div style={{
            fontFamily: "'Geist', sans-serif", fontSize: 13,
            color: palette.mute, maxWidth: 260,
          }}>Add <code style={{fontFamily:"'JetBrains Mono',monospace"}}>clients/{clientId}.json</code> or pick a client in Tweaks.</div>
        </React.Fragment>
      ) : (
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: palette.mute,
        }}>CARREGANDO…</div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
