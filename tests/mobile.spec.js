const {test, expect} = require('@playwright/test');
const url = process.env.HCX_TEST_URL || 'http://localhost:3108/';
async function advance(page) {await page.locator('#fnav-next').click();}
async function choose(page, selector) {
  const question=await page.locator('.fstep.on').getAttribute('id');
  await page.locator(selector).click();
  await expect(page.locator(selector)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.fstep.on')).toHaveAttribute('id',question); // Never jump after a tap.
  await advance(page);
}
async function toReview(page, details) {
  await page.goto(url);
  await page.locator('#fn').fill('Test'); await page.locator('#ln').fill('Profile'); await advance(page);
  await expect(page.locator('#fnav-next')).toBeDisabled();
  await page.locator('#ag').fill('60'); await advance(page); await choose(page,'#bm');
  await choose(page, details?'#cvy':'#cvn');
  await choose(page, details?'#fay':'#fan');
  if(details){for(const id of ['cb','ccr2','cpa1','cm2'])await page.locator('#'+id).click();await advance(page);}
  await choose(page,details?'#syy':'#syn');
  if(details)await choose(page,'#sybrca');
  await choose(page,`[data-g="tobacco"][data-v="${details?'former':'none'}"]`);
  if(details){
    await page.locator('#smkYears').fill('20');await advance(page);
    await page.locator('#smkPacks').fill('1');await advance(page);
    await page.locator('#smkQuitYears').fill('5');await advance(page);
  }
  await choose(page,`[data-g="alcoholyn"][data-v="${details?'yes':'no'}"]`);
  if(details)await choose(page,'.ab[data-v="moderate"]');
  await choose(page,`[data-g="drugs"][data-v="${details?'yes':'no'}"]`);
  if(details)await choose(page,'#ivn');
  await choose(page,details?'#sa-yes':'#sa-no');
  if(details){await choose(page,'#pf');await choose(page,'[data-g="unprotected"][data-v="no"]');await choose(page,'[data-g="multipartner"][data-v="no"]');}
  await choose(page,'#stn');await choose(page,'[data-g="childvax"][data-v="yes"]');await choose(page,'#pox-yes');
  await expect(page.locator('#fstep-rv')).toHaveClass(/on/);
}
for (const width of [320,390,768,1280]) {
  test(`guided intake, review, edit and results at ${width}px`, async ({browser}) => {
    const page=await browser.newPage({viewport:{width,height:780},isMobile:width<600,hasTouch:width<600});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await toReview(page,true);
    await expect(page.locator('.hcx-section-card')).toHaveCount(7);
    await expect(page.locator('section[aria-labelledby="review-2b"]')).toContainText('Melanoma plus pancreatic');
    await page.getByRole('button',{name:'Edit about you',exact:true}).click();await advance(page);
    await expect(page.locator('#ag')).toHaveValue('60');await page.locator('#ag').fill('61');await advance(page);
    // Back retains the answer; Next deliberately advances.
    await page.locator('#fnav-back').click();await expect(page.locator('#ag')).toHaveValue('61');await advance(page);
    for(let n=0;n<30 && !(await page.locator('#fstep-rv').isVisible());n++)await advance(page);
    await expect(page.locator('.hcx-answers').first()).toContainText('61');
    await page.screenshot({path:`/tmp/healthychex-guided-review-${width}.png`,animations:'disabled'});
    await advance(page);await page.locator('.omodal-opt').first().click();
    await expect(page.locator('#vr')).toHaveClass(/active/);await expect(page.locator('.rc').first()).toBeVisible();
    expect(errors).toEqual([]);await page.close();
  });
}
test('No route skips details; changing Yes to No removes its follow-ups',async({page})=>{
  await toReview(page,false);await expect(page.locator('.hcx-section-card')).toHaveCount(5);
  await page.getByRole('button',{name:'Edit medical history',exact:true}).click();await advance(page);
  await choose(page,'#fay');await expect(page.locator('#question-2b')).toBeVisible();
  await page.locator('#cb').click();await page.locator('#fnav-back').click();
  await choose(page,'#fan');await expect(page.locator('#question-gene')).toBeVisible();
  await expect(page.locator('#cb')).not.toBeVisible();
});
test('optional smoking history can be skipped and selection styles match',async({page})=>{
  await toReview(page,false);await page.getByRole('button',{name:'Edit social history',exact:true}).click();
  await choose(page,'[data-g="tobacco"][data-v="current"]');
  await expect(page.locator('#smkYears')).toBeVisible();await expect(page.locator('#fnav-next')).toBeEnabled();await advance(page);
  await expect(page.locator('#smkPacks')).toBeVisible();await advance(page);
  const no=page.locator('[data-g="alcoholyn"][data-v="no"]'),yes=page.locator('[data-g="alcoholyn"][data-v="yes"]');
  await no.click();const noColor=await no.evaluate(el=>getComputedStyle(el).backgroundColor);
  await yes.click();await expect(no).toHaveAttribute('aria-pressed','false');
  await expect(yes).toHaveCSS('background-color',noColor);
});

test('phone answer and Next positions stay still after selecting',async({browser})=>{
  const page=await browser.newPage({viewport:{width:390,height:780},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await page.goto(url);await advance(page);await page.locator('#ag').fill('60');await advance(page);await choose(page,'#bm');
  const no=page.locator('#cvn'),next=page.locator('#fnav-next');
  const before=await no.boundingBox(),navBefore=await next.boundingBox();
  expect(before.y).toBeGreaterThan(350);expect(before.y+before.height).toBeLessThan(650);
  await no.click();await expect(no).toHaveAttribute('aria-pressed','true');
  const after=await no.boundingBox(),navAfter=await next.boundingBox();
  expect(Math.abs(after.y-before.y)).toBeLessThan(2);expect(Math.abs(navAfter.y-navBefore.y)).toBeLessThan(2);
  expect(navAfter.y+navAfter.height).toBeLessThanOrEqual(780);
  await page.close();
});
