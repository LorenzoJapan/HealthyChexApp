// Relocate existing controls without replacing their handlers or saved-state contract.
window.HCXGuided = {
  build(oldSteps) {
    const find = selector => document.querySelector(selector);
    const row = selector => find(selector).closest('.irow');
    const block = selector => find(selector).closest('.blk,.blkf');
    const state = () => window.S;
    const yes = key => () => state()[key] === 'yes';
    const smoking = () => ['current','former'].includes(state().tobacco);
    const required = key => () => !!state()[key];
    const steps = [];
    const host = find('.fb');
    const add = (key, section, label, nodes, complete = () => true, when = () => true, intro) => {
      const el = document.createElement('div');
      el.className = 'fstep hcx-guided-step'; el.id = 'question-'+key; el.dataset.k = key;
      const card = document.createElement('div'); card.className = 'hcx-question';
      if (intro) {const h = document.createElement('h2');h.textContent=intro;card.append(h);}
      nodes.filter(Boolean).forEach(node => card.append(node));
      el.setAttribute('role','group');
      const caption=card.querySelector('h2,.ilbl,.bl,.dl2');
      if(caption)el.setAttribute('aria-label',caption.textContent.trim());
      el.append(card); host.insertBefore(el,oldSteps.find(step=>step.k==='rv').el);
      steps.push({k:key,section,label,el,complete,when});
    };
    add('1',1,'About you',[block('#fn'),block('#ln')],undefined,undefined,'What is your name? (optional)');
    add('age',1,'About you',[block('#ag')],() => Number(find('#ag').value)>=18 && Number(find('#ag').value)<=110);
    add('sex',1,'About you',[block('#bm')],required('gender'));
    add('2',2,'Medical history',[row('#cvn'),find('#pp1')],required('cvrisk'));
    add('family',2,'Medical history',[row('#fan')],required('famcancer'));
    add('2b',2,'Medical history',[find('#famchips')],()=>state().famcancerTypes.length>0,yes('famcancer'),'Which cancers run in your family?');
    add('gene',2,'Medical history',[row('#syn'),find('#pp-syn')],required('syndrome'));
    add('2c',2,'Medical history',[find('#synchips')],()=>state().syndromeTypes.length>0,yes('syndrome'),'Which inherited cancer genes?');
    // Extract follow-up controls first so each gets its own screen.
    const years=find('#smkYears').closest('.ds2col'), packs=find('#smkPacks').closest('.ds2col'), quit=find('#smkQuitYears').closest('.ds2col');
    const amount=find('#ar .astrip'), injection=find('#ivr .ivstrip');
    add('3',3,'Lifestyle',[block('[data-g="tobacco"]')],required('tobacco'));
    add('smoke-years',3,'Lifestyle',[years],undefined,smoking,'How many years did you smoke?');
    add('smoke-packs',3,'Lifestyle',[packs,find('#pyout')],undefined,smoking,'How many packs per day?');
    add('smoke-quit',3,'Lifestyle',[quit],undefined,()=>state().tobacco==='former','How many years since you quit?');
    add('alcohol',3,'Lifestyle',[block('[data-g="alcoholyn"]')],required('alcoholyn'));
    add('alcohol-amount',3,'Lifestyle',[amount],()=>!!state().alcohol&&state().alcohol!=='none',yes('alcoholyn'),'How much alcohol do you drink?');
    add('drugs',3,'Lifestyle',[block('[data-g="drugs"]')],required('drugs'));
    add('injection',3,'Lifestyle',[injection],required('ivdrug'),yes('drugs'),'Do you inject recreational drugs?');
    const partners=find('#pf').closest('.tri');
    const unprotectedRow=find('[data-g="unprotected"]').closest('.yp').parentElement;
    const multipleRow=find('[data-g="multipartner"]').closest('.yp').parentElement;
    add('4',4,'Sexual history',[row('#sa-no')],required('sexactive'));
    add('partners',4,'Sexual history',[partners,find('#msm')],required('partnerSex'),yes('sexactive'),'Who are your sexual partners?');
    add('unprotected',4,'Sexual history',[unprotectedRow],required('unprotected'),yes('sexactive'));
    add('multiple',4,'Sexual history',[multipleRow],required('multipartner'),yes('sexactive'));
    add('prior-sti',4,'Sexual history',[row('#stn')],required('prevsti'));
    const poxRow=row('#pox-no'), poxNote=find('#pox-note');
    add('5',5,'Vaccines',[block('[data-g="childvax"]')],required('childvax'));
    add('pox',5,'Vaccines',[poxRow,poxNote],required('hadPox'));
    const review=oldSteps.find(step=>step.k==='rv');review.section=6;steps.push(review);
    // Empty reveal shells remain for existing state-reset/import handlers.
    host.classList.add('hcx-guided');
    host.addEventListener('click',()=>this.sync(steps));
    host.addEventListener('input',()=>this.sync(steps));
    this.sync(steps);
    return steps;
  },
  sync(steps) {
    document.querySelectorAll('.hcx-guided-step button').forEach(button=>{
      if (!button.matches('.ib,.yb,.ivb,.gbtn,.s3b,.ab,.tb,.chip,.famopt')) return;
      const selected = [...button.classList].some(c=>['yes','no','sel','sn','sf','sc','sl','sm','sh'].includes(c));
      button.setAttribute('aria-pressed',String(selected));
    });
  }
};
