const { chromium } = require('playwright');

// Comprehensive multiplayer debugging and fixing
async function debugMultiplayer() {
  const browser = await chromium.launch({ headless: false });
  
  console.log('=== MULTIPLAYER DEBUG AND FIX ===\n');
  
  // Step 1: Check the multisynq sync implementation
  console.log('Step 1: Analyzing multiplayer sync...');
  
  const testPage = await browser.newPage();
  await testPage.goto('http://localhost:3000?debug=true');
  await testPage.waitForTimeout(2000);
  
  // Inject debugging code
  await testPage.evaluate(() => {
    // Add debug logging to multisynq
    window.multisynqDebug = {
      messages: [],
      players: new Map()
    };
    
    // Override console.log to capture multisynq messages
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      const msg = args.join(' ');
      if (msg.includes('房间') || msg.includes('玩家') || msg.includes('Player') || msg.includes('room')) {
        window.multisynqDebug.messages.push(msg);
      }
    };
  });
  
  // Create room
  await testPage.click('button:has-text("创建房间")');
  await testPage.waitForTimeout(2000);
  
  // Get room ID
  const roomId = await testPage.evaluate(() => {
    const roomEl = document.querySelector('[class*="room"], [id*="room"], text');
    const text = document.body.innerText;
    const match = text.match(/room_\w+/);
    return match ? match[0] : null;
  });
  
  console.log(`Created room: ${roomId}`);
  
  // Check player store
  const storeInfo = await testPage.evaluate(() => {
    const store = window.useGameStore?.getState?.();
    return {
      hasStore: !!store,
      currentPlayer: store?.currentPlayer,
      playerCount: store?.players?.size || 0,
      players: store?.players ? Array.from(store.players.entries()) : []
    };
  });
  
  console.log('\nStore info:', JSON.stringify(storeInfo, null, 2));
  
  // Step 2: Test with multiple players
  console.log('\nStep 2: Creating multiple players...');
  
  const player2 = await browser.newPage();
  await player2.goto('http://localhost:3000?debug=true');
  await player2.waitForTimeout(2000);
  
  // Player 2 joins
  const joinInput = await player2.locator('input[type="text"]');
  await joinInput.fill(roomId);
  await player2.click('button:has-text("加入房间")');
  await player2.waitForTimeout(3000);
  
  // Check sync messages
  const syncMessages = await testPage.evaluate(() => window.multisynqDebug.messages);
  console.log('\nSync messages:', syncMessages);
  
  // Check both players' states
  const p1State = await testPage.evaluate(() => {
    const store = window.useGameStore?.getState?.();
    return {
      playerCount: store?.players?.size || 0,
      players: store?.players ? Array.from(store.players.keys()) : []
    };
  });
  
  const p2State = await player2.evaluate(() => {
    const store = window.useGameStore?.getState?.();
    return {
      playerCount: store?.players?.size || 0,
      players: store?.players ? Array.from(store.players.keys()) : []
    };
  });
  
  console.log('\nPlayer 1 state:', p1State);
  console.log('Player 2 state:', p2State);
  
  // Step 3: Identify issues
  console.log('\n=== ISSUE ANALYSIS ===');
  
  const issues = [];
  
  if (p1State.playerCount < 2) {
    issues.push('Player 1 does not see Player 2');
  }
  if (p2State.playerCount < 2) {
    issues.push('Player 2 does not see Player 1');
  }
  
  if (issues.length > 0) {
    console.log('\nIssues found:');
    issues.forEach(issue => console.log(`- ${issue}`));
    
    console.log('\nPossible causes:');
    console.log('1. Multisynq mock implementation not broadcasting properly');
    console.log('2. Player join messages not being sent/received');
    console.log('3. Store not updating with new players');
    
    console.log('\nChecking mock implementation...');
    
    // Check if mock is working
    const mockStatus = await testPage.evaluate(() => {
      // Check if broadcast is being called
      const room = window.mockRoom;
      return {
        hasRoom: !!room,
        hasBroadcast: typeof room?.broadcast === 'function'
      };
    });
    
    console.log('Mock status:', mockStatus);
  } else {
    console.log('\n✅ Multiplayer sync is working correctly!');
  }
  
  // Take debug screenshots
  await testPage.screenshot({ path: 'debug-mp-p1.png' });
  await player2.screenshot({ path: 'debug-mp-p2.png' });
  
  await browser.close();
  
  console.log('\n=== DEBUG COMPLETE ===');
  console.log('Check debug-mp-p1.png and debug-mp-p2.png for visual inspection');
}

// Run the debug
debugMultiplayer().catch(console.error);