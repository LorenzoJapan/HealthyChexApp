const {appEngine}=require('./appcore.js');
const {oracleEngine}=require('./oracle.js');

// ---- seeded RNG (mulberry32) for reproducibility ----
function mulberry32(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rnd=mulberry32(parseInt(process.env.SEED||"20260622"));
const pick=arr=>arr[Math.floor(rnd()*arr.length)];
const chance=p=>rnd()<p;

// Spread ages across all guideline boundaries + random fill
const boundaryAges=[18,19,20,21,25,26,27,29,30,34,35,39,40,44,45,49,50,54,55,60,64,65,66,69,70,74,75,76,79,80,84,85,90];
function genPatient(i){
  let age;
  if(i<boundaryAges.length) age=boundaryAges[i];
  else age=18+Math.floor(rnd()*73); // 18-90
  const gender=pick(['M','F']);
  const tobacco=pick(['none','none','former','current']);
  // Smoking detail — spread across the >=20 pack-year and 15-year-quit boundaries.
  let smkYears='', smkPacks='', smkQuitYears='';
  if(tobacco==='former'||tobacco==='current'){
    // years: 0,5,10,20,30,40; packs: 0.25,0.5,0.75,1,1.5,2 → pack-years straddle 20
    smkYears=String(pick([5,10,12,15,20,25,30,40]));
    smkPacks=String(pick([0.25,0.5,0.75,1,1,1.5,2]));
    // occasionally leave detail blank to exercise the "missing detail" path
    if(chance(0.12)){ smkYears=''; smkPacks=''; }
    if(tobacco==='former'){
      smkQuitYears=String(pick([1,3,5,10,14,15,16,20,25])); // straddles the 15-yr cutoff
    }
  }
  const alcoholyn=chance(0.55)?'yes':'no';
  let alcohol='none';
  if(alcoholyn==='yes') alcohol=pick(['moderate','moderate','heavy']);
  const drugs=chance(0.15)?'yes':'no';
  const ivdrug=(drugs==='yes'&&chance(0.4))?'yes':'no';
  const sexactive=chance(0.7)?'yes':'no';
  let partnerSex='', msm='no';
  if(sexactive==='yes'){
    partnerSex=pick(['male','female','both']);
    if(gender==='M' && (partnerSex==='male'||partnerSex==='both')) msm=chance(0.85)?'yes':'no';
  }
  const unprotected=(sexactive==='yes'&&chance(0.45))?'yes':'no';
  const multipartner=(sexactive==='yes'&&chance(0.35))?'yes':'no';
  const prevsti=chance(0.18)?'yes':'no';
  const cvrisk=chance(0.4)?'yes':'no';
  const famcancer=chance(0.45)?'yes':'no';
  let famcancerTypes=[];
  if(famcancer==='yes'){
    ['breast','ovarian','lung','prostate'].forEach(t=>{ if(chance(0.3)) famcancerTypes.push(t); });
    // colorectal family history: the two tiers are mutually exclusive in the UI
    if(chance(0.3)) famcancerTypes.push(chance(0.5)?'crc1':'crc2');
    if(famcancerTypes.length===0) famcancerTypes.push(pick(['breast','lung','prostate','crc1','crc2']));
  }
  const childvax=pick(['yes','yes','partial','no']);
  const hadPox=chance(0.5)?'yes':'no';
  const syndrome=chance(0.18)?'yes':'no';
  let syndromeTypes=[];
  if(syndrome==='yes'){
    ['brca','lynch','fap'].forEach(t=>{ if(chance(0.45)) syndromeTypes.push(t); });
    if(syndromeTypes.length===0) syndromeTypes.push(pick(['brca','lynch','fap']));
  }
  return {gender,tobacco,smkYears,smkPacks,smkQuitYears,syndrome,syndromeTypes,alcoholyn,alcohol,drugs,ivdrug,sexactive,partnerSex,unprotected,multipartner,msm,prevsti,cvrisk,famcancer,famcancerTypes,childvax,hadPox,age,name:'',lastname:'',showRefs:false};
}

const patients=[]; const N=parseInt(process.env.N||"100");for(let i=0;i<N;i++) patients.push(genPatient(i));

// ---- run both engines ----
const universe=new Set();
const rows=patients.map(S=>{
  const app=appEngine(S), ora=oracleEngine(S);
  const aset=new Set(app.codes), oset=new Set(ora.codes);
  app.codes.forEach(c=>universe.add(c)); ora.codes.forEach(c=>universe.add(c));
  return {S,app,ora,aset,oset};
});
const codes=[...universe].sort();

// ---- presence concordance: 100 patients x |codes| decisions ----
let total=0, match=0;
const perCode={}; codes.forEach(c=>perCode[c]={n:0,m:0,appOnly:0,oraOnly:0});
const mismatches=[];
rows.forEach((r,idx)=>{
  codes.forEach(c=>{
    const ah=r.aset.has(c), oh=r.oset.has(c);
    total++; perCode[c].n++;
    if(ah===oh){match++; perCode[c].m++;}
    else{
      if(ah&&!oh) perCode[c].appOnly++; else perCode[c].oraOnly++;
      mismatches.push({p:idx,age:r.S.age,sex:r.S.gender,code:c,app:ah,oracle:oh});
    }
  });
});

// ---- flag-level check for hcv/hiv (one-time vs annual) ----
let flagTot=0, flagMatch=0; const flagMis=[];
rows.forEach((r,idx)=>{
  ['hcv','hiv'].forEach(c=>{
    if(r.ora.flags[c]!==undefined && r.app.flags[c]!==undefined){
      flagTot++;
      if(r.ora.flags[c]===r.app.flags[c]) flagMatch++;
      else flagMis.push({p:idx,age:r.S.age,code:c,app:r.app.flags[c],oracle:r.ora.flags[c]});
    }
  });
});

// ---- audit: documented divergences from OTHER guideline bodies ----
let cholOutsideUSPSTF=0, hearGradeI=0;
rows.forEach(r=>{
  const a=r.S.age;
  if(r.aset.has('chol') && (a<40||a>75)) cholOutsideUSPSTF++;
  if(r.aset.has('hear')) hearGradeI++;
});

// ---- report ----
console.log('=== HealthyChex v4.0 — Synthetic-Patient Validation ===');
console.log('Patients: '+N+'  (seeded, reproducible) | Recommendation types: '+codes.length);
console.log('Total patient-by-recommendation decisions: '+total);
console.log('Concordance (presence): '+match+'/'+total+' = '+(100*match/total).toFixed(2)+'%');
const perfect=codes.filter(c=>perCode[c].m===perCode[c].n).length;
console.log('Recommendation types perfectly concordant: '+perfect+'/'+codes.length);
console.log('hcv/hiv recurrence-flag concordance: '+flagMatch+'/'+flagTot+' = '+(100*flagMatch/flagTot).toFixed(2)+'%');
console.log('');
console.log('--- Per-type disagreements (only types with any mismatch) ---');
let any=false;
codes.forEach(c=>{const p=perCode[c];if(p.m!==p.n){any=true;console.log(`  ${c}: ${p.n-p.m} mismatch (app-only ${p.appOnly}, oracle-only ${p.oraOnly})`);}});
if(!any) console.log('  NONE — every recommendation type is 100% concordant.');
if(flagMis.length){console.log('\n--- hcv/hiv flag mismatches ---');flagMis.slice(0,20).forEach(m=>console.log(`  patient#${m.p} age${m.age} ${m.code}: app=${m.app} oracle=${m.oracle}`));}
console.log('\n--- Sample mismatch detail (first 15) ---');
mismatches.slice(0,15).forEach(m=>console.log(`  patient#${m.p} age${m.age} ${m.sex} ${m.code}: app=${m.app} oracle=${m.oracle}`));
console.log('\n--- Documented divergences from OTHER guideline bodies (expected, not errors) ---');
console.log(`  Cholesterol fired outside USPSTF statin window (age <40 or >75): ${cholOutsideUSPSTF} patient(s) — app follows AHA/ACC >=20 by design.`);
console.log(`  Hearing screen fired (USPSTF grades this 'I'/insufficient): ${hearGradeI} patient(s) — app offers it >=50 by design.`);

// demographic sanity
const fem=patients.filter(p=>p.gender==='F').length;
const smk=patients.filter(p=>p.tobacco!=='none').length;
const inc=patients.filter(p=>p.childvax!=='yes').length;
const old75=patients.filter(p=>p.age>=75).length;
console.log('\n--- Cohort sanity ---');
console.log(`  Female ${fem} | Male ${100-fem} | Ever-smokers ${smk} | Incomplete/unknown childhood vax ${inc} | Age>=75 ${old75}`);

// ---- RULES drift check: the app HTML and appcore.js must carry identical thresholds ----
// appcore.js is a hand-maintained mirror of the engine in the HTML, so it can silently drift.
// The thresholds are pure data, so we can at least prove THOSE match. If this fails, the
// harness is validating a rule-set the shipped app does not use.
(function(){
  const fs=require('fs'), path=require('path');
  const dirs=[__dirname, path.join(__dirname,'..'), process.cwd()];
  let html=null, found=null;
  for(const d of dirs){
    let names=[];
    try{ names=fs.readdirSync(d).filter(f=>/\.html$/i.test(f)); }catch(e){ continue; }
    for(const n of names){
      const t=fs.readFileSync(path.join(d,n),'utf8');
      if(t.indexOf('var RULES=')>-1){ html=t; found=path.join(d,n); break; }
    }
    if(html) break;
  }
  if(!html){ console.log('\n--- RULES drift check ---\n  SKIPPED — no app HTML found alongside the harness.'); return; }
  const m=html.match(/var RULES=(\{[\s\S]*?\n\});/);
  const appRules=eval('('+m[1]+')');
  const coreRules=require('./appcore.js').RULES;
  const a=JSON.stringify(appRules), b=JSON.stringify(coreRules);
  console.log('\n--- RULES drift check ---');
  console.log('  app HTML : '+path.basename(found)+'  (rules v'+appRules._version+')');
  if(a===b){ console.log('  MATCH — appcore.js thresholds are identical to the shipped app.'); }
  else{
    console.log('  *** DRIFT *** appcore.js thresholds differ from the app. The harness is validating stale rules.');
    Object.keys(Object.assign({},appRules,coreRules)).forEach(k=>{
      const x=JSON.stringify(appRules[k]), y=JSON.stringify(coreRules[k]);
      if(x!==y) console.log('    '+k+': app='+x+'  appcore='+y);
    });
    process.exitCode=1;
  }
})();
