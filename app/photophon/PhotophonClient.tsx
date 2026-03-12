'use client';

import { useState, useEffect, useRef } from "react";

const MODES = ["MONO", "RGB", "CHROMA", "PULSE"] as const;
const MODE_DESC: Record<typeof MODES[number], string> = { MONO: "Luminance → Pitch", RGB: "RGB → 3 Osc", CHROMA: "Hue → Harmonics", PULSE: "Motion → Rhythm" };

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 7, letterSpacing: "0.28em", color: "#9A9590", textTransform: "uppercase", marginBottom: 5 }}>{children}</div>;
}

function Knob({ value, min, max, onChange, accent }: { value: number; min: number; max: number; onChange: (v: number) => void; accent?: boolean }) {
  const norm = (value - min) / (max - min);
  const angle = -135 + norm * 270;
  const dragging = useRef(false);
  const startY = useRef(0);
  const startVal = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const cy = (e as MouseEvent).clientY ?? (e as TouchEvent).touches?.[0]?.clientY;
      const delta = (startY.current - cy) / 110;
      onChange(Math.max(min, Math.min(max, Math.round((startVal.current + delta * (max - min)) * 100) / 100)));
    };
    const up = () => { dragging.current = false; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [min, max, onChange]);

  return (
    <div
      onMouseDown={(e: React.MouseEvent) => { dragging.current = true; startY.current = e.clientY; startVal.current = value; }}
      style={{ cursor: "ns-resize", userSelect: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}
    >
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "radial-gradient(circle at 33% 33%, #F8F4EC, #D8D4CC)", border: "1px solid #C0BCB4", boxShadow: "0 3px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.85)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {[...Array(11)].map((_, i) => {
          const ta = -135 + i * 27;
          const rad = (ta - 90) * Math.PI / 180;
          const r = 20;
          return <div key={i} style={{ position: "absolute", width: i % 5 === 0 ? 2 : 1, height: i % 5 === 0 ? 5 : 3, background: "#B8B4AC", left: 24 + r * Math.cos(rad) - 1, top: 24 + r * Math.sin(rad) - 2, transform: `rotate(${ta}deg)`, transformOrigin: "center" }} />;
        })}
        <div style={{ position: "absolute", width: 3, height: 14, background: accent ? "#D4580A" : "#2A2A2A", borderRadius: 2, transformOrigin: "50% 85%", transform: `rotate(${angle}deg)`, top: 8 }} />
      </div>
      <span style={{ fontSize: 8, color: "#9A9590" }}>{Math.round(norm * 100)}</span>
    </div>
  );
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const oscCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);
  const gainsRef = useRef<GainNode[]>([]);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const waveRef = useRef(new Float32Array(128));

  const [active, setActive] = useState(false);
  const [mode, setMode] = useState(0);
  const [vol, setVol] = useState(0.45);
  const [sens, setSens] = useState(0.6);
  const [freq, setFreq] = useState(220);
  const [camOk, setCamOk] = useState(false);
  const [met, setMet] = useState({ luma: 0, r: 0, g: 0, b: 0 });

  const stopAudio = () => {
    oscsRef.current.forEach(o => { try { o.stop(); o.disconnect(); } catch {} });
    oscsRef.current = [];
    gainsRef.current.forEach(g => { try { g.disconnect(); } catch {} });
    gainsRef.current = [];
    try { filterRef.current?.disconnect(); } catch {}
    try { mainGainRef.current?.disconnect(); } catch {}
    try { analyserRef.current?.disconnect(); } catch {}
    try { audioCtxRef.current?.close(); } catch {}
    filterRef.current = mainGainRef.current = analyserRef.current = audioCtxRef.current = null;
  };

  const startAudio = () => {
    stopAudio();
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;
    const an = ctx.createAnalyser(); an.fftSize = 512; analyserRef.current = an;
    const mg = ctx.createGain(); mg.gain.value = vol; mainGainRef.current = mg;
    mg.connect(an); an.connect(ctx.destination);
    const fl = ctx.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = 1800; fl.Q.value = 2.5;
    filterRef.current = fl; fl.connect(mg);
    const cnt = MODES[mode] === "RGB" ? 3 : MODES[mode] === "CHROMA" ? 4 : 1;
    const waveforms = ["sine","triangle","sawtooth","square","sine","triangle","sawtooth","square"];
    waveforms.slice(0, Math.max(cnt, 8)).forEach((t, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = (i < 4 ? t : waveforms[i % 4]) as OscillatorType;
      o.frequency.value = freq * Math.pow(2, i * 7 / 12);
      g.gain.value = 0; o.connect(g); g.connect(fl); o.start();
      oscsRef.current.push(o); gainsRef.current.push(g);
    });
  };

  useEffect(() => {
    if (active) startAudio(); else stopAudio();
    return stopAudio;
  }, [active, mode, freq]);

  useEffect(() => {
    if (active && mainGainRef.current && audioCtxRef.current) {
      mainGainRef.current.gain.setTargetAtTime(vol, audioCtxRef.current.currentTime, 0.05);
    }
  }, [vol, active]);

  useEffect(() => {
    let ok = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "user" } })
      .then(s => {
        if (!ok) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); setCamOk(true); }
      }).catch(() => setCamOk(false));
    return () => { ok = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    if (!camOk || !active) { if (rafRef.current) cancelAnimationFrame(rafRef.current); return; }
    const cv = canvasRef.current, vid = videoRef.current;
    if (!cv || !vid) return;
    const cx = cv.getContext("2d");
    if (!cx) return;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      if (!vid.videoWidth) return;
      cv.width = 64; cv.height = 48;
      cx.drawImage(vid, 0, 0, 64, 48);
      const px = cx.getImageData(0, 0, 64, 48).data;
      let r = 0, g = 0, b = 0, n = px.length / 4;
      for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i+1]; b += px[i+2]; }
      r /= n; g /= n; b /= n;
      const luma = (0.299*r + 0.587*g + 0.114*b) / 255;
      let mot = 0;
      if (prevFrameRef.current) {
        const pv = prevFrameRef.current;
        for (let i = 0; i < px.length; i += 4) mot += Math.abs(px[i]-pv[i])+Math.abs(px[i+1]-pv[i+1])+Math.abs(px[i+2]-pv[i+2]);
        mot = Math.min(mot/(n*3*255),1);
      }
      prevFrameRef.current = new Uint8ClampedArray(px);
      setMet({ luma, r: r/255, g: g/255, b: b/255 });

      const os = oscsRef.current, gs = gainsRef.current, now = audioCtxRef.current?.currentTime;
      if (!os.length || !now) return;
      const s = sens, mn = MODES[mode];
      const redNorm = r / 255;
      const overtoneCount = Math.floor(4 + redNorm * 4);
      
      // Синестетическая гармония: синий → минор, жёлтый → мажор
      const colorBalance = (r - b) / 255; // -1 (синий) до +1 (жёлтый/красный)
      const minorRatio = Math.max(0, -colorBalance); // 0-1, больше когда синий
      const majorRatio = Math.max(0, colorBalance); // 0-1, больше когда жёлтый
      const neutralRatio = 1 - minorRatio - majorRatio;
      
      // Базовые интервалы: минорная терция (6/5), мажорная терция (5/4)
      const thirdRatio = minorRatio * (6/5) + majorRatio * (5/4) + neutralRatio * (9/7);

      if (mn === "MONO") {
        const monoActive = luma > 0.02 ? 1 : 0;
        os[0].frequency.setTargetAtTime(freq+luma*freq*4*s, now, 0.05);
        gs[0].gain.setTargetAtTime((0.3 + luma * 0.35) * 0.7 * monoActive, now, 0.05);
        for (let i = 1; i < os.length; i++) {
          const overtoneGain = (0.25 + luma * 0.2) * (1 - i / overtoneCount) * redNorm * 0.7 * monoActive;
          gs[i].gain.setTargetAtTime(Math.max(0, overtoneGain), now, 0.05);
          const harmonicMult = i === 1 ? thirdRatio : (i + 1);
          os[i].frequency.setTargetAtTime(freq * harmonicMult, now, 0.05);
        }
        filterRef.current?.frequency.setTargetAtTime(150+luma*4000*s, now, 0.05);
      } else if (mn === "RGB") {
        const baseGain = luma * vol * 1.3;
        [r/255,g/255,b/255].forEach((ch,i) => {
          os[i]?.frequency.setTargetAtTime(freq*Math.pow(2,i*7/12)+ch*300*s, now, 0.05);
          gs[i]?.gain.setTargetAtTime(baseGain * ch * 0.28, now, 0.05);
        });
        // Синестетическая модуляция второго осциллятора
        os[1]?.frequency.setTargetAtTime(freq * thirdRatio, now, 0.05);
        for (let i = 3; i < os.length; i++) {
          const overtoneGain = baseGain * (1 - (i - 3) / overtoneCount) * 0.12 * redNorm;
          gs[i].gain.setTargetAtTime(Math.max(0, overtoneGain), now, 0.05);
          os[i].frequency.setTargetAtTime(freq * 2 * (i - 2), now, 0.05);
        }
        const triOvertoneCount = Math.floor(redNorm * 4);
        for (let i = 0; i < triOvertoneCount; i++) {
          const triIdx = 3 + i;
          if (triIdx < os.length) {
            gs[triIdx].gain.setTargetAtTime(baseGain * 0.15 * redNorm, now, 0.05);
            os[triIdx].frequency.setTargetAtTime(freq * 3 * (i + 1), now, 0.05);
          }
        }
        filterRef.current?.frequency.setTargetAtTime(200+luma*5000*s, now, 0.05);
      } else if (mn === "CHROMA") {
        const baseGain = luma * vol * 1.3;
        const h = Math.atan2(Math.sqrt(3)*(g/255-b/255),2*r/255-g/255-b/255)/(2*Math.PI)+0.5;
        os.forEach((o,i) => {
          const harmonicGain = i < overtoneCount ? baseGain * 0.18 * s : baseGain * 0.05;
          gs[i]?.gain.setTargetAtTime(harmonicGain, now, 0.1);
          const baseFreq = freq*(i+1)*(0.5+h);
          const harmonicMult = i === 1 ? baseFreq * thirdRatio : baseFreq;
          o.frequency.setTargetAtTime(harmonicMult, now, 0.1);
        });
        const triOvertoneCount = Math.floor(redNorm * 4);
        for (let i = 0; i < triOvertoneCount; i++) {
          const triIdx = 4 + i;
          if (triIdx < os.length) {
            gs[triIdx].gain.setTargetAtTime(baseGain * 0.12 * redNorm, now, 0.1);
            os[triIdx].frequency.setTargetAtTime(freq * 3 * (i + 1), now, 0.1);
          }
        }
      } else {
        const pulseBase = (luma * 0.5 + mot * 0.5);
        const pulseActive = pulseBase > 0.02 ? 1 : 0;
        os[0].frequency.setTargetAtTime(freq + pulseBase * freq * 2 * s, now, 0.02);
        gs[0].gain.setTargetAtTime((0.25 + pulseBase * 0.5) * 0.7 * pulseActive, now, 0.02);
        for (let i = 1; i < os.length; i++) {
          const overtoneGain = (0.15 + pulseBase * 0.2) * (1 - i / overtoneCount) * redNorm * 0.7 * pulseActive;
          gs[i].gain.setTargetAtTime(Math.max(0, overtoneGain), now, 0.02);
          const harmonicMult = i === 1 ? thirdRatio : (i + 1);
          os[i].frequency.setTargetAtTime(freq * harmonicMult, now, 0.02);
        }
      }

      if (analyserRef.current) {
        const buf = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(buf);
        waveRef.current = buf.slice(0,128);
      }
      const oc = oscCanvasRef.current;
      if (oc) {
        const otx = oc.getContext("2d");
        if (!otx) return;
        otx.fillStyle = "#F0EDE5"; otx.fillRect(0,0,oc.width,oc.height);
        otx.strokeStyle = "#2A2A2A"; otx.lineWidth = 1.5; otx.beginPath();
        for (let i = 0; i < 128; i++) {
          const x = i*oc.width/128, y = oc.height/2+(waveRef.current[i]||0)*oc.height*0.42;
          i===0?otx.moveTo(x,y):otx.lineTo(x,y);
        }
        otx.stroke();
      }
    };
    loop();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [camOk, active, mode, freq, sens]);

  const ORG = "#D4580A";
  const F = [55,110,220,440,880];

  return (
    <div style={{ background:"#EDE9E0", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", boxSizing:"border-box" }}>
      <div style={{ width:"100%", maxWidth:460, display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontSize:8, letterSpacing:"0.35em", color:"#9A9590" }}>PHOTOPHON</span>
        <span style={{ fontSize:8, letterSpacing:"0.2em", color:"#B8B4AC" }}>PS-1</span>
      </div>

      <div style={{ width:"100%", maxWidth:460, background:"#E8E4DC", borderRadius:6, border:"1px solid #CCC8C0", boxShadow:"0 4px 16px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.6)", overflow:"hidden" }}>

        {/* Viewfinder */}
        <div style={{ position:"relative", background:"#111", aspectRatio:"16/9" }}>
          <video ref={videoRef} muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.8, display:"block" }} />
          <canvas ref={canvasRef} style={{ display:"none" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)", pointerEvents:"none" }} />
          {[[0,0],[1,0],[0,1],[1,1]].map(([x,y],i)=>(
            <div key={i} style={{ position:"absolute",[x?"right":"left"]:10,[y?"bottom":"top"]:10,width:10,height:10,
              borderTop:y?"none":`1px solid ${active?ORG:"#555"}`,borderBottom:y?`1px solid ${active?ORG:"#555"}`:"none",
              borderLeft:x?"none":`1px solid ${active?ORG:"#555"}`,borderRight:x?`1px solid ${active?ORG:"#555"}`:"none"}} />
          ))}
          <div style={{ position:"absolute", bottom:10, left:12, right:12, display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:8, letterSpacing:"0.3em", color:active?ORG:"#555" }}>{active?"● ON":"○ OFF"}</span>
            <span style={{ fontSize:8, letterSpacing:"0.15em", color:"#666" }}>{MODE_DESC[MODES[mode]]}</span>
          </div>
          <div style={{ position:"absolute", right:8, top:"25%", width:3, height:60, background:"#222", borderRadius:2 }}>
            <div style={{ position:"absolute", bottom:0, width:"100%", height:`${met.luma*100}%`, background:active?ORG:"#444", borderRadius:2, transition:"height 0.06s" }} />
          </div>
          {!camOk && (
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
              <div style={{ fontSize:9, letterSpacing:"0.35em", color:"#555" }}>NO SIGNAL</div>
              <div style={{ fontSize:7, letterSpacing:"0.15em", color:"#444" }}>CAMERA ACCESS REQUIRED</div>
            </div>
          )}
        </div>

        {/* Oscilloscope */}
        <div style={{ borderBottom:"1px solid #CCC8C0", padding:"5px 14px 4px", background:"#F0EDE5" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
            <span style={{ fontSize:6, letterSpacing:"0.3em", color:"#9A9590" }}>AUSGANG</span>
            <span style={{ fontSize:6, letterSpacing:"0.2em", color:"#9A9590" }}>{freq} Hz · {MODES[mode]}</span>
          </div>
          <canvas ref={oscCanvasRef} width={432} height={32} style={{ width:"100%", height:32, display:"block" }} />
        </div>

        {/* Controls */}
        <div style={{ padding:"14px 16px 10px" }}>
          <div style={{ display:"flex", gap:10, marginBottom:14, alignItems:"flex-end" }}>
            <div style={{ flexShrink:0 }}>
              <Label>Betrieb</Label>
              <button onClick={()=>setActive(v=>!v)} style={{ width:52, height:40, background:active?"#1E1E1E":"#E0DDD5", color:active?ORG:"#9A9590", border:active?"none":"1px solid #C0BCB4", borderRadius:2, fontSize:10, letterSpacing:"0.2em", cursor:"pointer", fontFamily:"inherit", transition:"all 0.12s", boxShadow:active?"inset 0 1px 3px rgba(0,0,0,0.4)":"none" }}>
                {active?"I":"O"}
              </button>
            </div>
            <div style={{ flex:1 }}>
              <Label>Modus</Label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:3 }}>
                {MODES.map((md,i)=>(
                  <button key={md} onClick={()=>setMode(i)} style={{ height:40, background:mode===i?"#1E1E1E":"#E0DDD5", color:mode===i?"#F0EDE5":"#9A9590", border:mode===i?"none":"1px solid #C0BCB4", borderRadius:2, fontSize:7, letterSpacing:"0.18em", cursor:"pointer", fontFamily:"inherit", transition:"all 0.12s" }}>{md}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            <div style={{ textAlign:"center" }}><Label>Lautstärke</Label><Knob value={vol} min={0} max={1} onChange={setVol} accent /></div>
            <div style={{ textAlign:"center" }}><Label>Empfindl.</Label><Knob value={sens} min={0.05} max={1} onChange={setSens} /></div>
            <div style={{ flex:1 }}>
              <Label>Grundton</Label>
              <div style={{ background:"#1E1E1E", borderRadius:2, padding:"6px 10px", marginBottom:5, display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                <span style={{ fontSize:7, letterSpacing:"0.2em", color:"#555" }}>Hz</span>
                <span style={{ fontSize:18, color:ORG, fontWeight:300 }}>{freq}</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:2 }}>
                {F.map(f=>(
                  <button key={f} onClick={()=>setFreq(f)} style={{ height:18, fontSize:6, background:freq===f?"#1E1E1E":"#E0DDD5", color:freq===f?ORG:"#9A9590", border:freq===f?"none":"1px solid #C0BCB4", borderRadius:1, cursor:"pointer", fontFamily:"inherit" }}>{f}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Meters */}
        <div style={{ borderTop:"1px solid #CCC8C0", padding:"8px 16px 10px", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[{l:"LUMA",v:met.luma},{l:"ROT",v:met.r},{l:"GRÜN",v:met.g},{l:"BLAU",v:met.b}].map(({l,v})=>(
            <div key={l}>
              <div style={{ fontSize:6, letterSpacing:"0.25em", color:"#9A9590", marginBottom:4 }}>{l}</div>
              <div style={{ height:2, background:"#CCC8C0", borderRadius:1, marginBottom:3 }}>
                <div style={{ height:"100%", width:`${v*100}%`, background:active?ORG:"#9A9590", borderRadius:1, transition:"width 0.06s" }} />
              </div>
              <div style={{ fontSize:7, color:"#9A9590", textAlign:"right" }}>{Math.round(v*100)}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop:"1px solid #CCC8C0", background:"#E0DDD5", padding:"5px 16px", display:"flex", justifyContent:"center" }}>
          <span style={{ fontSize:6, letterSpacing:"0.4em", color:"#9A9590" }}>A.G. Bell 1879 / 2026</span>
        </div>
      </div>

      <div style={{ marginTop:10, fontSize:6, letterSpacing:"0.35em", color:"#B8B4AC" }}>WENIGER, ABER BESSER</div>
    </div>
  );
}
