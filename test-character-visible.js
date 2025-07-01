const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Drawing character') || text.includes('character data')) {
      console.log('CHARACTER:', text);
    }
  });
  
  // Navigate to debug mode
  console.log('Opening game in debug mode...');
  await page.goto('http://localhost:3000?debug=true');
  
  // Wait and click start
  await page.waitForTimeout(2000);
  const startButton = await page.locator('button:has-text("开始挖矿冒险")');
  if (await startButton.isVisible()) {
    await startButton.click();
    await page.waitForTimeout(1000);
  }
  
  // Create room
  const createRoomBtn = await page.locator('button:has-text("创建房间")');
  if (await createRoomBtn.isVisible()) {
    await createRoomBtn.click();
    console.log('Waiting for game to load...');
    await page.waitForTimeout(5000);
  }
  
  // Take detailed screenshot
  await page.screenshot({ path: 'character-test.png', fullPage: true });
  console.log('Screenshot saved as character-test.png');
  
  // Also screenshot just the canvas
  const canvas = await page.locator('canvas');
  if (await canvas.isVisible()) {
    await canvas.screenshot({ path: 'canvas-only.png' });
    console.log('Canvas screenshot saved as canvas-only.png');
  }
  
  console.log('Test complete. Browser stays open.');
  await new Promise(() => {});
})();