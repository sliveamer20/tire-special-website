import React, { useCallback, useEffect, useRef, useState } from 'react';
import { diagnoseMechanic } from '../data/diagnosisEngine.js';

const examples = ['My steering wheel shakes.', 'My tire keeps losing air.', 'Brake noise.', 'Car pulls to one side.', 'Vibration at highway speed.'];
const phone = 'tel:+18134433869';
const directions = 'https://www.google.com/maps/dir/?api=1&destination=105+US-301+STE+103+Tampa+FL+33619';

function PhoneIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>; }
function PinIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>; }

function Actions({ tireRelated }) {
  return <div className="am-actions">
    {tireRelated && <button type="button" className="am-btn am-btn-tire" data-am-search-tires onClick={() => {
      const finder = document.querySelector('[data-finder]');
      if (finder) { finder.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); window.setTimeout(() => finder.querySelector('[data-finder-width]')?.focus(), 450); }
      else window.location.href = 'tires.html';
    }}><PinIcon /> Search Tires</button>}
    <a className="am-btn am-btn-call" href={phone}><PhoneIcon /> Call Now</a>
    <a className="am-btn am-btn-dir" href={directions} target="_blank" rel="noopener"><PinIcon /> Get Directions</a>
  </div>;
}

function SafetyStat({ label, value, type }) {
  const colors = { safety: { Low: '#22a06b', Medium: '#e0a530', High: '#d64545' }, drive: { Yes: '#22a06b', Caution: '#e0a530', No: '#d64545' }, priority: { Monitor: '#22a06b', Soon: '#e0a530', Immediate: '#d64545' } };
  return <div className="am-stat"><div className="am-stat-l">{label}</div><div className="am-stat-v"><span className="am-dot" style={{ background: colors[type]?.[value] || '#888' }} />{value}</div></div>;
}

function DiagnosisCard({ scenario, result, secondary = false }) {
  if (secondary) return <div className="am-card am-card-secondary"><div className="am-card-h-sm">Also Consider: {scenario.title}</div><div className="am-stats am-stats-sm"><SafetyStat label="Safety" value={scenario.safetyLevel} type="safety" /><SafetyStat label="Drive?" value={scenario.canDrive} type="drive" /><SafetyStat label="Priority" value={scenario.repairPriority} type="priority" /></div></div>;
  return <div className="am-card am-card-primary">
    <div className="am-card-h">{scenario.title}</div>
    {result.bestGuess && <div className="am-guess-note">Best guess based on what you've described so far.</div>}
    {result.matchedSymptoms?.length > 1 && <div className="am-detected"><span className="am-detected-l">Detected:</span> {result.matchedSymptoms.map((symptom) => <span className="am-chip" key={symptom.id}>{symptom.label}</span>)}</div>}
    <div className="am-stats"><SafetyStat label="Safety Level" value={scenario.safetyLevel} type="safety" /><SafetyStat label="Can I Drive?" value={scenario.canDrive} type="drive" /><SafetyStat label="Priority" value={scenario.repairPriority} type="priority" /></div>
    <div className="am-body-grid"><div className="am-list-card"><div className="am-list-h">Possible Causes</div><ul>{scenario.causes.map((cause) => <li key={cause}>{cause}</li>)}</ul></div><div className="am-list-card"><div className="am-list-h">Recommended Services</div><ul>{scenario.services.map((service) => <li key={service}>{service}</li>)}</ul></div></div>
    <p className="am-next">{scenario.nextStep}</p><Actions tireRelated={scenario.tireRelated} />
  </div>;
}

function TurnResult({ turn, answer }) {
  if (turn.status === 'loading') return <div className="am-msg am-msg-assistant am-analyzing" role="status"><span className="am-dot-flash" /> Analyzing your description…</div>;
  const result = turn.result;
  if (!result) return null;
  if (result.type === 'out-of-scope') return <><div className="am-msg am-msg-assistant">This assistant only provides tire and automotive repair guidance, so I'm not able to help with that. Ask me about noises, warning lights, tire issues, or how your vehicle is behaving, or reach us directly:</div><Actions /></>;
  if (result.type === 'low-confidence') return <><div className="am-msg am-msg-assistant">We couldn't determine the issue with confidence. Please call or visit us for a professional inspection.</div><Actions /></>;
  if (result.type === 'ambiguous') return <><div className="am-msg am-msg-assistant">Let me ask a few quick questions to improve the diagnosis.</div><div className="am-questions">{result.questions.map((question) => <div className="am-question" key={question.id}><div className="am-question-t">{question.text}</div><div className="am-question-btns"><button type="button" className="am-qbtn" onClick={() => answer(turn.id, question, true)}>Yes</button><button type="button" className="am-qbtn am-qbtn-no" onClick={() => answer(turn.id, question, false)}>No</button></div></div>)}</div></>;
  return <><DiagnosisCard scenario={result.primary} result={result} />{result.secondary && <DiagnosisCard scenario={result.secondary} result={result} secondary />}</>;
}

export function MechanicAssistant() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState([]);
  const [busy, setBusy] = useState(false);
  const panelRef = useRef(null);
  const threadRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const timers = useRef(new Set());
  const counter = useRef(0);

  const diagnoseTurn = useCallback((turn, history) => {
    setBusy(true);
    setTurns((current) => current.map((item) => item.id === turn.id ? { ...item, status: 'loading' } : item));
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      let result = diagnoseMechanic(turn.effectiveText, history, { clarifyRound: turn.clarifyRound });
      let nextRound = turn.clarifyRound;
      if (result.type === 'ambiguous') {
        const unanswered = result.questions.filter((question) => !turn.answeredQuestionIds[question.id]);
        if (unanswered.length) { nextRound += 1; result = { ...result, questions: unanswered }; }
        else {
          const first = result.candidates[0];
          result = { type: 'match', query: turn.effectiveText, matchedSymptoms: result.matchedSymptoms, primary: first.scenario, primaryConfidence: first.confidence, bestGuess: true };
        }
      }
      setTurns((current) => current.map((item) => item.id === turn.id ? { ...item, status: 'done', result, clarifyRound: nextRound } : item));
      setBusy(false);
    }, 550);
    timers.current.add(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 250);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = [...panelRef.current.querySelectorAll('button:not([disabled]), textarea, a[href]')];
        if (focusable.length && event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
        else if (focusable.length && !event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { window.clearTimeout(focusTimer); document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; };
    // close is intentionally defined below and stable for the open lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [turns]);

  useEffect(() => () => { timers.current.forEach((timer) => window.clearTimeout(timer)); timers.current.clear(); }, []);

  function close() {
    setClosing(true);
    setOpen(false);
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
    setBusy(false);
    const timer = window.setTimeout(() => { setClosing(false); setTurns([]); setInput(''); triggerRef.current?.focus(); }, 280);
    timers.current.add(timer);
  }

  function submit(event) {
    event.preventDefault();
    const query = input.trim();
    if (!query || busy) return;
    setInput('');
    const turn = { id: `am-turn-${++counter.current}`, query, effectiveText: query, clarifyRound: 0, answeredQuestionIds: {}, status: 'loading', result: null };
    const history = turns.map(({ query: previousQuery, result }) => ({ query: previousQuery, result }));
    setTurns((current) => [...current, turn]);
    diagnoseTurn(turn, history);
  }

  function answer(turnId, question, yes) {
    if (busy) return;
    const currentTurn = turns.find((turn) => turn.id === turnId);
    if (!currentTurn || currentTurn.answeredQuestionIds[question.id]) return;
    const updated = { ...currentTurn, answeredQuestionIds: { ...currentTurn.answeredQuestionIds, [question.id]: true }, effectiveText: yes ? `${currentTurn.effectiveText}. ${question.appendOnYes}` : currentTurn.effectiveText };
    const history = turns.map((turn) => turn.id === turnId ? { query: turn.query, result: turn.result } : { query: turn.query, result: turn.result });
    setTurns((current) => current.map((turn) => turn.id === turnId ? updated : turn));
    diagnoseTurn(updated, history);
  }

  const visible = open || closing;
  return <>
    <button ref={triggerRef} className="am-fab" type="button" aria-haspopup="dialog" aria-controls="amPanel" aria-expanded={open} onClick={() => { setClosing(false); setOpen(true); }}>🔧 Ask a Mechanic</button>
    {visible && <div className="am-overlay">
      <button className="am-backdrop" type="button" data-am-close aria-label="Close Ask a Mechanic" onClick={close} />
      <aside ref={panelRef} id="amPanel" className={`am-panel${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Ask a Mechanic">
        <div className="am-head"><div className="am-head-t">🔧 Ask a Mechanic</div><button type="button" className="am-x" aria-label="Close" onClick={close}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m18 6-12 12M6 6l12 12" /></svg></button></div>
        <div className="am-thread" id="amThread" ref={threadRef} aria-live="polite">
          {!turns.length ? <div className="am-welcome"><p className="am-subtitle">Describe what's happening with your vehicle and we'll suggest the most likely causes.</p><div className="am-examples">{examples.map((example) => <button type="button" className="am-example" key={example} onClick={() => { setInput(example); inputRef.current?.focus(); }}>{example}</button>)}</div></div> : turns.map((turn) => <div className="am-turn" key={turn.id}><div className="am-msg am-msg-user">{turn.query}</div><TurnResult turn={turn} answer={answer} /></div>)}
        </div>
        <form className="am-composer" onSubmit={submit}><textarea id="amInput" ref={inputRef} className="am-input" rows="2" placeholder={examples[0]} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} aria-label="Describe your vehicle symptoms" /><button type="submit" className="am-send" disabled={!input.trim() || busy}>Diagnose</button></form>
      </aside>
    </div>}
  </>;
}
