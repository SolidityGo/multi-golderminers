const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('PAGE ERROR:', msg.text());
    } else {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  // Navigate to the game
  console.log('Navigating to game...');
  await page.goto('http://localhost:3001');
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Take a screenshot of initial state
  await page.screenshot({ path: 'debug-1-initial.png' });
  console.log('Screenshot saved: debug-1-initial.png');
  
  // Check if we need to bypass wallet connection
  const connectButton = await page.locator('button:has-text("连接钱包")').first();
  if (await connectButton.isVisible()) {
    console.log('Found wallet connect button, need to bypass...');
    
    // Inject mock wallet data directly into the game
    await page.evaluate(() => {
      // Mock wallet address
      const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
      
      // Try to find and click any button that might trigger game start
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        if (btn.textContent.includes('创建房间') || btn.textContent.includes('开始游戏')) {
          console.log('Found game start button:', btn.textContent);
          btn.click();
        }
      });
      
      // If we have access to React internals, try to set wallet directly
      const event = new CustomEvent('wallet-connected', { 
        detail: { address: mockAddress } 
      });
      window.dispatchEvent(event);
    });
  }
  
  // Wait a bit and check current state
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'debug-2-after-bypass.png' });
  console.log('Screenshot saved: debug-2-after-bypass.png');
  
  // Try to create a room without wallet
  const createRoomButton = await page.locator('button:has-text("创建房间")').first();
  if (await createRoomButton.isVisible()) {
    console.log('Clicking create room button...');
    await createRoomButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-3-room-created.png' });
    console.log('Screenshot saved: debug-3-room-created.png');
  }
  
  // Check if game canvas is visible
  const canvas = await page.locator('canvas').first();
  if (await canvas.isVisible()) {
    console.log('Game canvas is visible!');
    
    // Wait for game to fully load (3 second countdown)
    console.log('Waiting for game to load...');
    await page.waitForTimeout(4000);
    
    await page.screenshot({ path: 'debug-4-game-loaded.png' });
    console.log('Screenshot saved: debug-4-game-loaded.png');
    
    // Try clicking to fire hook
    const canvasBounds = await canvas.boundingBox();
    if (canvasBounds) {
      console.log('Clicking canvas to fire hook...');
      await page.mouse.click(canvasBounds.x + canvasBounds.width / 2, canvasBounds.y + canvasBounds.height / 2);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'debug-5-hook-fired.png' });
      console.log('Screenshot saved: debug-5-hook-fired.png');
    }
  } else {
    console.log('Canvas not visible, checking page state...');
    
    // Get all visible text on page
    const pageText = await page.textContent('body');
    console.log('Page content:', pageText);
  }
  
  // Keep browser open for manual inspection
  console.log('\nBrowser will stay open for manual debugging.');
  console.log('Press Ctrl+C to close.');
  
  // Keep the script running
  await new Promise(() => {});
})();