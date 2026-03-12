'use client';

import { useState, useEffect, useRef, useCallback } from "react";

// Audio Engine with Limiter
function createAudioEngine() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Soft limiter (tanh waveshaper)
  const limiter = ctx.createWaveShaper();
  const curve = new Float32Array(2048);
  for (let i = 0; i < 2048; i++) {
    const x = (i * 2) / 2048 - 1;
    curve[i] = Math.tanh(x * 1.5) / 1.5;
  }
  limiter.curve = curve;
  limiter.oversample = '4x';
  
  // Compressor - more aggressive settings
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 20;
  compressor.ratio.value = 8;
  compressor.attack.value = 0.002;
  compressor.release.value = 0.15;
  
  // Shape shifter for analog warmth (10% wet)
  const shaper = ctx.createWaveShaper();
  const shaperCurve = new Float32Array(2048);
  for (let i = 0; i < 2048; i++) {
    const x = (i * 2) / 2048 - 1;
    shaperCurve[i] = Math.tanh(x * 0.8) * 0.1 + x * 0.9; // 10% saturation
  }
  shaper.curve = shaperCurve;
  shaper.oversample = '2x';
  
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.35;
  
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  
  // Signal chain: masterGain → shaper → compressor → limiter → analyser → destination
  masterGain.connect(shaper);
  shaper.connect(compressor);
  compressor.connect(limiter);
  limiter.connect(analyser);
  analyser.connect(ctx.destination);
  
  return { ctx, masterGain, analyser };
}

function playStep(engine: any, note: number, waveform: OscillatorType, attack: number, decay: number, filterFreq: number) {
  const { ctx, masterGain } = engine;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = waveform as OscillatorType;
  osc.frequency.value = note;
  filter.type = "lowpass";
  filter.frequency.value = filterFreq;
  filter.Q.value = 8;
  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.8, now + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);
  osc.start(now);
  osc.stop(now + attack + decay + 0.05);
}

// Label component
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ 
      fontSize: 7, 
      letterSpacing: "0.28em", 
      color: "#9A9590", 
      textTransform: "uppercase", 
      marginBottom: 6 
    }}>
      {children}
    </div>
  );
}

// Knob Component - Photophon style
function Knob({ label, value, min, max, onChange, unit = "", accent, displayValue }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit?: string; accent?: boolean; displayValue?: number }) {
  const dragging = useRef(false);
  const startY = useRef(0);
  const startVal = useRef(0);
  const norm = (value - min) / (max - min);
  const angle = -135 + norm * 270;

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const cy = e.clientY;
    const delta = (startY.current - cy) / 120;
    const newVal = Math.max(min, Math.min(max, startVal.current + delta * (max - min)));
    onChange(newVal);
  }, [min, max, onChange]);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    startVal.current = value;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const displayVal = displayValue !== undefined ? Math.round(displayValue) : Math.round(norm * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, userSelect: "none" }}>
      <div
        onMouseDown={onMouseDown}
        style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "radial-gradient(circle at 33% 33%, #F8F4EC, #D8D4CC)",
          border: "1px solid #C0BCB4",
          boxShadow: "0 3px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.85)",
          cursor: "ns-resize", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {[...Array(11)].map((_, i) => {
          const tickAngle = -135 + i * 27;
          const rad = (tickAngle - 90) * Math.PI / 180;
          const r = 20;
          return (
            <div key={i} style={{
              position: "absolute",
              width: i % 5 === 0 ? 2 : 1,
              height: i % 5 === 0 ? 5 : 3,
              background: "#B8B4AC",
              left: 24 + r * Math.cos(rad) - (i % 5 === 0 ? 1 : 0.5),
              top: 24 + r * Math.sin(rad) - (i % 5 === 0 ? 2.5 : 1.5),
              transform: `rotate(${tickAngle}deg)`,
              transformOrigin: "center",
            }} />
          );
        })}
        <div style={{
          position: "absolute", width: 3, height: 14,
          background: accent ? "#D4580A" : "#2A2A2A", borderRadius: 2,
          transformOrigin: "50% 85%",
          transform: `rotate(${angle}deg)`,
          top: 8,
        }} />
      </div>
      <div style={{ textAlign: "center", lineHeight: 1.3 }}>
        <div style={{ fontSize: 7, letterSpacing: "0.18em", color: "#9A9590", textTransform: "uppercase", marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 8, color: "#555", fontFamily: "'Helvetica Neue', monospace" }}>{displayVal}<span style={{ fontSize: 6, color: "#9A9590" }}>{unit}</span></div>
      </div>
    </div>
  );
}

// Waveform pictogram
function WaveformIcon({ type, active }: { type: OscillatorType; active: boolean }) {
  const color = active ? "#fff" : "#666";
  const size = 14;
  
  if (type === "sine") {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14">
        <path d="M1 7 Q4 2, 7 7 T13 7" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
    );
  }
  if (type === "triangle") {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14">
        <path d="M1 10 L4 4 L7 10 L10 4 L13 10" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (type === "sawtooth") {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14">
        <path d="M1 10 L6 4 L6 10 L11 4 L11 10" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (type === "square") {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14">
        <path d="M1 10 L1 4 L5 4 L5 10 L9 10 L9 4 L13 4" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return null;
}

// Shuffle Toggle Component - toggle switch style
function ShuffleToggle({ onShuffle, active }: { onShuffle: () => void; active: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontSize: 6, letterSpacing: "0.18em", color: "#888", textTransform: "uppercase" }}>SHUFFLE</div>
      <button
        onClick={onShuffle}
        style={{
          width: 52,
          height: 28,
          borderRadius: 14,
          background: "#E0DDD5",
          border: "1px solid #C0BCB4",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.15s",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{
          position: "absolute",
          top: 3,
          left: active ? 27 : 3,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "linear-gradient(145deg, #F8F4EC, #D8D4CC)",
          border: "1px solid #C0BCB4",
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
          transition: "left 0.15s",
        }} />
      </button>
    </div>
  );
}

// Oscilloscope
function Oscilloscope({ analyserRef, isPlaying }: { analyserRef: React.MutableRefObject<any>; isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const waveRef = useRef(new Float32Array(128));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bufferLength = 512;
    const dataArray = new Float32Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const W = canvas.width, H = canvas.height;

      ctx.fillStyle = "#F0EDE5";
      ctx.fillRect(0, 0, W, H);

      const analyser = analyserRef.current;
      if (analyser && isPlaying) {
        analyser.getFloatTimeDomainData(dataArray);
        waveRef.current = dataArray.slice(0, 128);
      }

      ctx.strokeStyle = "#2A2A2A";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i < 128; i++) {
        const x = (i / 128) * W;
        const y = H / 2 + (waveRef.current[i] || 0) * H * 0.42;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying]);

  if (!mounted) {
    return (
      <div style={{ borderBottom: "1px solid #CCC8C0", padding: "5px 14px 4px", background: "#F0EDE5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 6, letterSpacing: "0.3em", color: "#9A9590", textTransform: "uppercase" }}>AUSGANG</span>
          <span style={{ fontSize: 6, letterSpacing: "0.2em", color: "#9A9590" }}>STANDBY</span>
        </div>
        <canvas ref={canvasRef} width={556} height={32} style={{ width: "100%", height: 32, display: "block" }} />
      </div>
    );
  }

  return (
    <div style={{ borderBottom: "1px solid #CCC8C0", padding: "5px 14px 4px", background: "#F0EDE5" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 6, letterSpacing: "0.3em", color: "#9A9590", textTransform: "uppercase" }}>AUSGANG</span>
        <span style={{ fontSize: 6, letterSpacing: "0.2em", color: "#9A9590" }}>{isPlaying ? "LIVE" : "STANDBY"}</span>
      </div>
      <canvas ref={canvasRef} width={556} height={32} style={{ width: "100%", height: 32, display: "block" }} />
    </div>
  );
}

// 5+ octaves: C2 to C7 (61 notes)
const SCALE = [
  65.41, 69.30, 73.42, 77.78, 82.41, 87.31, 92.50, 98.00, 103.83, 110, 116.54, 123.47,
  130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185, 196, 207.65, 220, 233.08, 246.94,
  261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392, 415.3, 440, 466.16, 493.88,
  523.25, 554.37, 587.33, 622.25, 659.25, 698.46, 739.99, 783.99, 830.61, 880, 932.33, 987.77,
  1046.5, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760, 1864.66, 1975.53, 2093
];
const NOTE_NAMES = ["C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2","C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5","C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6","C7"];
const WAVEFORMS: OscillatorType[] = ["sine", "triangle", "sawtooth", "square"];

interface Step { active: boolean; noteIdx: number; }

export default function AndromaticClient() {
  const engineRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const stepsRef = useRef<Step[] | null>(null);
  const paramsRef = useRef<any>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState<Step[]>(
    // Default pattern: C2, D2, E2, G2, A2, C3, D3, E3, G3, A3 (indices: 0, 2, 4, 7, 9, 12, 14, 16, 19, 21)
    Array(10).fill(null).map((_, i) => {
      const defaultNotes = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
      return { active: [0,2,3,5,7,8].includes(i), noteIdx: defaultNotes[i] };
    })
  );
  const [bpm, setBpm] = useState(92);
  const [waveform, setWaveform] = useState<OscillatorType>("sawtooth");
  const [attack, setAttack] = useState(0.015);
  const [decay, setDecay] = useState(0.5);
  const [filterFreq, setFilterFreq] = useState(900);
  const [volume, setVolume] = useState(0.7);
  const [shuffleActive, setShuffleActive] = useState(false);

  stepsRef.current = steps;
  paramsRef.current = { bpm, waveform, attack, decay, filterFreq };

  const shufflePattern = useCallback(() => {
    setShuffleActive(!shuffleActive);
    setSteps(s => s.map(st => ({ ...st, active: Math.random() > 0.5 })));
  }, [shuffleActive]);

  const getEngine = () => {
    if (!engineRef.current) {
      const eng = createAudioEngine();
      engineRef.current = eng;
      analyserRef.current = eng.analyser;
    }
    return engineRef.current;
  };

  const startSeq = useCallback(() => {
    const eng = getEngine();
    eng.ctx.resume();
    // Smooth volume ramp on start
    const now = eng.ctx.currentTime;
    eng.masterGain.gain.cancelScheduledValues(now);
    eng.masterGain.gain.setValueAtTime(eng.masterGain.gain.value, now);
    eng.masterGain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.1);
    stepRef.current = 0;
    const tick = () => {
      const i = stepRef.current % 10;
      setCurrentStep(i);
      const s = stepsRef.current![i];
      const p = paramsRef.current;
      if (s.active) playStep(eng, SCALE[s.noteIdx], p.waveform, p.attack, p.decay, p.filterFreq);
      stepRef.current++;
    };
    tick();
    // BPM = quarter notes per minute: interval = 60000 / BPM ms for quarter note
    // But we have 8th notes (half beat), so interval = (60 / bpm) * 1000 / 2 = (60 / bpm) * 500
    // Actually for 8th notes: interval = 30000 / bpm
    intervalRef.current = window.setInterval(tick, 30000 / bpm);
    setIsPlaying(true);
  }, [bpm, volume]);

  const stopSeq = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setCurrentStep(-1);
  }, []);

  const handlePlayStop = () => {
    if (isPlaying) { stopSeq(); } else { startSeq(); }
  };

  useEffect(() => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const eng = engineRef.current;
      if (!eng) return;
      intervalRef.current = window.setInterval(() => {
        const i = stepRef.current % 10;
        setCurrentStep(i);
        const s = stepsRef.current![i];
        const p = paramsRef.current;
        if (s.active) playStep(eng, SCALE[s.noteIdx], p.waveform, p.attack, p.decay, p.filterFreq);
        stepRef.current++;
      }, 30000 / bpm);
    }
  }, [bpm]);

  useEffect(() => {
    if (engineRef.current) {
      const eng = engineRef.current;
      const now = eng.ctx.currentTime;
      // Smooth volume change to avoid clicks/pops
      eng.masterGain.gain.cancelScheduledValues(now);
      eng.masterGain.gain.setValueAtTime(eng.masterGain.gain.value, now);
      eng.masterGain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.1);
    }
  }, [volume]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const toggleStep = (i: number) => setSteps(s => s.map((st, idx) => idx === i ? { ...st, active: !st.active } : st));
  const changeNote = (i: number, dir: number) => setSteps(s => s.map((st, idx) => idx === i ? { ...st, noteIdx: Math.min(SCALE.length - 1, Math.max(0, st.noteIdx + dir)) } : st));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#EDE9E0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      padding: 40,
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 640,
        background: "#E8E4DC",
        borderRadius: 6,
        border: "1px solid #CCC8C0",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 20px",
          background: "#F0EDE5",
          borderBottom: "1px solid #CCC8C0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 300, letterSpacing: "0.28em", color: "#1E1E1E", textTransform: "uppercase" }}>Andromatic</div>
            <div style={{ fontSize: 6.5, letterSpacing: "0.2em", color: "#999", textTransform: "uppercase", marginTop: 3 }}>
              Ten Step Pattern Sequencer
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 6, letterSpacing: "0.12em", color: "#BBB", textTransform: "uppercase" }}>Scenkonstmuseet</div>
            <div style={{ fontSize: 6, letterSpacing: "0.12em", color: "#CCC", textTransform: "uppercase", marginTop: 2 }}>Stockholm</div>
          </div>
        </div>

        {/* Oscilloscope */}
        <Oscilloscope analyserRef={analyserRef} isPlaying={isPlaying} />

        {/* Sequencer */}
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #CCC8C0" }}>
          <Label>Sequence</Label>
          <div style={{ display: "flex", gap: 4 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{
                  width: 4, height: 4, borderRadius: "50%",
                  background: currentStep === i ? "#D4580A" : "#ccc",
                  boxShadow: currentStep === i ? "0 0 4px rgba(212,88,10,0.4)" : "none",
                }} />
                <button onClick={() => changeNote(i, 1)} style={{
                  width: "100%", height: 8, background: "none", border: "none",
                  color: "#999", fontSize: 6, cursor: "pointer", padding: 0,
                }}>▲</button>
                <button onClick={() => toggleStep(i)} style={{
                  width: "100%", height: 32, borderRadius: 2, border: "1px solid #C0BCB4", cursor: "pointer",
                  background: step.active ? "#1E1E1E" : "#E0DDD5",
                  boxShadow: step.active ? "inset 0 1px 2px rgba(0,0,0,0.4)" : "inset 0 1px 0 rgba(255,255,255,0.6)",
                  transition: "all 0.09s",
                  position: "relative",
                }}>
                  {step.active && (
                    <div style={{
                      position: "absolute", top: "50%", left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 3, height: 3, borderRadius: "50%",
                      background: currentStep === i ? "#D4580A" : "#F0EDE5",
                    }} />
                  )}
                </button>
                <button onClick={() => changeNote(i, -1)} style={{
                  width: "100%", height: 8, background: "none", border: "none",
                  color: "#999", fontSize: 6, cursor: "pointer", padding: 0,
                }}>▼</button>
                <div style={{ fontSize: 6, color: "#9A9590", fontFamily: "monospace" }}>{NOTE_NAMES[step.noteIdx]}</div>
                <div style={{ fontSize: 5.5, color: "#B8B4AC" }}>{i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls - Original Andromatic UX */}
        <div style={{ padding: "16px" }}>
          {/* 5 Knobs in a row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16 }}>
            <Knob label="TEMPO" value={bpm} min={10} max={220} onChange={setBpm} unit=" bpm" displayValue={bpm} />
            <Knob label="ATTACK" value={attack} min={0.001} max={3} onChange={setAttack} unit="" />
            <Knob label="DECAY" value={decay} min={0.05} max={10} onChange={setDecay} unit="" />
            <Knob label="FILTER" value={filterFreq} min={100} max={8000} onChange={setFilterFreq} unit="" />
            <Knob label="VOLUME" value={volume} min={0} max={1} onChange={setVolume} accent />
          </div>
          
          {/* Waveform + Play/Stop + Shuffle - Golden ratio layout */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24 }}>
            {/* Waveform buttons */}
            <div>
              <div style={{ fontSize: 6, letterSpacing: "0.18em", color: "#888", textTransform: "uppercase", marginBottom: 4, textAlign: "center" }}>WAVE</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 3 }}>
                {WAVEFORMS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWaveform(w)}
                    style={{
                      width: 32,
                      height: 28,
                      background: waveform === w ? "#1E1E1E" : "#E0DDD5",
                      color: waveform === w ? "#F0EDE5" : "#9A9590",
                      border: waveform === w ? "none" : "1px solid #C0BCB4",
                      borderRadius: 2,
                      cursor: "pointer",
                      transition: "all 0.12s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <WaveformIcon type={w} active={waveform === w} />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Play/Stop button - larger, golden ratio proportion */}
            <button onClick={handlePlayStop} style={{
              width: 68, height: 68, borderRadius: "50%",
              background: isPlaying ? "#D4580A" : "#E0DDD5",
              border: isPlaying ? "none" : "1px solid #C0BCB4",
              boxShadow: isPlaying
                ? "inset 0 2px 4px rgba(0,0,0,0.4)"
                : "inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 6px rgba(0,0,0,0.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.12s",
            }}>
              {isPlaying ? (
                <div style={{ width: 16, height: 16, background: "#F0EDE5", borderRadius: 2 }} />
              ) : (
                <div style={{
                  width: 0, height: 0,
                  borderLeft: "16px solid #D4580A",
                  borderTop: "11px solid transparent",
                  borderBottom: "11px solid transparent",
                  marginLeft: 4,
                }} />
              )}
            </button>
            
            {/* Shuffle toggle */}
            <ShuffleToggle onShuffle={shufflePattern} active={shuffleActive} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #CCC8C0",
          background: "#E0DDD5",
          padding: "8px 20px",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <div style={{ fontSize: 6.5, color: "#B0B0B0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Andromeda Studio · Nacka, Sweden
          </div>
          <div style={{ fontSize: 6.5, color: "#B0B0B0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Ralph Lundsten · Erkki Kurenniemi
          </div>
        </div>
      </div>
    </div>
  );
}
