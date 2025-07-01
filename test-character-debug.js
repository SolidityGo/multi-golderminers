const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000?debug=true');
  await page.waitForTimeout(2000);
  
  // Create room
  await page.click('button:has-text("创建房间")');
  await page.waitForTimeout(1000);
  
  // Start game
  const startBtn = await page.locator('button:has-text("开始挖矿")');
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(6000); // Wait for countdown
  }
  
  // Take screenshot
  await page.screenshot({ path: 'character-debug.png' });
  console.log('Screenshot saved: character-debug.png');
  
  await browser.close();
})();