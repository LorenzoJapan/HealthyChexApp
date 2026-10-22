// Keep the shell within the keyboard-adjusted viewport without scrolling the logo away.
const viewport = window.visualViewport;
function fitViewport() {
  if (!viewport || viewport.scale !== 1) return; // Preserve normal pinch zoom.
  document.documentElement.style.setProperty('--hcx-viewport-height',`${viewport.height}px`);
  document.documentElement.style.setProperty('--hcx-viewport-top',`${viewport.offsetTop}px`);
  keepInputVisible();
}
function keepInputVisible() {
  const input=document.activeElement;
  if (!input?.matches('.hcx-guided-step.on input')) return;
  const screen=document.querySelector('.screen');
  const progress=document.getElementById('fprog');
  const box=input.getBoundingClientRect(), bounds=screen.getBoundingClientRect();
  const top=Math.max(bounds.top,progress.getBoundingClientRect().bottom)+16;
  const bottom=bounds.bottom-16;
  if(box.bottom>bottom)screen.scrollTop+=box.bottom-bottom;
  else if(box.top<top)screen.scrollTop-=top-box.top;
}
window.HCXFocusQuestion = step => {
  const input=step.el.querySelector('input:not([type="hidden"]):not([disabled]),select:not([disabled])');
  // Selects open the native picker rather than the keyboard.
  document.getElementById('vf').classList.toggle('hcx-input-step',!!input && input.tagName==='INPUT');
  // Run in the navigation tap's call stack, so mobile browsers can open the keyboard.
  (input || step.el).focus({preventScroll:true});
  keepInputVisible();
};
viewport?.addEventListener('resize',fitViewport);
viewport?.addEventListener('scroll',fitViewport);
window.addEventListener('resize',fitViewport);
document.addEventListener('focusin',()=>requestAnimationFrame(keepInputVisible));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fitViewport);
else fitViewport();
