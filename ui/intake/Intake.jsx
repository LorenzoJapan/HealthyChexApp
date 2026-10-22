import React, {useState, useSyncExternalStore} from 'react';
import {createRoot} from 'react-dom/client';
import {createPortal, flushSync} from 'react-dom';
import {setAnswer, toggleAnswer} from './answers.js';

// The engine owns the answers (window.S) and the step wrappers; React renders each question
// card into its wrapper from S. Anything that changes S outside React calls refresh().
const listeners = new Set();
let version = 0;
const profile = () => window.S;
function notify() { version++; listeners.forEach(listener => listener()); }
function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
function useProfile() { useSyncExternalStore(subscribe, () => version); return profile(); }

const AUTO_ADVANCE_MS = 160; // Long enough to see the selection, short enough to feel immediate.
let pendingAdvance;
function answered(step) {
  window.fstSync?.();
  clearTimeout(pendingAdvance);
  if (step.field.kind !== 'choice' || !step.complete(profile())) return;
  // A second tap during the delay restarts it, so it can never skip the next question.
  pendingAdvance = setTimeout(() => {
    if (step.el.classList.contains('on') && document.getElementById('vf').classList.contains('active')) window.fstNext();
  }, AUTO_ADVANCE_MS);
}

const Icon = ({name, className = ''}) => name ? <i className={`ti ti-${name} ${className}`} aria-hidden="true"/> : null;

function Help({help, open, onToggle}) {
  if (!open) return null;
  return <div className={`pop on ${help.variant}`} id={help.id}>
    <div className="ptitle">
      <span><Icon name={help.icon}/> {help.title}</span>
      <button type="button" className="pcls" onClick={onToggle} aria-label="Close"><Icon name="x"/></button>
    </div>
    <ul className="plist">{help.items.map(item => {
      const [term, detail] = Array.isArray(item) ? item : [null, item];
      return <li key={term || detail}><span className={`pdot ${help.dot}`}/>
        {term ? <span><strong>{term}</strong> — {detail}</span> : detail}</li>;
    })}</ul>
    <div className="pnote">{help.note}</div>
  </div>;
}

function Note({note, values}) {
  if (!note.when(values)) return null;
  return <div className={note.className} id={note.id} role="status">
    <Icon name={note.icon}/>{note.strong && <strong>{note.strong} </strong>}{note.text}
  </div>;
}

function ChoiceField({step, values}) {
  const {field} = step;
  const [helpOpen, setHelpOpen] = useState(false);
  const labelId = `${step.key}-label`;
  const choose = value => { setAnswer(values, field.answer, value); notify(); answered(step); };
  return <>
    <div className="irow">
      {field.label && <span className="ilbl" id={labelId}>
        <Icon name={field.icon} className="hcx-qi"/>{field.label}
        {field.help && <button type="button" className="aib" aria-expanded={helpOpen} aria-controls={field.help.id}
          aria-label={`What counts as ${field.label}`} onClick={() => setHelpOpen(!helpOpen)}>
          {field.help.trigger && <span className="hcx-help-t">{field.help.trigger}</span>}
          <span className={`ast ${field.help.dot}`}>*</span>
        </button>}
        {field.sublabel && <span className="synsub">{field.sublabel}</span>}
      </span>}
      <div className={`iyn hcx-choices${field.options.length > 2 ? ' many' : ''}`} role="group"
        aria-labelledby={field.label ? labelId : `${step.key}-intro`} data-auto-advance="">
        {field.options.map(option =>
          <button type="button" className="hcx-choice" key={option.value} id={option.id}
            data-g={field.answer} data-v={option.value} aria-pressed={values[field.answer] === option.value}
            onClick={() => choose(option.value)}>
            <Icon name={option.icon}/>{option.label}
          </button>)}
      </div>
    </div>
    {field.help && <Help help={field.help} open={helpOpen} onToggle={() => setHelpOpen(false)}/>}
    {field.note && <Note note={field.note} values={values}/>}
  </>;
}

function MultiField({step, values}) {
  const {field} = step;
  const selected = values[field.answer] || [];
  const toggle = value => { toggleAnswer(values, field.answer, value); notify(); answered(step); };
  const labelId = `${step.key}-label`;
  if (field.chips) {
    return <div className="bsubc">
      <span className="bl" id={labelId}>{field.label}</span>
      <div className="chips" role="group" aria-labelledby={labelId}>{field.options.map(option =>
        <button type="button" className="chip" key={option.value} id={option.id} data-g={field.answer} data-v={option.value}
          aria-pressed={selected.includes(option.value)} onClick={() => toggle(option.value)}>{option.label}</button>)}
      </div>
      <div className="pnote">{field.note}</div>
    </div>;
  }
  return <div className="bsubc">
    <div className="famq" id={labelId}><Icon name={field.icon}/> {field.label}</div>
    <div className="famsub">{field.hint}</div>
    <div role="group" aria-labelledby={labelId}>{field.options.map(option =>
      <button type="button" className="famopt" key={option.value} id={option.id} data-g={field.answer} data-v={option.value}
        aria-pressed={selected.includes(option.value)} onClick={() => toggle(option.value)}>
        <span className="famopt-x">
          <span className="famopt-t"><Icon name={option.icon} className="hcx-fi"/>{option.label}</span>
          <span className="famopt-d">{option.detail}</span>
        </span>
      </button>)}
    </div>
    <div className="pnote">{field.note}</div>
  </div>;
}

function TextInput({id, answer, label, values, ...props}) {
  const value = values[answer] || '';
  return <div className="blk">
    <label className="bl" htmlFor={id}>{label}</label>
    <input className={`fi${value ? ' v' : ''}`} type="text" id={id} value={value} {...props}
      onChange={event => { setAnswer(values, answer, event.target.value); notify(); window.fstSync?.(); }}/>
  </div>;
}

function NameField({values}) {
  return <>
    <TextInput id="fn" answer="name" label="First name" name="given-name" autoComplete="given-name"
      autoCapitalize="words" placeholder="First name" values={values}/>
    <TextInput id="ln" answer="lastname" label="Last name" name="family-name" autoComplete="family-name"
      autoCapitalize="words" placeholder="Last name" values={values}/>
  </>;
}

// A native select: iPhone shows its picker wheel and Android its list, with no extra code.
function AgeField({field, values}) {
  const ages = [];
  for (let age = field.min; age <= field.max; age++) ages.push(age);
  const value = values.age ? String(values.age) : '';
  return <div className="blk">
    <label className="bl" htmlFor="ag"><Icon name={field.icon} className="hcx-qi"/>{field.label}</label>
    <select className={`fi${value ? ' v' : ''}`} id="ag" name="age" value={value}
      onChange={event => { setAnswer(values, 'age', parseInt(event.target.value, 10) || 0); notify(); window.fstSync?.(); }}>
      <option value="">Select your age</option>
      {ages.map(age => <option key={age} value={age}>{age}</option>)}
    </select>
  </div>;
}

function PackYears({values}) {
  const total = window.packYears?.();
  const rounded = total === null || total === undefined ? null : Math.round(total * 10) / 10;
  return <div className="pyout" id="pyout" role="status">
    {rounded === null ? 'Enter years and packs/day to estimate pack-years'
      : <><strong>{rounded} pack-year{rounded === 1 ? '' : 's'}</strong> — used with your age and quit history to check lung screening on your results</>}
  </div>;
}

function NumberField({field, values}) {
  const value = values[field.answer] ?? '';
  return <>
    <div className="ds2col">
      <label className="dl2" htmlFor={field.id}>{field.label}</label>
      <input type="number" className={`fi smknum${value ? ' v' : ''}`} id={field.id} value={value}
        inputMode={field.inputMode} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder}
        onChange={event => { setAnswer(values, field.answer, event.target.value); notify(); window.fstSync?.(); }}/>
    </div>
    {field.packYears && <PackYears values={values}/>}
  </>;
}

const FIELDS = {name: NameField, age: AgeField, number: NumberField, choice: ChoiceField, multi: MultiField};

export function Question({step, values}) {
  const Field = FIELDS[step.field.kind];
  return <div className="hcx-question">
    {step.intro && <h2 id={`${step.key}-intro`}>{step.intro}</h2>}
    <Field step={step} field={step.field} values={values}/>
  </div>;
}

function Intake({steps}) {
  const values = useProfile();
  return <>{steps.map(step => createPortal(<Question step={step} values={values}/>, step.el, step.key))}</>;
}

let root;
// Renders every question into its step wrapper. Synchronous, so the first step can take focus straight away.
export function mountIntake(host, steps) {
  const container = document.createElement('div');
  container.hidden = true;
  host.append(container);
  root = createRoot(container);
  flushSync(() => root.render(<Intake steps={steps}/>));
}

window.HCXIntake = {
  // Re-render from S, e.g. after loading a profile, an import or a reset.
  refresh() { if (root) flushSync(notify); },
  setAnswer(key, value) { setAnswer(profile(), key, value); }
};
