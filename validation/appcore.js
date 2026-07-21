// AUTO-EXTRACTED verbatim from index.html engine decision block. Not retyped.
var RULES={
  _version:'2026-07-17',
  _note:'Every clinical threshold the engine reads, in one place. These are DATA, read by fixed logic \u2014 never expressions the app evaluates. Update a guideline here, not in gen(). The oracle in validation/oracle.js deliberately does NOT read this object: it hardcodes the thresholds independently from the guideline text, so a typo here is caught by the harness rather than silently agreed with.',
  chol:{start:20},
  dm:{start:35},
  dxa:{femaleStart:65},
  aaa:{start:65,stop:75},
  anx:{stop:64},
  eye:{start:20},
  hear:{start:50},
  skin:{start:20},
  hcv:{start:18,stop:79},
  hiv:{start:15,stop:65},
  cerv1:{start:21,stop:29},
  cerv2:{start:30,stop:65},
  breast:{start:40,stop:74},
  breast75:{start:75},
  crc:{start:45,stop:75},
  crcsel:{start:76,stop:85},
  crcFam:{start:40,stop:75},
  crcGradeA:{start:50},
  psa:{start:55,stop:69},
  psaBlock:{start:40,stop:69},
  ldct:{ageMin:50,ageMax:80,packYears:20,quitYrs:15},
  vflu:{highDose:65},
  vrsv:{routine:75,riskStart:50},
  vcovid:{older:65},
  vshin:{start:50},
  vpneu:{start:50},
  vhpv:{stop:26},
  vhpvs:{start:27,stop:45}
};
var S;
function hc(t){return S.famcancerTypes.indexOf(t)!==-1;}
function hs(t){return S.syndrome==='yes'&&(S.syndromeTypes||[]).indexOf(t)!==-1;}
function appEngine(s){
  S=s;
  var a=S.age,g=S.gender,heavy=S.alcohol==='heavy',anyAlc=S.alcoholyn==='yes',inc=S.childvax==='partial'||S.childvax==='no';
  var birthYr=(new Date().getFullYear())-a;
  var fB=hc('breast'),fO=hc('ovarian'),fL=hc('lung'),fP=hc('prostate');
  var fC1=hc('crc1'),fC2=hc('crc2');
  var syB=hs('brca'),syL=hs('lynch'),syF=hs('fap');
  var crcSyn=(syL||syF);
  var crcFam=(!crcSyn)&&(fC1||fC2)&&a>=RULES.crcFam.start&&a<=RULES.crcFam.stop;
  var mono=(S.partnerSex==='female'&&S.multipartner==='no'&&S.prevsti==='no'),msm=(S.msm==='yes');
  var prep=msm||S.ivdrug==='yes'||(S.multipartner==='yes'&&S.unprotected==='yes')||(S.prevsti==='yes'&&S.unprotected==='yes'&&!mono);
  var syph=msm||S.ivdrug==='yes'||(S.multipartner==='yes'&&S.unprotected==='yes')||(S.prevsti==='yes'&&!mono);
  var chlam=(g==='F'&&a<25&&S.sexactive==='yes')||msm||(S.multipartner==='yes'&&S.unprotected==='yes')||(S.prevsti==='yes'&&!mono);
  var hcvHi=S.ivdrug==='yes'||(msm&&S.unprotected==='yes')||(S.multipartner==='yes'&&S.unprotected==='yes');
  var hivHi=msm||S.ivdrug==='yes'||(S.multipartner==='yes'&&S.unprotected==='yes')||(S.prevsti==='yes'&&!mono);
  var menB=msm||(S.multipartner==='yes'&&S.unprotected==='yes')||S.prevsti==='yes';
  var H=[],L=[],C=[],V=[];
  H.push({c:'bp',t:'Blood pressure check',d:'Yearly for all adults ≥18. Target <130/80 mmHg.',f:'a',refs:['uspstf-bp']});
  H.push({c:'bmi',t:'Height & weight (BMI)',d:'BMI at every routine visit.',f:'a',refs:['uspstf-bmi']});
  if(a>=RULES.chol.start)H.push({c:'chol',t:'Cholesterol panel',d:S.cvrisk==='yes'?'Every 1–3 yrs given CV risk factors.':'Every 5 yrs if low CV risk.',f:'r',refs:['ahaacc-chol']});
  if(a>=RULES.dm.start||S.cvrisk==='yes')H.push({c:'dm',t:'Diabetes / prediabetes screen',d:'Fasting glucose or HbA1c, every 3 yrs if normal. ADA: screen all adults from age 35; earlier if overweight/obese with a risk factor.',f:'r',refs:['uspstf-dm']});
  if(g==='F'&&a>=RULES.dxa.femaleStart)H.push({c:'dxa',t:'Bone density scan (DXA)',d:'Osteoporosis screening for women ≥65 or postmenopausal women <65 with increased risk.',f:'o',refs:['uspstf-dexa']});
  if(g==='M'&&a>=RULES.aaa.start&&a<=RULES.aaa.stop&&S.tobacco!=='none')H.push({c:'aaa',t:'Abdominal aortic aneurysm ultrasound',d:'One-time screen for men 65–75 who have ever smoked.',f:'o',refs:['uspstf-aaa']});
  H.push({c:'dep',t:'Depression screening',d:'Screen all adults ≥18. PHQ instrument recommended.',f:'a',refs:['uspstf-dep']});
  if(a<=RULES.anx.stop)H.push({c:'anx',t:'Anxiety screening',d:'Recommended for adults ≤64.',f:'a',refs:['uspstf-anx']});
  if(a>=20){var ef=a<40?'Once in your 20s, twice in your 30s':a<55?'Every 2–4 yrs':a<65?'Every 1–3 yrs':'Every 1–2 yrs';H.push({c:'eye',t:'Eye exam',d:ef+'. More frequent with diabetes or hypertension.',f:'r',refs:['aao-eye']});}
  if(a>=RULES.hear.start)H.push({c:'hear',t:'Hearing evaluation',d:'Yearly audiology screen from age 50.',f:'a',refs:['uspstf-hear']});
  if(a>=RULES.skin.start)H.push({c:'skin',t:'Full-body skin exam',d:'Yearly clinical skin check for suspicious lesions.',f:'a',refs:['aad-skin']});
  if(S.tobacco!=='none')L.push({c:'tob',t:'Tobacco cessation counseling',d:'Behavioral interventions + pharmacotherapy (varenicline, NRT, bupropion).',f:'a',refs:['uspstf-tob']});
  if(heavy)L.push({c:'alc',t:'Alcohol use counseling',d:'Brief counseling for hazardous drinking. AUDIT screening.',f:'a',refs:['uspstf-alc']});
  else if(anyAlc&&S.alcohol==='moderate')L.push({c:'alcmon',t:'Alcohol use — monitoring',d:'Moderate use noted. AUDIT-C screening recommended.',f:'r',refs:['uspstf-alc']});
  if(S.drugs==='yes')L.push({c:'drug',t:'Drug use counseling',d:'Brief counseling; referral if indicated.',f:'a',refs:['uspstf-drug']});
  L.push({c:'mvs',t:'Motor vehicle safety',d:'100% seatbelt use; no alcohol while driving.',f:'r',refs:['cdc-mvs']});
  if(S.sexactive==='yes')L.push({c:'sex',t:'Sexual health counseling',d:'Safer sex practices, contraception, and sexually transmitted infection (STI) prevention.',f:'r',refs:['uspstf-sex']});
  if(prep)L.push({c:'prep',t:'PrEP (HIV pre-exposure prophylaxis)',d:'Indicated for MSM, IV drug users, or multiple unprotected partners.',f:'a',refs:['cdc-prep']});
  if(chlam)L.push({c:'sti',t:'Sexually Transmitted Infection (STI) screen — chlamydia & gonorrhea',d:(g==='F'&&a<25&&!hivHi)?'Yearly NAAT — all sexually active women under 25.':'Yearly NAAT. Every 3–6 months if MSM.',f:'a',refs:['uspstf-chlamydia','cdc-sti']});
  if(syph)L.push({c:'syph',t:'Syphilis screening',d:msm?'Yearly RPR/VDRL. Every 3–6 months if MSM.':'Yearly RPR/VDRL.',f:'a',refs:['uspstf-syph']});
  if(a>=RULES.hcv.start&&a<=RULES.hcv.stop)L.push({c:'hcv',t:'Hepatitis C (HCV) screening',d:hcvHi?'Yearly HCV antibody test.':'At least one HCV test for all adults 18–79. No repeat needed unless new risk factors arise.',f:hcvHi?'a':'o',rec:hcvHi?12:null,sched:hcvHi?'Yearly (high HCV risk)':'One-time for all adults 18–79 (repeat only if new risk factors)',refs:['uspstf-hcv']});
  if(a>=RULES.hiv.start&&a<=RULES.hiv.stop)L.push({c:'hiv',t:'HIV screening',d:hivHi?'Yearly HIV test — elevated risk.':'At least one HIV test for all adults 15–65. No repeat needed unless new risk factors arise.',f:hivHi?'a':'o',rec:hivHi?12:null,sched:hivHi?'Yearly (elevated HIV risk)':'One-time for all adults 15–65 (repeat only if new risk factors)',refs:['uspstf-hiv']});
  if(g==='F'&&a>=RULES.cerv1.start&&a<=RULES.cerv1.stop)C.push({c:'cerv1',t:'Cervical cancer — Pap smear',d:'Cervical cytology every 3 yrs (ages 21–29).',f:'r',refs:['uspstf-cerv']});
  if(g==='F'&&a>=RULES.cerv2.start&&a<=RULES.cerv2.stop)C.push({c:'cerv2',t:'Cervical cancer — HPV primary screening',d:'<strong>Preferred (ACS 2025):</strong> primary hrHPV testing every 5 years. Acceptable alternatives: cytology alone every 3 years, or hrHPV + cytology co-test every 5 years. Self-collected hrHPV is an acceptable option — repeat every 3 years if HPV-negative. May exit screening after age 65 with adequate prior screening.',f:'r',refs:['acs-cervical-2025']});
  if(g==='F'&&a>=RULES.breast.start&&a<=RULES.breast.stop){var bd=fB?'Family hx: discuss starting mammography at age 40 (or earlier) and yearly screening. Discuss BRCA testing.':'USPSTF 2024 (Grade B): biennial (every 2 years) screening mammography for all women 40–74.';C.push({c:(fB?'breastfh':'breast'),t:'Breast cancer — mammogram'+(fB?' (family hx)':''),d:bd,f:'r',refs:fB?['uspstf-breast','nccn-breast']:['uspstf-breast']});}
  if(g==='F'&&a>=RULES.breast75.start)C.push({c:'breast75',t:'Breast cancer — mammogram (age ≥75)',d:'USPSTF 2024: evidence insufficient to assess benefit vs. harm of screening at age ≥75 (Grade I). Decide individually based on health status, life expectancy, and preferences.',f:'s',refs:['uspstf-breast']});
  if(fB||fO)C.push({c:'brca',t:'BRCA genetic risk assessment',d:'Family hx of breast or ovarian cancer. Discuss genetic counseling.',f:'s',refs:['uspstf-brca','nccn-breast']});
  if(fO&&g==='F')C.push({c:'ovarian',t:'Ovarian cancer — genetic counseling',d:'No routine screen. Family hx warrants BRCA testing + oncology referral.',f:'s',refs:['uspstf-ovarian','nccn-breast']});
  if(syB)C.push({c:'brcaknown',t:'BRCA1/2 — genetics-managed surveillance',d:'',f:'s',refs:['nccn-brca']});
  if(syL){
    C.push({c:'lynch',t:'Lynch syndrome — colonoscopy every 1–2 years',d:'',f:'a',refs:['nccn-lynch']});
    if(g==='F')C.push({c:'lynchendo',t:'Lynch syndrome — endometrial surveillance',d:'',f:'s',refs:['nccn-lynch']});
  }
  if(syF)C.push({c:'fap',t:'Familial adenomatous polyposis (FAP) — genetics-managed surveillance',d:'',f:'s',refs:['nccn-fap']});
  if(crcFam&&fC2)C.push({c:'crcfh2',t:'Colorectal cancer — colonoscopy (high-risk family history)',d:'',f:'a',refs:['acg-crc-fh']});
  if(crcFam&&!fC2)C.push({c:'crcfh1',t:'Colorectal cancer — start at 40 (family history)',d:'',f:'a',refs:['acg-crc-fh']});
  if(!crcSyn&&!crcFam&&a>=RULES.crc.start&&a<=RULES.crc.stop)C.push({c:'crc',t:'Colorectal cancer screening',d:'ACS 2026: Average-risk adults 45–75. Preferred stool-based: FIT yearly · gFOBT yearly · mt-sDNA (Cologuard/Cologuard Plus) every 3 yrs · mt-sRNA (ColoSense) every 3 yrs. Preferred structural: Colonoscopy every 10 yrs · CT colonography every 5 yrs · Flex sigmoidoscopy every 5 yrs. Blood-based cfDNA (Guardant Shield) every 3 yrs — rescue option only if patient declines preferred tests. Any positive non-colonoscopy test requires follow-up colonoscopy within 6 months.',f:'r',refs:['acs-crc-2026']});
  if(!crcSyn&&a>=RULES.crcsel.start&&a<=RULES.crcsel.stop)C.push({c:'crcsel',t:'Colorectal cancer (selective 76–85)',d:'ACS 2026: Individualize screening decisions for adults 76–85 based on patient preferences, life expectancy, health status, and prior screening history. Same modalities as 45–75 group apply if screening is offered. Blood-based tests have lower specificity in older adults — weigh harms carefully. Screening is discouraged in adults >85 or life expectancy <10 years.',f:'s',refs:['acs-crc-2026']});
  if(g==='M'&&a>=RULES.psaBlock.start&&a<=RULES.psaBlock.stop){if(fP&&a>=RULES.psaBlock.start)C.push({c:'psafh',t:'Prostate cancer — PSA (family hx)',d:'Family hx warrants earlier PSA discussion at age 40–45.',f:'s',refs:['uspstf-psa','nccn-prostate']});else if(a>=RULES.psa.start&&a<=RULES.psa.stop)C.push({c:'psa',t:'Prostate cancer — PSA (shared decision)',d:'Individual decision for men 55–69.',f:'s',refs:['uspstf-psa']});}
  var smoker=(S.tobacco==='current'||S.tobacco==='former');
  var ageOk=a>=RULES.ldct.ageMin&&a<=RULES.ldct.ageMax;
  var pyN=(function(){var y=parseFloat(S.smkYears),p=parseFloat(S.smkPacks);if(!isFinite(y)||!isFinite(p)||y<0||p<0)return null;return y*p;})();
  var qy=(function(){var q=parseFloat(S.smkQuitYears);return isFinite(q)&&q>=0?q:null;})();
  var recentEnough=(S.tobacco==='current')||(S.tobacco==='former'&&(qy===null||qy<=RULES.ldct.quitYrs));
  var haveDetail=(pyN!==null);
  var quitTooLong=(S.tobacco==='former'&&qy!==null&&qy>15);
  if(smoker&&ageOk){
    if(haveDetail&&pyN>=RULES.ldct.packYears&&recentEnough&&!quitTooLong){
      C.push({c:(fL?'lungfh':'lung'),t:'Lung cancer — low-dose CT'+(fL?' (family hx)':''),d:'LDCT eligible.',f:'a',refs:['uspstf-lung']});
    } else if(!haveDetail){
      C.push({c:'lungc',t:'Lung cancer — check LDCT eligibility',d:'Add smoking detail.',f:'s',refs:['uspstf-lung']});
    } else if(quitTooLong){
      C.push({c:'lungc',t:'Lung cancer — LDCT not indicated (quit >15 yrs)',d:'Quit >15 yrs.',f:'s',refs:['uspstf-lung']});
    } else if(pyN<20){
      C.push({c:'lungc',t:'Lung cancer — below LDCT threshold',d:'Below 20 pack-years.',f:'s',refs:['uspstf-lung']});
    }
  } else if(fL){
    C.push({c:'lungc',t:'Lung cancer — family history counseling',d:'Family hx of lung cancer.',f:'s',refs:['uspstf-lung']});
  }
  V.push({c:'vflu',t:'Influenza (flu) vaccine',d:a>=65?'1 dose yearly — high-dose or adjuvanted formulation (Fluzone HD or Fluad). <strong>Best time: September–October</strong> before flu season peaks. Avoid getting it before mid-September unless you are at high risk. Protection typically lasts through the season.':'1 dose yearly for all adults ≥19. <strong>Best time: September–October</strong> — ideally by end of October before flu season peaks. Still beneficial if received later in the season.',f:'a',refs:['acip-2025']});
  // RSV vaccine — ACIP: all adults ≥75; adults 50–74 with increased-risk conditions (age lowered from 60 to 50 in 2025). Single dose, not annual.
  if(a>=75){
    V.push({c:'vrsv',t:'RSV vaccine',d:'Single dose for all adults ≥75 (Arexvy, Abrysvo, or mResvia — no product preference). <strong>Not an annual vaccine</strong> — one dose only; if you have already had one, you are done. Best time: late summer–early fall (Aug–Oct).',f:'o',refs:['acip-rsv']});
  } else if(a>=50&&S.cvrisk==='yes'){
    V.push({c:'vrsv',t:'RSV vaccine',d:'Single dose recommended — a qualifying increased-risk condition (e.g., chronic heart or lung disease, diabetes, kidney or liver disease, immunocompromise, obesity, neurologic/neuromuscular conditions, frailty, or nursing-home residence) raises the risk of severe RSV (ACIP lowered the eligible age from 60 to 50 in 2025). <strong>Not annual</strong> — one dose only. Best time: late summer–early fall.',f:'o',refs:['acip-rsv']});
  }
  // COVID-19 vaccine — ACIP 2025–2026: individual / shared clinical decision-making for all adults ≥6 months.
  V.push({c:'vcovid',t:'COVID-19 vaccine',d:a>=65?'Updated dose via individual / shared decision-making with your provider (ACIP 2025–2026). Benefit is greatest at age ≥65, so an updated dose is generally advised. Discuss timing.':'Individual / shared decision-making with your provider (ACIP 2025–2026). Risk–benefit is most favorable if you have a condition that increases the risk of severe COVID-19.',f:'s',refs:['acip-covid']});
  V.push({c:'vtdap',t:'Tdap / Td booster',d:inc?'Confirm DTaP series. Complete Tdap if not done. Td every 10 yrs.':'Tdap once if not received. Td booster every 10 yrs.',f:inc?'o':'r',refs:['acip-2025']});
  if(a>=RULES.vshin.start)V.push({c:'vshin',t:'Shingles vaccine (Shingrix)',d:'2 doses for adults ≥50 (0 and 2–6 months apart).',f:'o',refs:['acip-2025']});
  if(a>=RULES.vpneu.start||S.cvrisk==='yes')V.push({c:'vpneu',t:'Pneumococcal vaccine',d:'PCV20 once, or PCV15 + PPSV23. Adults ≥50 or chronic conditions.',f:'o',refs:['acip-2025']});
  if(a<=RULES.vhpv.stop)V.push({c:'vhpv',t:'HPV vaccine — catch-up',d:'2–3 dose series through age 26.',f:'o',refs:['acip-2025']});
  if(a>=RULES.vhpvs.start&&a<=RULES.vhpvs.stop)V.push({c:'vhpvs',t:'HPV vaccine (shared decision)',d:'Shared decision for ages 27–45.',f:'s',refs:['acip-2025']});
  // Show VZV only if childhood vaccines are incomplete/unknown AND no chickenpox history AND born >=1980.
  // Presumptive immunity: complete childhood series, prior disease, OR U.S.-born before 1980 (parallels MMR <1957).
  if(inc&&S.hadPox!=='yes'&&birthYr>=1980){
    V.push({c:'vvzv',t:'Varicella (VZV) vaccine',d:'Childhood vaccines are incomplete or unknown and you report no chickenpox history — confirm a documented 2-dose varicella series (prior chickenpox or zoster counts as immunity). Note: U.S.-born before 1980 is generally presumed immune, except for healthcare workers, pregnancy, or immunocompromise.',f:'o',refs:['acip-2025']});
  }
  // If childhood vaccines are complete (documented 2-dose VZV) or chickenpox history present: no VZV card.
  if(inc){V.push({c:'vhepb',t:'Hepatitis B — verify / catch-up',d:'Confirm a complete 2–3 dose hepatitis B series and finish it if it was never completed.',f:'o',refs:['acip-2025']});}
  else{var hbvSexRisk=msm||S.multipartner==='yes'||S.prevsti==='yes'||(S.unprotected==='yes'&&S.sexactive==='yes'&&!mono);var hbvRisk=S.ivdrug==='yes'||hbvSexRisk||S.cvrisk==='yes';var hbvList='Indicated — if not already vaccinated as an adult — for: high-risk sexual behavior (multiple partners, a recent STI, or a partner with hepatitis B); injection drug use; chronic liver disease, hepatitis C, or HIV; diabetes (especially before age 60); a household or sexual contact with hepatitis B; healthcare or public-safety work with blood/body-fluid exposure; or travel to regions where hepatitis B is common.';if(a<=59){V.push({c:'vhepb',t:'Hepatitis B vaccine',d:'A 2–3 dose series is recommended for all adults 19–59 who have not already been vaccinated. '+(hbvRisk?'Your answers suggest at least one added risk factor, so completing it is especially important. ':'')+hbvList,f:'o',refs:['acip-2025']});}else if(hbvRisk){V.push({c:'vhepb',t:'Hepatitis B vaccine',d:'Recommended for adults 60 and older who have a risk factor and have not already been vaccinated. '+hbvList,f:'o',refs:['acip-2025']});}else{V.push({c:'vhepb',t:'Hepatitis B vaccine (shared decision)',d:'Adults 60 and older without a specific risk factor may still choose vaccination through shared decision-making with their provider. '+hbvList,f:'s',refs:['acip-2025']});}}
  if(inc){V.push({c:'vhepa',t:'Hepatitis A — verify / catch-up',d:'Confirm 2–3 dose HepA series.',f:'o',refs:['acip-2025']});}
  else if(S.ivdrug==='yes'||heavy||msm){V.push({c:'vhepa',t:'Hepatitis A vaccine',d:'2-dose series — indicated for injection drug use, heavy alcohol use, men who have sex with men, chronic liver disease, or travel to regions where hepatitis A is common.',f:'o',refs:['acip-2025']});}
  if(inc&&birthYr>=1957){V.push({c:'vmmr',t:'MMR — verify / catch-up',d:'Your childhood vaccines are incomplete or unknown — confirm 2 documented MMR doses. Adults born in 1957 or later without evidence of immunity need 1–2 doses (U.S.-born before 1957 = presumptive immunity; healthcare workers still need documented doses).',f:'o',refs:['acip-2025']});}
  // Suppressed if childhood vaccines complete (documented 2-dose MMR = presumptive immunity) OR U.S.-born before 1957.
  if(inc)V.push({c:'vpolio',t:'Polio (IPV) — verify',d:'Confirm 4-dose childhood IPV series.',f:'s',refs:['acip-2025']});
  if(menB)V.push({c:'vmenb',t:'MenB vaccine',d:'2–3 dose series for MSM and high-risk adults.',f:'o',refs:['acip-2025']});
  if(inc)V.push({c:'vmenacwy',t:'MenACWY vaccine',d:'1–2 doses + boosters. Dorm residents and travelers to endemic regions.',f:'o',refs:['acip-2025']});
  var all=[].concat(H,L,C,V);
  var flags={}; all.forEach(function(x){flags[x.c]=x.f;});
  return {codes: all.map(function(x){return x.c;}), flags: flags};
}
module.exports={appEngine:appEngine,RULES:RULES};
