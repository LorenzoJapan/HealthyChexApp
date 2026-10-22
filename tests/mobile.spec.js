const {test, expect} = require('@playwright/test');
const url = process.env.HCX_TEST_URL || 'http://localhost:3108/';
for (const width of [320,390,768,1280]) {
  test(`intake, review, edit and results at ${width}px`, async ({browser}) => {
    const page = await browser.newPage({viewport:{width,height:780},isMobile:width<600,hasTouch:width<600});
    const errors=[]; page.on('pageerror', e=>errors.push(e.message));
    await page.goto(url);
    await expect(page.locator('.hcx-import')).toBeInViewport();
    await page.locator('#fn').fill('Test'); await page.locator('#ln').fill('Profile');
    await page.locator('#ag').fill('60'); await page.locator('#bm').click();
    const next = page.locator('#fnav-next'); await next.click();
    await page.locator('#cvy').click(); await page.locator('#fay').click();
    await page.locator('#syy').click(); await next.click();
    for (const id of ['cb','ccr2','cpa1','cm2']) await page.locator('#'+id).click();
    await next.click(); await page.locator('#synchips button').first().click(); await next.click();
    await page.locator('[data-g="tobacco"][data-v="none"]').click();
    await page.locator('[data-g="alcoholyn"][data-v="no"]').click();
    await page.locator('[data-g="drugs"][data-v="no"]').click(); await next.click();
    await page.locator('#sa-no').click(); await page.locator('#stn').click(); await next.click();
    await page.locator('[data-g="childvax"][data-v="yes"]').click(); await page.locator('#pox-yes').click(); await next.click();
    await expect(page.locator('.hcx-section-card')).toHaveCount(7);
    await expect(page.locator('section[aria-labelledby="review-2b"]')).toContainText('Melanoma plus pancreatic');
    await expect(page.getByRole('button',{name:'Edit about you',exact:true})).toBeVisible();
    await page.screenshot({path:`/tmp/healthychex-review-${width}.png`,fullPage:true,animations:"disabled"});
    await page.getByRole('button',{name:'Edit about you',exact:true}).click();
    await expect(page.locator('#ag')).toHaveValue('60'); await page.locator('#ag').fill('61');
    for(let i=0;i<7;i++) await next.click();
    await expect(page.locator('.hcx-answers').first()).toContainText('61');
    await page.locator('#fnav-next').click();
    await expect(page.locator('#vr')).toHaveClass(/active/);
    await page.locator('.omodal-opt').first().click();
    await expect(page.locator('#omodal')).not.toHaveClass(/on/);
    await expect(page.locator('.rc').first()).toBeVisible();
    await page.screenshot({path:`/tmp/healthychex-results-${width}.png`,animations:"disabled"});
    expect(errors).toEqual([]); await page.close();
  });
}
