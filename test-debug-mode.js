const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.error('ERROR:', err));
  
  // Navigate to debug mode
  console.log('Opening game in debug mode...');
  await page.goto('http://localhost:3000?debug=true');
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Click start game button
  const startButton = await page.locator('button:has-text("开始挖矿冒险")');
  if (await startButton.isVisible()) {
    console.log('Clicking start game...');
    await startButton.click();
    await page.waitForTimeout(1000);
  }
  
  // Click create room button  
  const createRoomBtn = await page.locator('button:has-text("创建房间")');
  if (await createRoomBtn.isVisible()) {
    console.log('Creating room...');
    await createRoomBtn.click();
    await page.waitForTimeout(5000); // Wait for countdown
  }
  
  // Check if canvas is visible
  const canvas = await page.locator('canvas');
  if (await canvas.isVisible()) {
    console.log('Game is running! Taking screenshot...');
    await page.screenshot({ path: 'debug-game-running.png', fullPage: true });
    
    // Try firing hook
    const bounds = await canvas.boundingBox();
    if (bounds) {
      await page.mouse.click(bounds.x + bounds.width/2, bounds.y + bounds.height/2);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'debug-hook-fired.png', fullPage: true });
    }
  }
  
  console.log('Test complete. Check screenshots.');
  console.log('Browser will stay open. Press Ctrl+C to close.');
  
  await new Promise(() => {});
})();