const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to debug mode
  await page.goto('http://localhost:3000?debug=true');
  await page.waitForTimeout(2000);
  
  // Log all visible buttons
  const buttons = await page.locator('button').all();
  console.log('Found buttons:');
  for (const button of buttons) {
    const text = await button.textContent();
    console.log(`- "${text}"`);
  }
  
  // Try to start game
  const startButton = await page.locator('button:has-text("开始挖矿冒险")');
  if (await startButton.isVisible()) {
    console.log('\nClicking start button...');
    await startButton.click();
    await page.waitForTimeout(2000);
    
    // Check buttons again
    const buttonsAfter = await page.locator('button').all();
    console.log('\nButtons after starting:');
    for (const button of buttonsAfter) {
      const text = await button.textContent();
      console.log(`- "${text}"`);
    }
    
    // Look for room-related elements
    console.log('\nLooking for room elements...');
    const roomElements = await page.locator('text=/房间|room/i').all();
    for (const elem of roomElements) {
      const text = await elem.textContent();
      console.log(`Room element: "${text}"`);
    }
  }
  
  await browser.close();
})();