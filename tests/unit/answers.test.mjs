import test from 'node:test';
import assert from 'node:assert/strict';
import {setAnswer, toggleAnswer} from '../../ui/intake/answers.js';

const blank = () => ({gender: '', tobacco: '', smkYears: '', smkPacks: '', smkQuitYears: '', alcoholyn: '', alcohol: 'none',
  drugs: '', ivdrug: '', sexactive: '', partnerSex: '', unprotected: '', multipartner: '', msm: 'no',
  famcancer: '', famcancerTypes: [], syndrome: '', syndromeTypes: []});

test('msm follows sex and partners in either order', () => {
  const p = blank();
  setAnswer(p, 'partnerSex', 'both'); assert.equal(p.msm, 'no');
  setAnswer(p, 'gender', 'M'); assert.equal(p.msm, 'yes');
  setAnswer(p, 'partnerSex', 'female'); assert.equal(p.msm, 'no');
});
test('not sexually active clears partner answers and msm', () => {
  const p = Object.assign(blank(), {gender: 'M', sexactive: 'yes', partnerSex: 'male', msm: 'yes', unprotected: 'yes', multipartner: 'no'});
  setAnswer(p, 'sexactive', 'no');
  assert.deepEqual([p.partnerSex, p.unprotected, p.multipartner, p.msm], ['', '', '', 'no']);
});
test('smoking history is kept only while it applies', () => {
  const p = Object.assign(blank(), {tobacco: 'former', smkYears: '20', smkPacks: '1', smkQuitYears: '5'});
  setAnswer(p, 'tobacco', 'current');
  assert.deepEqual([p.smkYears, p.smkPacks, p.smkQuitYears], ['20', '1', '']);
  setAnswer(p, 'tobacco', 'none');
  assert.deepEqual([p.smkYears, p.smkPacks, p.smkQuitYears], ['', '', '']);
});
test('No answers reset their follow-ups', () => {
  const p = Object.assign(blank(), {alcohol: 'heavy', ivdrug: 'yes', famcancerTypes: ['lung'], syndromeTypes: ['brca']});
  setAnswer(p, 'alcoholyn', 'no'); setAnswer(p, 'drugs', 'no');
  setAnswer(p, 'famcancer', 'no'); setAnswer(p, 'syndrome', 'no');
  assert.deepEqual([p.alcohol, p.ivdrug, p.famcancerTypes, p.syndromeTypes], ['none', 'no', [], []]);
});
test('Yes answers keep existing follow-ups', () => {
  const p = Object.assign(blank(), {alcohol: 'low', famcancerTypes: ['lung']});
  setAnswer(p, 'alcoholyn', 'yes'); setAnswer(p, 'famcancer', 'yes');
  assert.deepEqual([p.alcohol, p.famcancerTypes], ['low', ['lung']]);
});
test('paired family-history options replace each other', () => {
  const p = blank();
  toggleAnswer(p, 'famcancerTypes', 'crc1'); toggleAnswer(p, 'famcancerTypes', 'lung');
  toggleAnswer(p, 'famcancerTypes', 'crc2');
  assert.deepEqual(p.famcancerTypes, ['lung', 'crc2']);
  toggleAnswer(p, 'famcancerTypes', 'panc1'); toggleAnswer(p, 'famcancerTypes', 'panc2');
  assert.deepEqual(p.famcancerTypes, ['lung', 'crc2', 'panc2']);
  toggleAnswer(p, 'famcancerTypes', 'lung');
  assert.deepEqual(p.famcancerTypes, ['crc2', 'panc2']);
});
