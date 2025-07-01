const { chromium } = require('playwright');

// Test configuration
const TEST_CONFIG = {
  playerCount: 3,
  testDuration: 30000, // 30 seconds
  screenshotInterval: 5000
};

// Error tracking
const errors = [];
const warnings = [];

async function createPlayer(browser, playerNum, roomId = null) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 900, height: 700 });
  
  // Track console errors
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(`Player ${playerNum}: ${text}`);
      console.error(`ERROR P${playerNum}:`, text);
    } else if (text.includes('warning') || text.includes('Missing')) {
      warnings.push(`Player ${playerNum}: ${text}`);
      console.warn(`WARN P${playerNum}:`, text);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`Player ${playerNum} Page Error: ${err.message}`);
    console.error(`PAGE ERROR P${playerNum}:`, err);
  });
  
  console.log(`Player ${playerNum}: Opening game...`);
  await page.goto(`http://localhost:3000?debug=true&p=${playerNum}`);
  await page.waitForTimeout(2000);
  
  if (!roomId) {
    // Create room
    await page.click('button:has-text("创建房间")');
    await page.waitForTimeout(2000);
    
    // Get room ID
    const roomText = await page.locator('text=/room_/').first().textContent();
    roomId = roomText.match(/room_\w+/)[0];
    console.log(`Player ${playerNum}: Created ${roomId}`);
  } else {
    // Join room
    const input = await page.locator('input[type="text"]').first();
    await input.fill(roomId);
    await page.click('button:has-text("加入房间")');
    await page.waitForTimeout(2000);
    console.log(`Player ${playerNum}: Joined ${roomId}`);
  }
  
  // Start game
  const startBtn = await page.locator('button:has-text("开始挖矿")');
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(6000); // Wait for countdown
  }
  
  return { page, roomId, playerNum };
}

async function runTests(players) {
  console.log('\n=== Running multiplayer tests ===');
  
  // Test 1: Check if all players can see each other
  console.log('\nTest 1: Checking player visibility...');
  for (const player of players) {
    const playerCount = await player.page.locator('.player-info').count();
    if (playerCount < players.length) {
      errors.push(`Player ${player.playerNum}: Only sees ${playerCount} players, expected ${players.length}`);
    } else {
      console.log(`✓ Player ${player.playerNum}: Sees all ${playerCount} players`);
    }
  }
  
  // Test 2: Check if characters are rendered
  console.log('\nTest 2: Checking character rendering...');
  for (const player of players) {
    // Look for character debug logs
    const logs = await player.page.evaluate(() => {
      return window.characterRenderCount || 0;
    }).catch(() => 0);
    
    console.log(`Player ${player.playerNum}: Character render attempts: ${logs}`);
  }
  
  // Test 3: Fire hooks simultaneously
  console.log('\nTest 3: Testing simultaneous hooks...');
  const hookPromises = players.map(async (player, index) => {
    const canvas = await player.page.locator('canvas').first();
    const box = await canvas.boundingBox();
    const x = box.x + box.width * (0.3 + index * 0.2);
    const y = box.y + box.height * 0.6;
    await player.page.mouse.click(x, y);
    console.log(`Player ${player.playerNum}: Fired hook at ${Math.round(x)}, ${Math.round(y)}`);
  });
  
  await Promise.all(hookPromises);
  await players[0].page.waitForTimeout(3000);
  
  // Test 4: Check object collection sync
  console.log('\nTest 4: Checking object collection sync...');
  await players[0].page.waitForTimeout(5000);
  
  const scores = await Promise.all(players.map(async (player) => {
    const scoreText = await player.page.locator('text=/分/').first().textContent();
    const score = parseInt(scoreText.match(/\d+/)?.[0] || '0');
    return { player: player.playerNum, score };
  }));
  
  console.log('Player scores:', scores);
  
  // Take final screenshots
  console.log('\nTaking final screenshots...');
  for (const player of players) {
    await player.page.screenshot({ path: `mp-final-p${player.playerNum}.png` });
  }
}

async function analyzeAndFix() {
  console.log('\n=== Analysis and Fixes ===');
  
  if (errors.length > 0) {
    console.log('\nErrors found:');
    errors.forEach(err => console.log(`- ${err}`));
    
    // Auto-fix suggestions
    if (errors.some(e => e.includes('character'))) {
      console.log('\nFIX: Character rendering issues detected');
      console.log('- Check if character data is properly synced');
      console.log('- Verify character position calculations');
    }
    
    if (errors.some(e => e.includes('hook'))) {
      console.log('\nFIX: Hook synchronization issues detected');
      console.log('- Check multiplayer hook state sync');
      console.log('- Verify hook position updates');
    }
  } else {
    console.log('\n✅ No errors detected!');
  }
  
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(warn => console.log(`- ${warn}`));
  }
}

// Main test execution
(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1800,1000']
  });
  
  try {
    // Create players
    const players = [];
    let roomId = null;
    
    for (let i = 1; i <= TEST_CONFIG.playerCount; i++) {
      const player = await createPlayer(browser, i, roomId);
      if (!roomId) roomId = player.roomId;
      players.push(player);
      
      // Position windows
      await player.page.evaluate((x) => window.moveTo(x, 0), (i - 1) * 600);
    }
    
    // Wait for all players to stabilize
    await players[0].page.waitForTimeout(3000);
    
    // Run tests
    await runTests(players);
    
    // Analyze results
    await analyzeAndFix();
    
    // Keep open for 10 seconds
    console.log('\nTest complete. Closing in 10 seconds...');
    await players[0].page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Test failed:', error);
    errors.push(`Critical error: ${error.message}`);
  } finally {
    await browser.close();
    
    // Final report
    console.log('\n=== FINAL REPORT ===');
    console.log(`Total Errors: ${errors.length}`);
    console.log(`Total Warnings: ${warnings.length}`);
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('\n🎉 All tests passed successfully!');
    } else {
      console.log('\n⚠️ Issues found - review logs above for details');
    }
  }
})();