const { chromium } = require('playwright');

async function createAndJoinGame(browser, playerNum, roomId = null) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 900, height: 700 });
  
  console.log(`Player ${playerNum}: Opening game...`);
  await page.goto(`http://localhost:3000?debug=true&p=${playerNum}`);
  await page.waitForTimeout(2000);
  
  if (!roomId) {
    // Player 1 creates room
    console.log(`Player ${playerNum}: Creating room...`);
    await page.click('button:has-text("创建房间")');
    await page.waitForTimeout(2000);
    
    // Get room ID
    const roomText = await page.locator('text=/room_/').first().textContent();
    roomId = roomText.match(/room_\w+/)[0];
    console.log(`Player ${playerNum}: Created ${roomId}`);
  } else {
    // Other players join room
    console.log(`Player ${playerNum}: Joining ${roomId}...`);
    const input = await page.locator('input[type="text"]').first();
    await input.fill(roomId);
    await page.click('button:has-text("加入房间")');
    await page.waitForTimeout(2000);
  }
  
  // Start game
  const startBtn = await page.locator('button:has-text("开始挖矿")');
  if (await startBtn.isVisible()) {
    console.log(`Player ${playerNum}: Starting game...`);
    await startBtn.click();
    await page.waitForTimeout(5000); // Wait for countdown
  }
  
  return { page, roomId };
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1800,1000']
  });
  
  try {
    // Create 3 players
    console.log('=== Creating multiplayer game ===\n');
    
    const { page: page1, roomId } = await createAndJoinGame(browser, 1);
    const { page: page2 } = await createAndJoinGame(browser, 2, roomId);
    const { page: page3 } = await createAndJoinGame(browser, 3, roomId);
    
    // Position windows
    await page1.evaluate(() => window.moveTo(0, 0));
    await page2.evaluate(() => window.moveTo(600, 0));
    await page3.evaluate(() => window.moveTo(1200, 0));
    
    console.log('\n=== All players ready! ===');
    await page1.waitForTimeout(2000);
    
    // Take screenshots showing all characters
    await page1.screenshot({ path: 'final-mp-p1.png' });
    await page2.screenshot({ path: 'final-mp-p2.png' });
    await page3.screenshot({ path: 'final-mp-p3.png' });
    
    // Simulate gameplay
    console.log('\n=== Simulating gameplay ===');
    
    // Fire hooks at different angles
    const canvas1 = await page1.locator('canvas').first();
    const box1 = await canvas1.boundingBox();
    await page1.mouse.click(box1.x + box1.width * 0.3, box1.y + box1.height * 0.6);
    console.log('Player 1: Fired hook left');
    
    await page1.waitForTimeout(1000);
    
    const canvas2 = await page2.locator('canvas').first();
    const box2 = await canvas2.boundingBox();
    await page2.mouse.click(box2.x + box2.width * 0.5, box2.y + box2.height * 0.7);
    console.log('Player 2: Fired hook center');
    
    await page1.waitForTimeout(1000);
    
    const canvas3 = await page3.locator('canvas').first();
    const box3 = await canvas3.boundingBox();
    await page3.mouse.click(box3.x + box3.width * 0.7, box3.y + box3.height * 0.6);
    console.log('Player 3: Fired hook right');
    
    // Wait for action
    await page1.waitForTimeout(4000);
    
    // Final screenshots
    await page1.screenshot({ path: 'final-mp-p1-action.png' });
    await page2.screenshot({ path: 'final-mp-p2-action.png' });
    await page3.screenshot({ path: 'final-mp-p3-action.png' });
    
    console.log('\n=== Multiplayer test complete! ===');
    console.log('Check screenshots:');
    console.log('- final-mp-p1.png, final-mp-p2.png, final-mp-p3.png (initial)');
    console.log('- final-mp-p1-action.png, etc. (during gameplay)');
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  console.log('\nTest finished. Closing in 5 seconds...');
  await page1.waitForTimeout(5000);
  await browser.close();
})();