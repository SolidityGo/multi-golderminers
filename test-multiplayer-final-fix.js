const { chromium } = require('playwright');

async function testMultiplayerWithFixes() {
  console.log('=== TESTING MULTIPLAYER WITH FIXES ===\n');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1800,1000']
  });
  
  try {
    // Create 3 players
    const players = [];
    let roomId = null;
    
    for (let i = 1; i <= 3; i++) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 900, height: 700 });
      
      console.log(`Creating Player ${i}...`);
      await page.goto(`http://localhost:3000?debug=true&player=${i}`);
      await page.waitForTimeout(2000);
      
      if (i === 1) {
        // Player 1 creates room
        await page.click('button:has-text("创建房间")');
        await page.waitForTimeout(2000);
        
        // Get room ID
        const roomText = await page.locator('text=/room_/').first().textContent();
        roomId = roomText.match(/room_\w+/)[0];
        console.log(`Player 1 created room: ${roomId}`);
      } else {
        // Other players join
        console.log(`Player ${i} joining room ${roomId}...`);
        const input = await page.locator('input[type="text"]').first();
        await input.fill(roomId);
        await page.click('button:has-text("加入房间")');
        await page.waitForTimeout(2000);
      }
      
      // Start game
      const startBtn = await page.locator('button:has-text("开始挖矿")');
      if (await startBtn.isVisible()) {
        await startBtn.click();
      }
      
      players.push({ page, num: i });
      
      // Position window
      await page.evaluate((x) => window.moveTo(x, 0), (i - 1) * 600);
    }
    
    // Wait for games to start
    console.log('\nWaiting for all games to start...');
    await players[0].page.waitForTimeout(6000);
    
    // Check player visibility
    console.log('\n=== CHECKING PLAYER VISIBILITY ===');
    for (const player of players) {
      const playerData = await player.page.evaluate(() => {
        const store = window.useGameStore?.getState?.() || 
                     window.__zustand_stores__?.[0]?.getState?.() ||
                     {};
        return {
          currentPlayer: store.currentPlayer?.name || 'Unknown',
          playerCount: store.players?.size || 0,
          playerNames: store.players ? Array.from(store.players.values()).map(p => p.name) : []
        };
      });
      
      console.log(`Player ${player.num}:`, JSON.stringify(playerData, null, 2));
    }
    
    // Test hook firing
    console.log('\n=== TESTING HOOKS ===');
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const canvas = await player.page.locator('canvas').first();
      const box = await canvas.boundingBox();
      
      await player.page.mouse.click(
        box.x + box.width * (0.3 + i * 0.2),
        box.y + box.height * 0.6
      );
      console.log(`Player ${player.num} fired hook`);
      await player.page.waitForTimeout(1000);
    }
    
    // Wait for hooks to complete
    await players[0].page.waitForTimeout(5000);
    
    // Take final screenshots
    console.log('\n=== TAKING FINAL SCREENSHOTS ===');
    for (const player of players) {
      await player.page.screenshot({ path: `final-test-p${player.num}.png` });
    }
    
    // Check for objects with new renderer
    console.log('\n=== CHECKING NEW OBJECT RENDERING ===');
    const canvasScreenshot = await players[0].page.locator('canvas').screenshot({ path: 'final-objects-check.png' });
    console.log('Canvas screenshot saved to final-objects-check.png');
    
    console.log('\n✅ Test complete!');
    console.log('Check screenshots:');
    console.log('- final-test-p1.png, final-test-p2.png, final-test-p3.png');
    console.log('- final-objects-check.png (new object rendering)');
    
    // Keep open for manual inspection
    console.log('\nKeeping browsers open for 15 seconds...');
    await players[0].page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testMultiplayerWithFixes().catch(console.error);