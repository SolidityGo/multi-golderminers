const { chromium } = require('playwright');

async function createPlayer(browser, playerNum) {
  const context = await browser.newContext({
    viewport: { width: 800, height: 700 }
  });
  const page = await context.newPage();
  
  // Generate unique debug address for each player
  const debugAddress = `0xdebug${playerNum}${Math.random().toString(36).substr(2, 6)}`;
  
  // Navigate to debug mode
  await page.goto(`http://localhost:3000?debug=true`);
  await page.waitForTimeout(2000);
  
  // Override the debug player creation to use unique address
  await page.evaluate((addr) => {
    localStorage.setItem('debugAddress', addr);
  }, debugAddress);
  
  return { page, context, debugAddress };
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1600,900']
  });
  
  try {
    console.log('=== Creating Player 1 ===');
    const player1 = await createPlayer(browser, 1);
    
    // Don't click start - go directly to room creation
    console.log('Player 1: Looking for create room button...');
    await player1.page.waitForTimeout(1000);
    
    // Player 1 creates room
    const createBtn = await player1.page.locator('button:has-text("创建房间")').first();
    if (await createBtn.isVisible()) {
      console.log('Player 1: Creating room...');
      await createBtn.click();
      await player1.page.waitForTimeout(3000);
      
      // Look for room ID
      const roomIdElement = await player1.page.locator('text=/room_\\w+/').first();
      let roomId = null;
      
      if (await roomIdElement.isVisible()) {
        roomId = await roomIdElement.textContent();
        console.log(`Player 1: Created room: ${roomId}`);
      } else {
        // Try to find room ID in different places
        const pageContent = await player1.page.content();
        const roomMatch = pageContent.match(/room_\w+/);
        if (roomMatch) {
          roomId = roomMatch[0];
          console.log(`Player 1: Found room ID in page: ${roomId}`);
        }
      }
      
      // Click start game button
      const startBtn = await player1.page.locator('button:has-text("开始挖矿")').first();
      if (await startBtn.isVisible()) {
        console.log('Player 1: Starting game...');
        await startBtn.click();
        await player1.page.waitForTimeout(5000); // Wait for countdown
      }
      
      if (roomId) {
        // Create Player 2
        console.log('\n=== Creating Player 2 ===');
        const player2 = await createPlayer(browser, 2);
        
        // Player 2 joins room
        const joinInput = await player2.page.locator('input[type="text"]').first();
        if (await joinInput.isVisible()) {
          console.log(`Player 2: Entering room ID: ${roomId}`);
          await joinInput.fill(roomId);
          
          const joinBtn = await player2.page.locator('button:has-text("加入房间")').first();
          if (await joinBtn.isVisible()) {
            console.log('Player 2: Joining room...');
            await joinBtn.click();
            await player2.page.waitForTimeout(2000);
            
            // Start game for player 2
            const startBtn2 = await player2.page.locator('button:has-text("开始挖矿")').first();
            if (await startBtn2.isVisible()) {
              console.log('Player 2: Starting game...');
              await startBtn2.click();
              await player2.page.waitForTimeout(5000);
            }
          }
        }
        
        // Create Player 3
        console.log('\n=== Creating Player 3 ===');
        const player3 = await createPlayer(browser, 3);
        
        // Player 3 joins room
        const joinInput3 = await player3.page.locator('input[type="text"]').first();
        if (await joinInput3.isVisible()) {
          console.log(`Player 3: Entering room ID: ${roomId}`);
          await joinInput3.fill(roomId);
          
          const joinBtn3 = await player3.page.locator('button:has-text("加入房间")').first();
          if (await joinBtn3.isVisible()) {
            console.log('Player 3: Joining room...');
            await joinBtn3.click();
            await player3.page.waitForTimeout(2000);
            
            // Start game for player 3
            const startBtn3 = await player3.page.locator('button:has-text("开始挖矿")').first();
            if (await startBtn3.isVisible()) {
              console.log('Player 3: Starting game...');
              await startBtn3.click();
              await player3.page.waitForTimeout(5000);
            }
          }
        }
        
        // Position windows
        await player1.page.evaluate(() => window.moveTo(0, 0));
        await player2.page.evaluate(() => window.moveTo(550, 0));
        await player3.page.evaluate(() => window.moveTo(1100, 0));
        
        // Wait for all games to be ready
        console.log('\n=== Waiting for all players to be ready ===');
        await player1.page.waitForTimeout(3000);
        
        // Take screenshots
        console.log('\n=== Taking initial screenshots ===');
        await player1.page.screenshot({ path: 'mp-player1-initial.png' });
        await player2.page.screenshot({ path: 'mp-player2-initial.png' });
        await player3.page.screenshot({ path: 'mp-player3-initial.png' });
        
        // Simulate gameplay
        console.log('\n=== Simulating gameplay ===');
        
        // Each player fires hook at different times
        const canvas1 = await player1.page.locator('canvas').first();
        if (await canvas1.isVisible()) {
          console.log('Player 1: Firing hook...');
          await canvas1.click();
        }
        
        await player1.page.waitForTimeout(1500);
        
        const canvas2 = await player2.page.locator('canvas').first();
        if (await canvas2.isVisible()) {
          console.log('Player 2: Firing hook...');
          await canvas2.click();
        }
        
        await player1.page.waitForTimeout(1500);
        
        const canvas3 = await player3.page.locator('canvas').first();
        if (await canvas3.isVisible()) {
          console.log('Player 3: Firing hook...');
          await canvas3.click();
        }
        
        // Wait for action
        await player1.page.waitForTimeout(3000);
        
        // Take action screenshots
        console.log('\n=== Taking action screenshots ===');
        await player1.page.screenshot({ path: 'mp-player1-action.png' });
        await player2.page.screenshot({ path: 'mp-player2-action.png' });
        await player3.page.screenshot({ path: 'mp-player3-action.png' });
        
        console.log('\n=== Test complete! ===');
        console.log('Screenshots saved:');
        console.log('- mp-player1-initial.png, mp-player1-action.png');
        console.log('- mp-player2-initial.png, mp-player2-action.png');
        console.log('- mp-player3-initial.png, mp-player3-action.png');
      }
    } else {
      console.log('Create room button not found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  console.log('\nKeeping browsers open. Press Ctrl+C to close.');
  await new Promise(() => {});
})();