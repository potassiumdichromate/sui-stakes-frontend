// ==========================================
// BLOCKCHAIN INTEGRATION
// ==========================================

let blockchainMode = (window.parent !== window);
let blockchainBalance = 0;
let serverMinePositions = new Set(); // Mines from blockchain
let blockchainRoundActive = false;

if (blockchainMode) {
    console.log('🔗 Blockchain mode enabled');
    window.parent.postMessage({ type: 'MINES_READY' }, '*');
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'BALANCE_UPDATE') {
        blockchainBalance = event.data.balance;
        console.log('💰 Balance updated:', blockchainBalance);
        updateUI();
    }
});

// ==========================================
// GAME STATE
// ==========================================

const STATE = {
    bet: 0.01,
    mines: 3,
    roundActive: false,
    tilesClicked: 0,
    currentMultiplier: 1.0,
    profit: 0,
    minePositions: new Set(),
    revealedTiles: new Set(),
    clickedOrder: [], // Track click order for blockchain
};

// ==========================================
// UI ELEMENTS
// ==========================================

const el = id => document.getElementById(id);
const grid = el('grid');
const balanceEl = el('balance');
const betInput = el('bet');
const mineRange = el('mineCount');
const mineView = el('mineCountView');
const betBtn = el('betBtn');
const cashoutBtn = el('cashoutBtn');
const multView = el('multView');
const profitView = el('profitView');
const revealedView = el('revealedView');
const toastEl = el('toast');

// ==========================================
// GRID SETUP
// ==========================================

function createGrid() {
    grid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const tile = document.createElement('button');
        tile.className = 'tile';
        tile.dataset.index = i;
        tile.addEventListener('click', () => clickTile(i));
        grid.appendChild(tile);
    }
}

// ==========================================
// START ROUND
// ==========================================

function startRound() {
    if (STATE.roundActive) return;
    
    STATE.bet = parseFloat(betInput.value) || 0.01;
    STATE.mines = parseInt(mineRange.value) || 3;
    
    const balance = blockchainMode ? blockchainBalance : 1000;
    
    console.log('🎮 Start round - Balance:', balance, 'Bet:', STATE.bet);
    
    if (STATE.bet > balance) {
        toast('❌ Insufficient balance!');
        return;
    }
    
    if (STATE.bet < 0.01) {
        toast('❌ Minimum bet is 0.01 SUI');
        return;
    }
    
    // Generate mines (locally or get from blockchain later)
    STATE.minePositions = generateMines(STATE.mines);
    STATE.revealedTiles = new Set();
    STATE.clickedOrder = [];
    STATE.tilesClicked = 0;
    STATE.currentMultiplier = 1.0;
    STATE.profit = 0;
    STATE.roundActive = true;
    
    createGrid();
    
    betBtn.style.display = 'none';
    cashoutBtn.style.display = 'block';
    cashoutBtn.disabled = true;
    betInput.disabled = true;
    mineRange.disabled = true;
    
    updateUI();
    toast('🎮 Click tiles to find gems!');
}

function generateMines(count) {
    const mines = new Set();
    while (mines.size < count) {
        mines.add(Math.floor(Math.random() * 25));
    }
    return mines;
}

// ==========================================
// CLICK TILE - MANUAL CLICKING!
// ==========================================

function clickTile(index) {
    if (!STATE.roundActive) {
        toast('⚠️ Click BET to start!');
        return;
    }
    if (STATE.revealedTiles.has(index)) {
        return; // Already clicked
    }
    
    const tile = grid.children[index];
    tile.classList.add('revealed');
    STATE.revealedTiles.add(index);
    STATE.clickedOrder.push(index);
    
    // Check if mine
    if (STATE.minePositions.has(index)) {
        // HIT MINE!
        tile.classList.add('mine');
        tile.innerHTML = '💣';
        
        // Reveal all other mines
        STATE.minePositions.forEach(mineIdx => {
            if (mineIdx !== index) {
                const mineTile = grid.children[mineIdx];
                mineTile.classList.add('revealed', 'mine');
                mineTile.innerHTML = '💣';
            }
        });
        
        if (blockchainMode) {
            // Send to blockchain to finalize loss
            sendBlockchainBet(false);
        }
        
        endRound(false);
        toast('💥 BOOM! You hit a mine!');
    } else {
        // SAFE TILE!
        tile.classList.add('safe');
        tile.innerHTML = '💎';
        
        STATE.tilesClicked++;
        
        // Calculate multiplier
        const totalTiles = 25;
        const totalSafe = totalTiles - STATE.mines;
        const remainingTiles = totalTiles - STATE.tilesClicked;
        const remainingSafe = totalSafe - STATE.tilesClicked;
        
        if (remainingSafe > 0) {
            const stepMultiplier = (remainingTiles + 1) / remainingSafe;
            STATE.currentMultiplier *= stepMultiplier;
        }
        
        STATE.profit = (STATE.bet * STATE.currentMultiplier) - STATE.bet;
        
        cashoutBtn.disabled = false;
        updateUI();
        toast(`💎 Gem found! Next: ${STATE.currentMultiplier.toFixed(2)}x`);
    }
}

// ==========================================
// CASHOUT
// ==========================================

function cashout() {
    if (!STATE.roundActive) return;
    if (STATE.tilesClicked === 0) return;
    
    if (blockchainMode) {
        // Send to blockchain to finalize win
        sendBlockchainBet(true);
    }
    
    const payout = STATE.bet * STATE.currentMultiplier;
    
    if (!blockchainMode) {
        // Local mode only
        blockchainBalance += payout;
    }
    
    endRound(true);
    toast(`✅ Cashed out! +${STATE.profit.toFixed(4)} SUI`);
}

function sendBlockchainBet(won) {
    if (!blockchainMode) return;
    
    console.log('📤 Sending blockchain bet:', {
        betAmount: STATE.bet,
        minesCount: STATE.mines,
        tilesRevealed: STATE.clickedOrder,
        won
    });
    
    window.parent.postMessage({
        type: 'MINES_BET_REQUEST',
        data: {
            betAmount: STATE.bet,
            minesCount: STATE.mines,
            tilesToReveal: STATE.clickedOrder
        }
    }, '*');
}

// ==========================================
// END ROUND
// ==========================================

function endRound(won) {
    STATE.roundActive = false;
    
    // Disable all tiles
    Array.from(grid.children).forEach(tile => {
        tile.classList.add('disabled');
    });
    
    // Reset UI
    setTimeout(() => {
        betBtn.style.display = 'block';
        cashoutBtn.style.display = 'none';
        betInput.disabled = false;
        mineRange.disabled = false;
        
        updateUI();
    }, 2000);
}

// ==========================================
// UI UPDATES
// ==========================================

function updateUI() {
    const balance = blockchainMode ? blockchainBalance : 1000;
    balanceEl.textContent = balance.toFixed(4);
    
    multView.textContent = STATE.currentMultiplier.toFixed(2) + '×';
    profitView.textContent = STATE.profit.toFixed(4) + (blockchainMode ? ' SUI' : '');
    revealedView.textContent = STATE.tilesClicked;
}

function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2500);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

betBtn.addEventListener('click', startRound);
cashoutBtn.addEventListener('click', cashout);

betInput.addEventListener('change', () => {
    STATE.bet = parseFloat(betInput.value) || 0.01;
});

mineRange.addEventListener('input', () => {
    STATE.mines = parseInt(mineRange.value);
    mineView.textContent = STATE.mines;
});

// ==========================================
// INITIALIZE
// ==========================================

createGrid();
updateUI();

console.log('✅ Mines loaded - Blockchain:', blockchainMode);