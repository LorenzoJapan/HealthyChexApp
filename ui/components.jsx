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
let root;
window.HCXUI = {
  renderReview(container, sections, onEdit) {
    root ||= createRoot(container);
    flushSync(() => root.render(<Review sections={sections} onEdit={onEdit}/>));
  }
};
