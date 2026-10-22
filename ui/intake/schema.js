// Every intake question as data, in the order asked. Wording matches the original form;
// keys, ids and data-g/data-v values are kept so saved profiles, tests and review links still match.
//
// Field kinds: name, age, number (optional free entry), choice (one answer; advances by
// itself), multi (several answers; waits for Next).

const yesNo = ids => [
  {value: 'no', label: 'No', id: ids?.[0]},
  {value: 'yes', label: 'Yes', id: ids?.[1]}
];
const answered = key => profile => !!profile[key];
const is = (key, value) => profile => profile[key] === value;
const smoking = profile => ['current', 'former'].includes(profile.tobacco);

const HELP = {
  cv: {
    id: 'pp1', variant: 'pop-cv', icon: 'heart-bolt', dot: 'b', title: 'CV risk factors',
    items: ['High blood pressure (≥130/80)', 'High cholesterol (LDL ≥130 or total ≥200)',
      'Type 2 diabetes or prediabetes', 'Current or former smoker', 'Overweight / obesity (BMI ≥25)',
      'Family hx: heart attack/stroke (men <55, women <65)', 'Physically inactive (<150 min/week)',
      'Chronic kidney disease'],
    note: 'Answer "Yes" if you have any of these or a close relative had early heart disease.'
  },
  gene: {
    id: 'pp-syn', variant: 'pop-fam', icon: 'dna', dot: 'c', title: 'Cancer genes that count',
    items: [
      ['BRCA1/2', 'inherited mutation that raises the risk of breast, ovarian, prostate and pancreatic cancer'],
      ['Lynch syndrome', 'inherited mismatch-repair gene mutation (MLH1, MSH2, MSH6, PMS2, EPCAM) that raises the risk of colorectal, endometrial and other cancers'],
      ['Familial adenomatous polyposis (FAP)', 'APC gene mutation that causes hundreds of colon polyps and, untreated, near-certain colorectal cancer']
    ],
    note: 'Answer "Yes" if genetic testing has found one of these in you or a blood relative.'
  },
  sti: {
    id: 'pp3', variant: 'pop-sti', icon: 'virus', dot: 'p', title: 'Prior Sexually Transmitted Infection (STI)?',
    items: ['Chlamydia', 'Gonorrhea', 'Syphilis', 'Herpes (HSV-1 or HSV-2)', 'HPV / abnormal Pap',
      'Trichomoniasis', 'Hepatitis B', 'HIV / AIDS', 'Mycoplasma genitalium', 'Pubic lice or scabies'],
    note: 'Answer "Yes" if ever diagnosed or treated, even if fully cleared.'
  },
  vax: {
    id: 'pp4', variant: 'pop-vax', icon: 'vaccine', dot: 'g', title: 'Childhood vaccines (CDC ACIP 2025)', trigger: 'click here to check',
    items: [
      ['Tetanus, Diphtheria, Pertussis', 'DTaP + Tdap'], ['Polio (IPV)', '4 doses'], ['MMR', '2 doses'],
      ['Varicella (VZV)', '2 doses'], ['Hepatitis A & B', '2–3 doses each'], ['HPV', '2–3 doses (ages 11–12)'],
      ['MenACWY', '1–2 doses + boosters'], ['MenB', '2–3 doses (ages 16–23 or risk)']
    ],
    note: 'Source: CDC ACIP 2025 — MMWR 2025;74(2):30–33.'
  }
};

export const STEPS = [
  {key: '1', section: 'About you', intro: 'What is your name? (optional)',
    field: {kind: 'name'}},
  {key: 'age', section: 'About you', complete: p => p.age >= 18 && p.age <= 110,
    field: {kind: 'age', label: 'Age', icon: 'calendar', min: 18, max: 110}},
  {key: 'sex', section: 'About you',
    field: {kind: 'choice', answer: 'gender', label: 'Biological sex', icon: 'gender-bigender', options: [
      {value: 'M', label: 'Male', id: 'bm', icon: 'mars'}, {value: 'F', label: 'Female', id: 'bf', icon: 'venus'}]}},
  {key: '2', section: 'Medical history',
    field: {kind: 'choice', answer: 'cvrisk', label: 'CV risk factors', icon: 'heart', help: HELP.cv, options: yesNo(['cvn', 'cvy'])}},
  {key: 'family', section: 'Medical history',
    field: {kind: 'choice', answer: 'famcancer', label: 'Family cancer history', icon: 'ribbon-health', options: yesNo(['fan', 'fay'])}},
  {key: '2b', section: 'Medical history', when: is('famcancer', 'yes'), intro: 'Which cancers run in your family?',
    field: {kind: 'multi', answer: 'famcancerTypes', label: 'What counts as "early" cancer?', icon: 'dna',
      hint: 'Tap any that apply to your family',
      note: 'First-degree relatives = parents, siblings, children. *If only two, the other must also be close: a parent, sibling, child, grandparent, aunt, uncle or half-sibling.',
      options: [
        {value: 'breast', id: 'cb', icon: 'ribbon-health', label: 'Breast', detail: 'First-degree relative before age 50, or BRCA1/2'},
        {value: 'ovarian', id: 'co', icon: 'gender-female', label: 'Ovarian', detail: 'First-degree relative at any age'},
        {value: 'crc1', id: 'ccr1', icon: 'microscope', label: 'Colorectal', detail: 'One first-degree relative diagnosed at 60 or older'},
        {value: 'crc2', id: 'ccr2', icon: 'microscope', label: 'Colorectal', detail: 'First-degree relative before 60, or two or more relatives'},
        {value: 'lung', id: 'cl', icon: 'lungs', label: 'Lung', detail: 'First-degree relative before age 60, or two+ on same side'},
        {value: 'prostate', id: 'cp', icon: 'gender-male', label: 'Prostate', detail: 'First-degree relative before age 65, or two+ on same side'},
        {value: 'panc1', id: 'cpa1', icon: 'scan', label: 'Pancreatic', detail: 'Parent, sibling or child (not neuroendocrine, if known)'},
        {value: 'panc2', id: 'cpa2', icon: 'scan', label: 'Pancreatic', detail: 'Two or more on one side, at least one a parent, sibling or child*'},
        {value: 'mel1', id: 'cm1', icon: 'sun', label: 'Melanoma', detail: 'Parent, sibling or child (not basal or squamous cell)'},
        {value: 'mel2', id: 'cm2', icon: 'sun', label: 'Melanoma plus pancreatic', detail: 'Three or more relatives on one side with either cancer, at least one melanoma'}
      ]}},
  {key: 'gene', section: 'Medical history',
    field: {kind: 'choice', answer: 'syndrome', label: 'Inherited cancer gene', sublabel: 'in you or a blood relative', icon: 'dna-2',
      help: HELP.gene, options: yesNo(['syn', 'syy'])}},
  {key: '2c', section: 'Medical history', when: is('syndrome', 'yes'), intro: 'Which inherited cancer genes?',
    field: {kind: 'multi', answer: 'syndromeTypes', label: 'Which one?', chips: true,
      note: 'These override average-risk screening — surveillance is managed with a genetics team.',
      options: [
        {value: 'brca', id: 'sybrca', label: 'BRCA1/2'},
        {value: 'lynch', id: 'sylynch', label: 'Lynch syndrome'},
        {value: 'fap', id: 'syfap', label: 'Familial adenomatous polyposis (FAP)'}
      ]}},
  {key: '3', section: 'Lifestyle',
    field: {kind: 'choice', answer: 'tobacco', label: 'Tobacco use', icon: 'smoking-no', options: [
      {value: 'none', label: 'Never'}, {value: 'former', label: 'Former'}, {value: 'current', label: 'Current'}]}},
  {key: 'smoke-years', section: 'Lifestyle', when: smoking, optional: true, intro: 'How many years did you smoke?',
    field: {kind: 'number', answer: 'smkYears', id: 'smkYears', label: 'Years smoked', placeholder: 'e.g. 20', min: 0, max: 80, inputMode: 'numeric'}},
  {key: 'smoke-packs', section: 'Lifestyle', when: smoking, optional: true, intro: 'How many packs per day?',
    field: {kind: 'number', answer: 'smkPacks', id: 'smkPacks', label: 'Packs per day', placeholder: 'e.g. 1', min: 0, max: 10, step: 0.25, inputMode: 'decimal', packYears: true}},
  {key: 'smoke-quit', section: 'Lifestyle', when: is('tobacco', 'former'), optional: true, intro: 'How many years since you quit?',
    field: {kind: 'number', answer: 'smkQuitYears', id: 'smkQuitYears', label: 'Years since quitting', placeholder: 'e.g. 5', min: 0, max: 80, inputMode: 'numeric'}},
  {key: 'alcohol', section: 'Lifestyle',
    field: {kind: 'choice', answer: 'alcoholyn', label: 'Alcohol use', icon: 'glass-full', options: yesNo()}},
  {key: 'alcohol-amount', section: 'Lifestyle', when: is('alcoholyn', 'yes'), intro: 'How much alcohol do you drink?',
    complete: p => !!p.alcohol && p.alcohol !== 'none',
    field: {kind: 'choice', answer: 'alcohol', options: [
      {value: 'low', label: 'Light'}, {value: 'moderate', label: 'Moderate'}, {value: 'heavy', label: 'Heavy'}]}},
  {key: 'drugs', section: 'Lifestyle',
    field: {kind: 'choice', answer: 'drugs', label: 'Recreational drugs', icon: 'pill', options: yesNo()}},
  {key: 'injection', section: 'Lifestyle', when: is('drugs', 'yes'), intro: 'Do you inject recreational drugs?',
    field: {kind: 'choice', answer: 'ivdrug', options: yesNo(['ivn', 'ivy'])}},
  {key: '4', section: 'Sexual history',
    field: {kind: 'choice', answer: 'sexactive', label: 'Sexually active', icon: 'heart-handshake', options: yesNo(['sa-no', 'sa-yes'])}},
  {key: 'partners', section: 'Sexual history', when: is('sexactive', 'yes'), intro: 'Who are your sexual partners?',
    field: {kind: 'choice', answer: 'partnerSex', options: [
      {value: 'female', label: 'Female only', id: 'pf', icon: 'venus'},
      {value: 'male', label: 'Male only', id: 'pm', icon: 'mars'},
      {value: 'both', label: 'Both', id: 'pb2', icon: 'gender-bigender'}],
      note: {when: is('msm', 'yes'), id: 'msm', className: 'msm on', icon: 'info-circle',
        text: 'Your checklist will include screening advised for men who have sex with men.'}}},
  {key: 'unprotected', section: 'Sexual history', when: is('sexactive', 'yes'),
    field: {kind: 'choice', answer: 'unprotected', label: 'Unprotected sex', options: yesNo()}},
  {key: 'multiple', section: 'Sexual history', when: is('sexactive', 'yes'),
    field: {kind: 'choice', answer: 'multipartner', label: 'Multiple partners', options: yesNo()}},
  {key: 'prior-sti', section: 'Sexual history',
    field: {kind: 'choice', answer: 'prevsti', label: 'Prior Sexually Transmitted Infection (STI)', icon: 'shield-check', help: HELP.sti,
      options: yesNo(['stn', 'sty'])}},
  {key: '5', section: 'Vaccines',
    field: {kind: 'choice', answer: 'childvax', label: 'Received all recommended childhood vaccines by age 18?', icon: 'vaccine', help: HELP.vax,
      options: [{value: 'yes', label: 'Yes — all'}, {value: 'partial', label: 'Partial / unsure'}, {value: 'no', label: 'No / unknown'}]}},
  {key: 'pox', section: 'Vaccines',
    field: {kind: 'choice', answer: 'hadPox', label: 'Had childhood chickenpox?', icon: 'virus', options: yesNo(['pox-no', 'pox-yes']),
      note: {when: is('hadPox', 'yes'), id: 'pox-note', className: 'hcx-pox-note', icon: 'circle-check', strong: 'Prior chickenpox confirmed.',
        text: 'Natural immunity is equivalent to vaccination — VZV vaccine will not appear on your checklist — no vaccine needed.'}}}
].map(step => ({
  when: () => true,
  complete: step.optional || step.field.kind === 'name' ? () => true
    : step.field.kind === 'multi' ? p => (p[step.field.answer] || []).length > 0
    : answered(step.field.answer),
  ...step
}));
