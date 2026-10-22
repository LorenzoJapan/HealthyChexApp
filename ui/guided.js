// One question per screen. The engine's stepper (goStep/fstNext) moves between these wrappers;
// React renders the question inside each one from the answers in S.
import {STEPS} from './intake/schema.js';
import {mountIntake} from './intake/Intake.jsx';

const SECTIONS = ['About you', 'Medical history', 'Lifestyle', 'Sexual history', 'Vaccines'];

function hintFor(step) {
  if (step.optional) return 'Optional — if you are unsure, choose Next.';
  if (step.field.kind === 'age') return 'Choose your age from the list.';
  if (step.field.kind !== 'choice') return 'Choose an answer, then tap Next.';
  const yesNo = step.field.options.map(option => option.value).join() === 'no,yes';
  return yesNo ? 'Choose Yes or No to continue.' : 'Choose an answer to continue.';
}

window.HCXGuided = {
  build(oldSteps) {
    const host = document.querySelector('.fb');
    const review = oldSteps.find(step => step.k === 'rv');
    const rendered = STEPS.map(step => {
      const el = document.createElement('div');
      el.className = 'fstep hcx-guided-step'; el.id = 'question-'+step.key; el.dataset.k = step.key;
      el.setAttribute('role', 'group');
      el.setAttribute('aria-label', step.field.label || step.intro);
      host.insertBefore(el, review.el);
      return {...step, el};
    });
    host.classList.add('hcx-guided');
    mountIntake(host, rendered);
    const steps = rendered.map(step => ({
      k: step.key, label: step.section, section: SECTIONS.indexOf(step.section)+1, el: step.el,
      hint: hintFor(step),
      complete: () => step.complete(window.S), when: () => step.when(window.S)
    }));
    review.section = SECTIONS.length+1;
    return [...steps, review];
  }
};
