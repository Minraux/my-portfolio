'use client';

import { useState, useEffect, useRef, useCallback } from "react";

function createAudioEngine() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const masterGain = ctx.createGain();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  masterGain.connect(analyser);
  analyser.connect(ctx.destination);
  masterGain.gain.value = 0.7;
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

function Knob({ label, value, min, max, onChange, unit = "" }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit?: string }) {
  const dragging = useRef(false);
  const startY = useRef(0);
  const startVal = useRef(0);
  const angle = -135 + ((value - min) / (max - min)) * 270;

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const delta = (startY.current - e.clientY) / 120;
    const newVal = Math.min(max, Math.max(min, startVal.current + delta * (max - min)));
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

  const displayVal = value < 10 ? value.toFixed(2) : Math.round(value);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, userSelect: "none" }}>
      <div
        onMouseDown={onMouseDown}
        style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(145deg, #3a3a3a 0%, #1e1e1e 100%)",
          boxShadow: "3px 3px 6px #111, -1px -1px 3px #555, inset 0 1px 2px rgba(255,255,255,0.06)",
          cursor: "ns-resize", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: `rotate(${angle}deg)`, transition: "transform 0.04s",
        }}
      >
        <div style={{ width: 2, height: 12, background: "#E8520A", borderRadius: 1, position: "absolute", top: 5 }} />
      </div>
      <div style={{ textAlign: "center", lineHeight: 1.3 }}>
        <div style={{ fontFamily: "'Helvetica Neue', Helvetica, sans-serif", fontSize: 8, letterSpacing: "0.14em", color: "#7a7a7a", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontFamily: "monospace", fontSize: 8, color: "#555", marginTop: 1 }}>{displayVal}{unit}</div>
      </div>
    </div>
  );
}

function Oscilloscope({ analyserRef, isPlaying }: { analyserRef: React.MutableRefObject<any>; isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bufferLength = 1024;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = "rgba(8, 12, 8, 0.3)";
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(40, 70, 40, 0.35)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath(); ctx.moveTo((W / 4) * i, 0); ctx.lineTo((W / 4) * i, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, (H / 4) * i); ctx.lineTo(W, (H / 4) * i); ctx.stroke();
      }

      const analyser = analyserRef.current;
      if (analyser && isPlaying) {
        analyser.getByteTimeDomainData(dataArray);
      } else {
        for (let i = 0; i < bufferLength; i++) dataArray[i] = 128;
      }

      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00ee44";
      ctx.strokeStyle = "#2eee66";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < bufferLength; i++) {
        const x = (i / bufferLength) * W;
        const y = (dataArray[i] / 128.0) * (H / 2);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [analyserRef, isPlaying]);

  return (
    <div style={{
      position: "relative", background: "#080c08", borderRadius: 4, overflow: "hidden",
      boxShadow: "inset 0 0 24px rgba(0,0,0,0.9), inset 0 0 50px rgba(0,15,0,0.5)",
      border: "1px solid #161616",
    }}>
      <canvas ref={canvasRef} width={556} height={130} style={{ display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 6, left: 10, fontFamily: "'Helvetica Neue', sans-serif", fontSize: 7, letterSpacing: "0.18em", color: "rgba(46,160,80,0.45)", textTransform: "uppercase" }}>
        Oscilloscope
      </div>
      <div style={{ position: "absolute", top: 6, right: 10, fontFamily: "'Helvetica Neue', sans-serif", fontSize: 7, letterSpacing: "0.18em", color: "rgba(46,160,80,0.45)", textTransform: "uppercase" }}>
        Andromatic · 1968
      </div>
    </div>
  );
}

const SCALE = [110, 123.47, 138.59, 146.83, 164.81, 185, 196, 220, 246.94, 261.63];
const NOTE_NAMES = ["A2","B2","C#3","D3","E3","F#3","G3","A3","B3","C4"];
const WAVEFORMS = ["sine", "triangle", "sawtooth", "square"];

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
    Array(10).fill(null).map((_, i) => ({ active: [0,2,3,5,7,8].includes(i), noteIdx: i }))
  );
  const [bpm, setBpm] = useState(92);
  const [waveform, setWaveform] = useState<OscillatorType>("sawtooth");
  const [attack, setAttack] = useState(0.015);
  const [decay, setDecay] = useState(0.28);
  const [filterFreq, setFilterFreq] = useState(900);
  const [volume, setVolume] = useState(0.7);

  stepsRef.current = steps;
  paramsRef.current = { bpm, waveform, attack, decay, filterFreq };

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
    eng.masterGain.gain.value = volume;
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
    intervalRef.current = window.setInterval(tick, (60 / bpm) * 500);
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
      }, (60 / bpm) * 500);
    }
  }, [bpm]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.masterGain.gain.value = volume;
  }, [volume]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const toggleStep = (i: number) => setSteps(s => s.map((st, idx) => idx === i ? { ...st, active: !st.active } : st));
  const changeNote = (i: number, dir: number) => setSteps(s => s.map((st, idx) => idx === i ? { ...st, noteIdx: Math.min(9, Math.max(0, st.noteIdx + dir)) } : st));

  return (
    <div style={{
      minHeight: "100vh", background: "#141414",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
      padding: 20,
    }}>
      <div style={{
        width: 620,
        background: "linear-gradient(168deg, #D6D1C6 0%, #C9C4B9 50%, #BFBAB0 100%)",
        borderRadius: 10,
        boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 2px 0px rgba(255,255,255,0.2) inset, 0 -2px 4px rgba(0,0,0,0.25) inset",
        padding: "22px 26px 26px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 300, letterSpacing: "0.28em", color: "#1e1e1e", textTransform: "uppercase" }}>Andromatic</div>
            <div style={{ fontSize: 7.5, letterSpacing: "0.22em", color: "#999", textTransform: "uppercase", marginTop: 2 }}>
              Ten Step Pattern Sequencer · E. Kurenniemi · 1968
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 7, letterSpacing: "0.12em", color: "#bbb", textTransform: "uppercase" }}>Scenkonstmuseet</div>
            <div style={{ fontSize: 7, letterSpacing: "0.12em", color: "#ccc", textTransform: "uppercase" }}>Stockholm</div>
          </div>
        </div>

        <Oscilloscope analyserRef={analyserRef} isPlaying={isPlaying} />

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 7.5, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase", marginBottom: 9 }}>Sequence</div>
          <div style={{ display: "flex", gap: 5 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: currentStep === i ? "#E8520A" : "#333",
                  boxShadow: currentStep === i ? "0 0 7px #E8520A, 0 0 14px rgba(232,82,10,0.5)" : "none",
                  transition: "all 0.05s",
                }} />
                <button onClick={() => changeNote(i, 1)} style={{
                  width: "100%", height: 9, background: "none", border: "none",
                  color: "#999", fontSize: 7, cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1,
                }}>▲</button>
                <button onClick={() => toggleStep(i)} style={{
                  width: "100%", height: 36, borderRadius: 3, border: "none", cursor: "pointer",
                  background: step.active
                    ? "linear-gradient(180deg, #3c3c3c 0%, #282828 100%)"
                    : "linear-gradient(180deg, #b3aea3 0%, #a39e95 100%)",
                  boxShadow: step.active
                    ? "inset 0 2px 5px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04)"
                    : "0 2px 4px rgba(0,0,0,0.22), inset 0 1px 1px rgba(255,255,255,0.28)",
                  transition: "all 0.09s",
                  position: "relative",
                }}>
                  {step.active && (
                    <div style={{
                      position: "absolute", top: "50%", left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 4, height: 4, borderRadius: "50%",
                      background: currentStep === i ? "#E8520A" : "#E8BA6A",
                      boxShadow: currentStep === i ? "0 0 6px #E8520A" : "none",
                      transition: "all 0.05s",
                    }} />
                  )}
                </button>
                <button onClick={() => changeNote(i, -1)} style={{
                  width: "100%", height: 9, background: "none", border: "none",
                  color: "#999", fontSize: 7, cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1,
                }}>▼</button>
                <div style={{ fontSize: 6.5, color: "#888", letterSpacing: "0.03em", fontFamily: "monospace" }}>
                  {NOTE_NAMES[step.noteIdx]}
                </div>
                <div style={{ fontSize: 6.5, color: "#aaa", letterSpacing: "0.05em" }}>{i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.12)", margin: "18px 0 16px" }} />

        <div style={{ display: "flex", alignItems: "flex-end", gap: 0 }}>
          <div style={{ display: "flex", gap: 18, flex: 1 }}>
            <Knob label="Tempo" value={bpm} min={40} max={200} onChange={setBpm} unit=" bpm" />
            <Knob label="Attack" value={attack} min={0.001} max={0.5} onChange={setAttack} />
            <Knob label="Decay" value={decay} min={0.05} max={2} onChange={setDecay} />
            <Knob label="Filter" value={filterFreq} min={100} max={8000} onChange={setFilterFreq} unit=" hz" />
            <Knob label="Volume" value={volume} min={0} max={1} onChange={setVolume} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 3.5, marginLeft: 22 }}>
            <div style={{ fontSize: 7.5, letterSpacing: "0.14em", color: "#888", textTransform: "uppercase", marginBottom: 2 }}>Wave</div>
            {WAVEFORMS.map(w => (
              <button key={w} onClick={() => setWaveform(w as OscillatorType)} style={{
                height: 15, width: 66, border: `1px solid ${waveform === w ? "#555" : "#bbb"}`,
                borderRadius: 2, cursor: "pointer",
                background: waveform === w ? "#2a2a2a" : "transparent",
                color: waveform === w ? "#E8BA6A" : "#777",
                fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase",
                fontFamily: "'Helvetica Neue', sans-serif",
                transition: "all 0.1s",
              }}>{w}</button>
            ))}
          </div>

          <div style={{ marginLeft: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <button onClick={handlePlayStop} style={{
              width: 50, height: 50, borderRadius: "50%", border: "none", cursor: "pointer",
              background: isPlaying
                ? "linear-gradient(145deg, #c0392b, #8e1e14)"
                : "linear-gradient(145deg, #2e2e2e, #1a1a1a)",
              boxShadow: isPlaying
                ? "0 0 18px rgba(192,57,43,0.55), 0 3px 8px rgba(0,0,0,0.5)"
                : "3px 3px 7px #111, -1px -1px 3px #555",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}>
              {isPlaying ? (
                <div style={{ width: 13, height: 13, background: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
              ) : (
                <div style={{ width: 0, height: 0, borderLeft: "13px solid #E8520A", borderTop: "8px solid transparent", borderBottom: "8px solid transparent", marginLeft: 3 }} />
              )}
            </button>
            <div style={{ fontSize: 7, color: "#888", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {isPlaying ? "Stop" : "Start"}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.12)", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 7, color: "#b0b0b0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Andromeda Studio · Nacka, Sweden
          </div>
          <div style={{ fontSize: 7, color: "#b0b0b0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Ralph Lundsten · Erkki Kurenniemi
          </div>
        </div>
      </div>
    </div>
  );
}
