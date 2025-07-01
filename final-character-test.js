const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate and start game
  await page.goto('http://localhost:3000?debug=true');
  await page.waitForTimeout(2000);
  
  // Start game
  await page.click('button:has-text("开始挖矿冒险")');
  await page.waitForTimeout(1000);
  
  // Create room
  await page.click('button:has-text("创建房间")');
  
  // Wait for countdown to finish
  console.log('Waiting for game to load (5 seconds)...');
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'final-game-with-character.png', fullPage: true });
  console.log('Screenshot saved: final-game-with-character.png');
  
  // Close after 2 seconds
  await page.waitForTimeout(2000);
  await browser.close();
  console.log('Done!');
})();