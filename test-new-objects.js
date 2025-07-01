const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000?debug=true');
  await page.waitForTimeout(2000);
  
  // Create room and start game
  await page.click('button:has-text("创建房间")');
  await page.waitForTimeout(1000);
  
  const startBtn = await page.locator('button:has-text("开始挖矿")');
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(6000); // Wait for countdown
  }
  
  // Take screenshots
  await page.screenshot({ path: 'new-objects-1.png' });
  
  // Try to catch some objects
  const canvas = await page.locator('canvas');
  const box = await canvas.boundingBox();
  
  // Fire hook at different positions
  await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.7);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'new-objects-2.png' });
  
  await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.6);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'new-objects-3.png' });
  
  console.log('Screenshots saved:');
  console.log('- new-objects-1.png: Initial view');
  console.log('- new-objects-2.png: After first hook');
  console.log('- new-objects-3.png: After second hook');
  
  await browser.close();
})();