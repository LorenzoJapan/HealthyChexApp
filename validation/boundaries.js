// Boundary unit tests for the colorectal age thresholds and (v4.2) skin / hereditary melanoma.
//
// The synthetic-patient harness (run.js) proves the app and the oracle AGREE. It cannot prove
// they agree on the RIGHT answer at an exact cut point, because a shared off-by-one would be
// concordant and silent. These tests assert the guideline's own boundaries directly, against
// both engines, so a wrong-but-agreed threshold fails here.
//
// Source: ACS 2026 (Wolf AMD, et al. CA Cancer J Clin. 2026;e70083), Table 1.
//   - begin at 45 (qualified); regular screening from 50 (strong)
//   - continue through 75 if life expectancy > 10 years
//   - individualize 76 through 85
//   - discourage continuing beyond 85
//
// Run: node boundaries.js   (exit 0 = pass, 1 = fail)

const {appEngine}=require('./appcore.js');
const {oracleEngine}=require('./oracle.js');

function patient(over){
  return Object.assign({
    gender:'F', age:50, tobacco:'none', smkYears:'', smkPacks:'', smkQuitYears:'',
    syndrome:'no', syndromeTypes:[], alcoholyn:'no', alcohol:'none', drugs:'no', ivdrug:'no',
    sexactive:'no', partnerSex:'', unprotected:'no', multipartner:'no', msm:'no', prevsti:'no',
    cvrisk:'no', famcancer:'no', famcancerTypes:[], childvax:'yes', hadPox:'yes',
    name:'', lastname:'', showRefs:false
  }, over);
}

const CRC=['crc','crcsel','crcstop','crcfh1','crcfh2','lynch','fap'];
let pass=0, fail=0;

// expect: which of the CRC codes must be present; every other CRC code must be absent.
function check(label, over, expect){
  const S=patient(over);
  [['app',appEngine],['oracle',oracleEngine]].forEach(([who,engine])=>{
    const codes=new Set(engine(patient(over)).codes);
    CRC.forEach(c=>{
      const want=expect.indexOf(c)!==-1, got=codes.has(c);
      if(want===got){pass++;}
      else{fail++;console.log(`  FAIL [${who}] ${label}: ${c} expected ${want?'present':'absent'}, got ${got?'present':'absent'}`);}
    });
  });
}

console.log('=== Colorectal boundary unit tests (ACS 2026) ===\n');

// --- start of screening: 45 ---
check('age 44 — below start',            {age:44}, []);
check('age 45 — first eligible year',    {age:45}, ['crc']);

// --- upper edge of routine screening: 75 ---
check('age 75 — last routine year',      {age:75}, ['crc']);
check('age 76 — moves to selective',     {age:76}, ['crcsel']);

// --- upper edge of selective screening: 85 (the threshold added in v4.1.1) ---
check('age 85 — last selective year',    {age:85}, ['crcsel']);
check('age 86 — discourage',             {age:86}, ['crcstop']);
check('age 95 — still discourage',       {age:95}, ['crcstop']);

// --- the discourage card must never coexist with the selective card ---
check('age 86 — selective must be gone', {age:86}, ['crcstop']);

// --- syndrome carriers are lifelong surveillance, not average-risk screening ---
check('Lynch at 86 — no average-risk card', {age:86, syndrome:'yes', syndromeTypes:['lynch']}, ['lynch']);
check('FAP at 86 — no average-risk card',   {age:86, syndrome:'yes', syndromeTypes:['fap']},   ['fap']);
check('Lynch at 80 — no selective card',    {age:80, syndrome:'yes', syndromeTypes:['lynch']}, ['lynch']);

// --- family-history pathway ends at 75; a family-history patient over 85 still gets the stop card ---
check('FDR dx >=60, age 44 — early start', {age:44, famcancer:'yes', famcancerTypes:['crc1']}, ['crcfh1']);
check('FDR dx <60, age 44 — colonoscopy',  {age:44, famcancer:'yes', famcancerTypes:['crc2']}, ['crcfh2']);
check('family hx at 86 — discourage',      {age:86, famcancer:'yes', famcancerTypes:['crc1']}, ['crcstop']);

// --- Skin / hereditary melanoma (v4.2) ---
// Sources: USPSTF 2023 skin cancer screening (Grade I) — applies only to adults WITHOUT a personal
// or family history of skin cancer; Leachman et al., JAAD 2009 — genetic assessment when >=3
// melanoma/pancreatic cancers on one side of the family (U.S. criteria).
const SKIN=['skin','skinfh','melgen'];
function checkSkin(label, over, expect){
  [['app',appEngine],['oracle',oracleEngine]].forEach(([who,engine])=>{
    const codes=new Set(engine(patient(over)).codes);
    SKIN.forEach(c=>{
      const want=expect.indexOf(c)!==-1, got=codes.has(c);
      if(want===got){pass++;}
      else{fail++;console.log(`  FAIL [${who}] ${label}: ${c} expected ${want?'present':'absent'}, got ${got?'present':'absent'}`);}
    });
  });
}
console.log('\n=== Skin / hereditary melanoma boundary tests (USPSTF 2023, Leachman 2009) ===\n');
const mel=(types,extra)=>Object.assign({famcancer:'yes',famcancerTypes:types},extra||{});
checkSkin('age 19, no family hx — below start',          {age:19}, []);
checkSkin('age 20, no family hx — average-risk card',    {age:20}, ['skin']);
checkSkin('age 19, FDR melanoma — below start',          mel(['mel1'],{age:19}), []);
checkSkin('age 20, FDR melanoma — family-hx card only',  mel(['mel1'],{age:20}), ['skinfh']);
checkSkin('age 70 man, FDR melanoma — not sex-gated',    mel(['mel1'],{age:70,gender:'M'}), ['skinfh']);
checkSkin('3+ relatives — family-hx card + genetics',    mel(['mel2'],{age:45}), ['skinfh','melgen']);
checkSkin('both tiers — one skin card, one referral',    mel(['mel1','mel2'],{age:45}), ['skinfh','melgen']);
checkSkin('3+ relatives at 19 — referral is not age-gated', mel(['mel2'],{age:19}), ['melgen']);
checkSkin('other family cancer only — average-risk card', mel(['breast'],{age:45}), ['skin']);

console.log(`\n${pass} assertions passed, ${fail} failed.`);
if(fail){ console.log('BOUNDARY TESTS FAILED'); process.exitCode=1; }
else console.log('ALL BOUNDARY TESTS PASSED');
