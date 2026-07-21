// Independent oracle: eligibility derived from USPSTF / ACIP / ACS / AHA-ACC / ADA
// definitions, formulated separately from the app's internal boolean expressions.
function oracleEngine(S){
  const a=S.age, g=S.gender, yes=v=>v==='yes';
  const E=[];
  const everSmoke = S.tobacco!=='none';
  const curOrFormer = S.tobacco==='current'||S.tobacco==='former';
  const fam = t => S.famcancerTypes.indexOf(t)!==-1;
  const heavy = S.alcohol==='heavy';
  const mod = S.alcohol==='moderate' && yes(S.alcoholyn);
  const birthYr = (new Date().getFullYear()) - a;
  const inc = S.childvax==='partial' || S.childvax==='no';

  // Independent sexual-risk model (CDC/USPSTF increased-risk criteria)
  const lowRiskMonog = (S.partnerSex==='female' && !yes(S.multipartner) && !yes(S.prevsti));
  const multiUnprot  = yes(S.multipartner) && yes(S.unprotected);
  const hivElevated  = yes(S.msm) || yes(S.ivdrug) || multiUnprot || (yes(S.prevsti) && !lowRiskMonog);
  const hcvElevated  = yes(S.ivdrug) || (yes(S.msm)&&yes(S.unprotected)) || multiUnprot;
  const stiRisk      = yes(S.msm) || multiUnprot || (yes(S.prevsti) && !lowRiskMonog);
  const prepInd      = yes(S.msm) || yes(S.ivdrug) || multiUnprot || (yes(S.prevsti)&&yes(S.unprotected)&&!lowRiskMonog);
  const menbInd      = yes(S.msm) || multiUnprot || yes(S.prevsti);

  // HEALTH
  E.push('bp'); E.push('bmi');
  if(a>=20) E.push('chol');                       // AHA/ACC (cited standard)
  if(a>=35 || yes(S.cvrisk)) E.push('dm');        // ADA: 35, earlier with risk
  if(g==='F'&&a>=65) E.push('dxa');               // USPSTF women >=65
  if(g==='M'&&a>=65&&a<=75&&everSmoke) E.push('aaa');
  E.push('dep');
  if(a<=64) E.push('anx');                        // USPSTF 19-64 (I at >=65)
  if(a>=20) E.push('eye');                        // AAO PPP periodic
  if(a>=50) E.push('hear');
  if(a>=20) E.push('skin');

  // LIFESTYLE
  if(everSmoke) E.push('tob');
  if(heavy) E.push('alc'); else if(mod) E.push('alcmon');
  if(yes(S.drugs)) E.push('drug');
  E.push('mvs');
  if(yes(S.sexactive)) E.push('sex');
  if(prepInd) E.push('prep');
  if((g==='F'&&a<25&&yes(S.sexactive)) || stiRisk) E.push('sti');   // USPSTF women<25 + increased-risk
  if(stiRisk || yes(S.ivdrug)) E.push('syph');  // corrected: IDU is an independent syphilis risk factor (USPSTF/CDC)
  if(a>=18&&a<=79) E.push('hcv');                 // USPSTF 18-79 once; annual if ongoing risk
  if(a>=15&&a<=65) E.push('hiv');                 // USPSTF 15-65 once; annual if elevated risk

  // CANCER
  if(g==='F'&&a>=21&&a<=29) E.push('cerv1');
  if(g==='F'&&a>=30&&a<=65) E.push('cerv2');
  if(g==='F'&&a>=40&&a<=74) E.push(fam('breast')?'breastfh':'breast');
  if(g==='F'&&a>=75) E.push('breast75');
  // BRCA risk assessment: family hx of breast/ovarian cancer. NOT sex-gated —
  // BRCA1/2 is autosomal dominant, so men are equally likely to carry a variant (NCCN).
  // (USPSTF Grade B is scoped to women; men are covered by NCCN. Grading differs, presence does not.)
  if(fam('breast')||fam('ovarian')) E.push('brca');
  if(fam('ovarian')&&g==='F') E.push('ovarian');
  // Known syndromes (NCCN). Lynch/FAP override average-risk AND family-hx colorectal pathways.
  const sy=(t)=>S.syndrome==='yes'&&(S.syndromeTypes||[]).indexOf(t)!==-1;
  if(sy('brca')) E.push('brcaknown');
  if(sy('lynch')){ E.push('lynch'); if(g==='F') E.push('lynchendo'); }
  if(sy('fap')) E.push('fap');
  const crcOverridden = sy('lynch')||sy('fap');
  // Colorectal family history (ACG 2021):
  //   one FDR dx >=60            -> start at 40, usual modality/interval   -> crcfh1
  //   FDR dx <60 OR >=2 FDRs     -> colonoscopy from 40, every 5 yrs       -> crcfh2
  const crcFamHx = fam('crc1')||fam('crc2');
  if(!crcOverridden){
    if(crcFamHx && a>=40 && a<=75) E.push(fam('crc2')?'crcfh2':'crcfh1');
    else if(a>=45 && a<=75) E.push('crc');
    if(a>=76 && a<=85) E.push('crcsel');
  }
  if(g==='M'&&a>=40&&a<=69){ if(fam('prostate')) E.push('psafh'); else if(a>=55&&a<=69) E.push('psa'); }
  // USPSTF 2021 LDCT: age 50-80, >=20 pack-years, current smoker or quit <=15 yrs.
  // Pack-years = years smoked * packs/day. Independent derivation from raw fields.
  const py = (function(){const y=parseFloat(S.smkYears), p=parseFloat(S.smkPacks);
    return (isFinite(y)&&isFinite(p)&&y>=0&&p>=0) ? y*p : null;})();
  const quitYrs = (function(){const q=parseFloat(S.smkQuitYears); return (isFinite(q)&&q>=0)?q:null;})();
  const ageBand = a>=50&&a<=80;
  const withinQuit = S.tobacco==='current' || (S.tobacco==='former' && (quitYrs===null || quitYrs<=15));
  const tooLongQuit = S.tobacco==='former' && quitYrs!==null && quitYrs>15;
  if(curOrFormer && ageBand){
    if(py!==null && py>=20 && withinQuit && !tooLongQuit) E.push(fam('lung')?'lungfh':'lung');
    else E.push('lungc'); // detail-missing, below-threshold, or quit-too-long all surface as lungc
  } else if(fam('lung')) E.push('lungc');

  // VACCINES
  E.push('vflu');
  if(a>=75 || (a>=50&&a<=74&&yes(S.cvrisk))) E.push('vrsv');
  E.push('vcovid');
  E.push('vtdap');
  if(a>=50) E.push('vshin');
  if(a>=50 || yes(S.cvrisk)) E.push('vpneu');
  if(a<=26) E.push('vhpv');
  if(a>=27&&a<=45) E.push('vhpvs');
  if(inc && S.hadPox!=='yes' && birthYr>=1980) E.push('vvzv');
  E.push('vhepb');                                // emitted in some form for everyone
  if(inc || yes(S.ivdrug) || heavy || yes(S.msm)) E.push('vhepa');
  if(inc && birthYr>=1957) E.push('vmmr');
  if(inc) E.push('vpolio');
  if(menbInd) E.push('vmenb');
  if(inc) E.push('vmenacwy');

  // expected flags for the two risk-aware screens (one-time 'o' vs annual 'a')
  const flags={};
  if(a>=18&&a<=79) flags['hcv']= hcvElevated?'a':'o';
  if(a>=15&&a<=65) flags['hiv']= hivElevated?'a':'o';
  return {codes:E, flags:flags};
}
module.exports={oracleEngine};
