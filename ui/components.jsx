import './viewport.js';
import './guided.js';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';

// Shared presentation primitives. Clinical decisions and saved state stay in the engine.
export function Button({children, className = '', ...props}) {
  return <button type="button" className={`hcx-button ${className}`} {...props}>{children}</button>;
}
export function AnswerList({answers}) {
  return <dl className="hcx-answers">{answers.map(({label, value}) =>
    <div className="hcx-answer" key={label}>
      <dt>{label}</dt><dd className={value ? '' : 'hcx-missing'}>{Array.isArray(value) ? <ul>{value.map(item => <li key={item}>{item}</li>)}</ul> : (value || 'Not answered')}</dd>
    </div>
  )}</dl>;
}
export function SectionCard({title, children, action, id}) {
  return <section className="hcx-section-card" aria-labelledby={id}>
    <div className="hcx-card-heading"><h2 id={id}>{title}</h2>{action}</div>{children}
  </section>;
}
export function Review({sections, onEdit}) {
  return <div className="hcx-review-cards">{sections.map(({title, key, answers}) =>
    <SectionCard key={key} id={`review-${key}`} title={title}
      action={<Button aria-label={`Edit ${title.toLowerCase()}`} onClick={() => onEdit(key)}>Edit <span aria-hidden="true">→</span></Button>}>
      <AnswerList answers={answers}/>
    </SectionCard>
  )}</div>;
}
// Opens the tester's email app; details are gathered at tap time so they match the current screen.
const FEEDBACK_EMAIL = 'odoogh@gmail.com';
export function feedbackHref(context) {
  const body = [
    'What happened, and what did you expect?', '', '',
    '---', `Screen: ${context.screen}`, `Device: ${context.device}`,
    `Screen size: ${context.size}`, `Page: ${context.url}`
  ].join('\n');
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('HealthyChex feedback')}&body=${encodeURIComponent(body)}`;
}
function currentScreen() {
  const step = document.querySelector('#vf.active .fstep.on');
  if (step) return step.dataset.k === 'rv' ? 'Review answers' : `Question: ${step.getAttribute('aria-label') || step.dataset.k}`;
  const view = document.querySelector('.view.active, .rw.active');
  return {vw: 'Welcome back', vf: 'Questions', vr: 'Checklist results'}[view?.id] || 'Unknown';
}
export function FeedbackLink() {
  const update = event => {
    event.currentTarget.href = feedbackHref({
      screen: currentScreen(), device: navigator.userAgent,
      size: `${window.innerWidth}×${window.innerHeight}`, url: location.href
    });
  };
  return <a className="hcx-feedback" href={`mailto:${FEEDBACK_EMAIL}`} onClick={update}>Send feedback</a>;
}
let root;
window.HCXUI = {
  renderReview(container, sections, onEdit) {
    root ||= createRoot(container);
    flushSync(() => root.render(<Review sections={sections} onEdit={onEdit}/>));
  }
};
function mountFeedback() {
  const host = document.getElementById('hcx-feedback');
  if (host) createRoot(host).render(<FeedbackLink/>);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountFeedback);
else mountFeedback();
