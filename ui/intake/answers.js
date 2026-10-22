// Answer rules for the intake. Pure apart from mutating the profile passed in, so the
// engine's global S keeps its identity and the rules can be unit-tested without a page.

const SMOKING = ['current', 'former'];
// Picking one of a pair replaces the other: they describe the same relatives at different risk.
const EXCLUSIVE = {crc1: 'crc2', crc2: 'crc1', panc1: 'panc2', panc2: 'panc1'};

function updateMsm(profile) {
  const partnersIncludeMen = profile.partnerSex === 'male' || profile.partnerSex === 'both';
  profile.msm = profile.gender === 'M' && partnersIncludeMen ? 'yes' : 'no';
}

// Sets one answer and clears follow-up answers that no longer apply.
export function setAnswer(profile, key, value) {
  profile[key] = value;
  switch (key) {
    case 'gender':
    case 'partnerSex':
      updateMsm(profile);
      break;
    case 'tobacco':
      if (!SMOKING.includes(value)) { profile.smkYears = ''; profile.smkPacks = ''; }
      if (value !== 'former') profile.smkQuitYears = '';
      break;
    case 'alcoholyn':
      if (value !== 'yes') profile.alcohol = 'none';
      break;
    case 'drugs':
      // The engine reads "no recreational drugs" as no injection use too.
      if (value !== 'yes') profile.ivdrug = 'no';
      break;
    case 'famcancer':
      if (value !== 'yes') profile.famcancerTypes = [];
      break;
    case 'syndrome':
      if (value !== 'yes') profile.syndromeTypes = [];
      break;
    case 'sexactive':
      if (value !== 'yes') {
        profile.partnerSex = ''; profile.unprotected = ''; profile.multipartner = '';
        updateMsm(profile);
      }
      break;
  }
  return profile;
}

// Adds or removes one item from a multi-choice answer.
export function toggleAnswer(profile, key, item) {
  const list = (profile[key] || []).slice();
  const at = list.indexOf(item);
  if (at === -1) {
    const other = key === 'famcancerTypes' && EXCLUSIVE[item];
    if (other && list.includes(other)) list.splice(list.indexOf(other), 1);
    list.push(item);
  } else {
    list.splice(at, 1);
  }
  profile[key] = list;
  return profile;
}
