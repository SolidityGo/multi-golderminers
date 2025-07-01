const { chromium } = require('playwright');

async function createPlayer(context, playerNum) {
  const page = await context.newPage();
  
  // Set viewport to see multiple windows
  await page.setViewportSize({ width: 800, height: 600 });
  
  // Navigate to debug mode
  await page.goto(`http://localhost:3000?debug=true&player=${playerNum}`);
  await page.waitForTimeout(2000);
  
  return page;
}

async function startGame(page, playerName) {
  console.log(`${playerName}: Starting game...`);
  
  // Click start game
  const startButton = await page.locator('button:has-text("开始挖矿冒险")');
  if (await startButton.isVisible()) {
    await startButton.click();
    await page.waitForTimeout(1000);
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1600,900']
  });
  
  // Create context for multiple players
  const context = await browser.newContext();
  
  // Enable console logging for debugging
  context.on('console', msg => {
    const text = msg.text();
    if (text.includes('房间') || text.includes('玩家') || text.includes('Player') || text.includes('room')) {
      console.log('GAME:', text);
    }
  });
  
  try {
    // Create Player 1
    console.log('\n=== Creating Player 1 ===');
    const player1 = await createPlayer(context, 1);
    await startGame(player1, 'Player 1');
    
    // Player 1 creates a room
    const createRoomBtn = await player1.locator('button:has-text("创建房间")');
    if (await createRoomBtn.isVisible()) {
      console.log('Player 1: Creating room...');
      await createRoomBtn.click();
      await player1.waitForTimeout(2000);
      
      // Get room ID from the page
      const roomInfo = await player1.locator('text=/room_/').first();
      if (await roomInfo.isVisible()) {
        const roomId = await roomInfo.textContent();
        console.log(`Player 1: Created room ${roomId}`);
        
        // Wait for game to load
        console.log('Player 1: Waiting for game to start...');
        await player1.waitForTimeout(4000);
        
        // Create Player 2
        console.log('\n=== Creating Player 2 ===');
        const player2 = await createPlayer(context, 2);
        await startGame(player2, 'Player 2');
        
        // Player 2 joins the room
        const joinInput = await player2.locator('input[placeholder*="房间ID"]');
        if (await joinInput.isVisible()) {
          console.log(`Player 2: Entering room ID ${roomId}`);
          await joinInput.fill(roomId);
          
          const joinButton = await player2.locator('button:has-text("加入房间")');
          if (await joinButton.isVisible()) {
            console.log('Player 2: Joining room...');
            await joinButton.click();
            await player2.waitForTimeout(4000);
          }
        }
        
        // Create Player 3
        console.log('\n=== Creating Player 3 ===');
        const player3 = await createPlayer(context, 3);
        await startGame(player3, 'Player 3');
        
        // Player 3 joins the room
        const joinInput3 = await player3.locator('input[placeholder*="房间ID"]');
        if (await joinInput3.isVisible()) {
          console.log(`Player 3: Entering room ID ${roomId}`);
          await joinInput3.fill(roomId);
          
          const joinButton3 = await player3.locator('button:has-text("加入房间")');
          if (await joinButton3.isVisible()) {
            console.log('Player 3: Joining room...');
            await joinButton3.click();
            await player3.waitForTimeout(4000);
          }
        }
        
        // Wait a bit for all players to sync
        console.log('\n=== All players joined, waiting for sync ===');
        await player1.waitForTimeout(2000);
        
        // Arrange windows for visibility
        await player1.evaluate(() => window.moveTo(0, 0));
        await player2.evaluate(() => window.moveTo(600, 0));
        await player3.evaluate(() => window.moveTo(1200, 0));
        
        // Take screenshots of each player's view
        console.log('\n=== Taking screenshots ===');
        await player1.screenshot({ path: 'multiplayer-player1.png' });
        await player2.screenshot({ path: 'multiplayer-player2.png' });
        await player3.screenshot({ path: 'multiplayer-player3.png' });
        
        // Simulate gameplay - each player fires hook
        console.log('\n=== Starting multiplayer gameplay ===');
        
        // Player 1 fires hook
        const canvas1 = await player1.locator('canvas').first();
        if (await canvas1.isVisible()) {
          console.log('Player 1: Firing hook...');
          const box1 = await canvas1.boundingBox();
          await player1.mouse.click(box1.x + box1.width/2, box1.y + box1.height/2);
        }
        
        await player1.waitForTimeout(1000);
        
        // Player 2 fires hook
        const canvas2 = await player2.locator('canvas').first();
        if (await canvas2.isVisible()) {
          console.log('Player 2: Firing hook...');
          const box2 = await canvas2.boundingBox();
          await player2.mouse.click(box2.x + box2.width/2, box2.y + box2.height/2);
        }
        
        await player1.waitForTimeout(1000);
        
        // Player 3 fires hook
        const canvas3 = await player3.locator('canvas').first();
        if (await canvas3.isVisible()) {
          console.log('Player 3: Firing hook...');
          const box3 = await canvas3.boundingBox();
          await player3.mouse.click(box3.x + box3.width/2, box3.y + box3.height/2);
        }
        
        // Wait for hooks to extend
        await player1.waitForTimeout(3000);
        
        // Take action screenshots
        console.log('\n=== Taking action screenshots ===');
        await player1.screenshot({ path: 'multiplayer-action-player1.png' });
        await player2.screenshot({ path: 'multiplayer-action-player2.png' });
        await player3.screenshot({ path: 'multiplayer-action-player3.png' });
        
        console.log('\n=== Multiplayer test complete! ===');
        console.log('Check the screenshot files to see:');
        console.log('- multiplayer-player1.png: Player 1 view');
        console.log('- multiplayer-player2.png: Player 2 view');
        console.log('- multiplayer-player3.png: Player 3 view');
        console.log('- multiplayer-action-*.png: Views during gameplay');
        
      } else {
        console.log('Player 1: Could not find room ID');
      }
    } else {
      console.log('Player 1: Create room button not found');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
  
  // Keep browsers open for manual inspection
  console.log('\nBrowsers will stay open. Press Ctrl+C to close.');
  await new Promise(() => {});
})();