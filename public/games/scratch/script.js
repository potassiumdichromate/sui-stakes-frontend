// ==========================================
// BLOCKCHAIN/BACKEND INTEGRATION
// ==========================================

let blockchainMode = (window.parent !== window);
let platformBalance = 0;

const API_URL = 'http://localhost:3001';

// Symbol name mapping for backend
const SYMBOL_MAP = {
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cherries/3D/cherries_3d.png': 'cherry',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Lemon/3D/lemon_3d.png': 'lemon',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Grapes/3D/grapes_3d.png': 'grape',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Gem%20stone/3D/gem_stone_3d.png': 'gem',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bell/3D/bell_3d.png': 'bell',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Crown/3D/crown_3d.png': 'crown',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Four%20leaf%20clover/3D/four_leaf_clover_3d.png': 'clover',
    'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Star/3D/star_3d.png': 'star'
};

// Reverse mapping
const SYMBOL_URL_MAP = Object.fromEntries(
    Object.entries(SYMBOL_MAP).map(([url, name]) => [name, url])
);

if (blockchainMode) {
    console.log('🎰 Platform mode enabled for Scratch');
    window.parent.postMessage({ type: 'SCRATCH_READY' }, '*');
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'BALANCE_UPDATE') {
        platformBalance = event.data.balance;
        console.log('💰 Balance updated:', platformBalance);
        if (window.app) {
            app.wallet.balance = platformBalance;
            app.ui.updateBalance();
        }
    }
    
    if (event.data.type === 'BLOCKCHAIN_RESULT') {
        console.log('📊 Blockchain result:', event.data.data);
        if (window.app) {
            app.game.handleBlockchainResult(event.data.data);
        }
    }
    
    if (event.data.type === 'BATCH_RESULT') {
        console.log('📦 Batch result:', event.data.data);
        if (window.app) {
            app.game.handleBatchResult(event.data.data);
        }
    }
    
    if (event.data.type === 'BET_FAILED') {
        console.error('❌ Bet failed:', event.data.error);
        if (window.app) {
            app.game.handleBetFailed(event.data.error);
        }
    }

    if (event.data.type === 'ADDRESS_RESPONSE') {
        if (window.app && window.app.game.addressResolver) {
            app.game.addressResolver(event.data.address);
        }
    }
});

// ==========================================
// GAME CONFIGURATION
// ==========================================

const app = {
    config: {
        currency: blockchainMode ? 'SUI' : '', 
        startingBalance: blockchainMode ? 0 : 1000,
        minWithdraw: 5,
        maxWithdraw: 50,
        cards: {
            standard: { name: 'Standard', cost: blockchainMode ? 0.01 : 10, payout: [0, 0, 2, 5, 10, 50], color: '#3b82f6' },
            silver: { name: 'Silver 7s', cost: blockchainMode ? 0.05 : 50, payout: [0, 0, 5, 10, 25, 100], color: '#94a3b8' },
            gold: { name: 'Gold Rush', cost: blockchainMode ? 0.1 : 100, payout: [0, 0, 10, 50, 100, 500], color: '#eab308' },
            platinum: { name: 'Platinum', cost: blockchainMode ? 0.5 : 500, payout: [0, 0, 5, 100, 1000, 5000], color: '#a855f7' } 
        },
        sounds: true
    },
    state: {
        gameActive: false,
        forcedWin: false,
        betAmount: blockchainMode ? 0.01 : 10,
        selectedCardType: 'standard',
        currentOutcome: null,
        batchResults: []
    },

    // --- Theme Manager ---
    themes: {
        list: [
            { id: 'gold', name: 'Neon Gold', primary: '#ffd700', secondary: '#00f3ff', locked: false },
            { id: 'ruby', name: 'Cyber Ruby', primary: '#ff0055', secondary: '#ffcc00', locked: false },
            { id: 'matrix', name: 'Matrix Green', primary: '#00ff41', secondary: '#003b00', locked: false },
            { id: 'ocean', name: 'Deep Ocean', primary: '#0066ff', secondary: '#00ffff', locked: true },
            { id: 'purple', name: 'Ultra Violet', primary: '#bf00ff', secondary: '#ff00ff', locked: true },
            { id: 'sunset', name: 'Sunset Blvd', primary: '#ff4d00', secondary: '#ffcc00', locked: true },
            { id: 'teal', name: 'Electric Teal', primary: '#008080', secondary: '#00ffcc', locked: true },
            { id: 'mono', name: 'Monochrome', primary: '#ffffff', secondary: '#808080', locked: true },
            { id: 'hotpink', name: 'Hot Pink', primary: '#ff1493', secondary: '#ff69b4', locked: true },
            { id: 'lime', name: 'Acid Lime', primary: '#ccff00', secondary: '#000000', locked: true }
        ],
        unlocked: ['gold', 'ruby', 'matrix'], 
        current: 'gold',

        init: function() {
            if (blockchainMode) return; // Don't load themes in blockchain mode
            
            const saved = localStorage.getItem('scratcher_themes');
            const savedCurrent = localStorage.getItem('scratcher_current_theme');
            if(saved) this.unlocked = JSON.parse(saved);
            if(savedCurrent) this.apply(savedCurrent);
            else this.apply('gold');
        },
        apply: function(id) {
            const t = this.list.find(x => x.id === id);
            if(!t) return;
            this.current = id;
            document.documentElement.style.setProperty('--theme-primary', t.primary);
            document.documentElement.style.setProperty('--theme-secondary', t.secondary);
            if (!blockchainMode) localStorage.setItem('scratcher_current_theme', id);
            app.ui.renderThemes();
        },
        unlock: function(id) {
            if(!this.unlocked.includes(id)) {
                this.unlocked.push(id);
                if (!blockchainMode) localStorage.setItem('scratcher_themes', JSON.stringify(this.unlocked));
                this.apply(id);
                app.ui.notify("Theme Unlocked!", 'success');
            }
        }
    },

    // --- Ad Manager ---
    ads: {
        activeCallback: null,
        timer: 10,
        interval: null,
        play: function(type, payload) {
            this.activeCallback = { type, payload };
            this.timer = 10;
            const timerEl = document.getElementById('ad-timer');
            if (timerEl) timerEl.innerText = this.timer;
            
            const modal = document.getElementById('ad-modal');
            if (modal) modal.classList.remove('hidden');
            
            this.interval = setInterval(() => {
                this.timer--;
                if (timerEl) timerEl.innerText = this.timer;
                if(this.timer <= 0) this.finish();
            }, 1000);
        },
        finish: function() {
            clearInterval(this.interval);
            const modal = document.getElementById('ad-modal');
            if (modal) modal.classList.add('hidden');
            
            if(this.activeCallback) {
                const { type, payload } = this.activeCallback;
                if(type === 'add_funds') app.wallet.addFunds(blockchainMode ? 0.5 : 500, 'DEPOSIT', 'Ad Reward');
                else if (type === 'withdraw') app.wallet.processWithdraw();
                else if (type === 'unlock_theme') app.themes.unlock(payload);
                this.activeCallback = null;
            }
        }
    },

    // --- Audio System ---
    audio: {
        ctx: null,
        init: function() {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        },
        playTone: function(freq, type, duration) {
            if (!app.config.sounds || !this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        },
        sfx: {
            click: () => app.audio.playTone(800, 'sine', 0.1),
            win: () => { [440, 554, 659].forEach((f, i) => setTimeout(() => app.audio.playTone(f, 'square', 0.3), i*100)); }
        }
    },

    // --- RNG & Logic ---
    math: {
        random: () => {
            const arr = new Uint32Array(1);
            window.crypto.getRandomValues(arr);
            return arr[0] / (0xffffffff + 1);
        }
    },

    // --- Wallet ---
    wallet: {
        balance: blockchainMode ? 0 : 1000,
        history: [],
        load: function() {
            if (blockchainMode) return;
            
            const stored = localStorage.getItem('scratcher_wallet');
            this.balance = stored ? parseFloat(JSON.parse(stored).balance) : app.config.startingBalance;
            this.history = JSON.parse(localStorage.getItem('scratcher_history')) || [];
            app.ui.updateBalance();
            app.ui.renderHistory();
        },
        save: function() {
            if (blockchainMode) return;
            
            localStorage.setItem('scratcher_wallet', JSON.stringify({ balance: this.balance }));
            localStorage.setItem('scratcher_history', JSON.stringify(this.history));
        },
        deduct: function(amount) {
            const balance = blockchainMode ? platformBalance : this.balance;
            
            if (balance >= amount) {
                if (!blockchainMode) {
                    this.balance -= amount;
                    this.save();
                    app.ui.updateBalance();
                }
                return true;
            }
            return false;
        },
        addFunds: function(amount, type = 'WIN', detail = 'Scratch Win', silent = false) {
            if (blockchainMode) {
                platformBalance += amount;
            } else {
                this.balance += amount;
            }
            
            this.logTransaction(type, amount, detail);
            this.save();
            app.ui.updateBalance();
            
            if(!silent) {
                const decimals = blockchainMode ? 4 : 0;
                app.ui.notify(`${amount.toFixed(decimals)} ${app.config.currency} Added!`, 'success');
                app.audio.sfx.win();
            }
        },
        initiateWithdraw: function() {
            const balance = blockchainMode ? platformBalance : this.balance;
            
            if(balance < app.config.minWithdraw) {
                return app.ui.notify(`Minimum withdrawal is ${app.config.minWithdraw}`, 'error');
            }
            if(balance > app.config.maxWithdraw) {
                return app.ui.notify(`Maximum withdrawal is ${app.config.maxWithdraw}`, 'error');
            }
            app.ads.play('withdraw');
        },
        processWithdraw: function() {
            const amount = blockchainMode ? platformBalance : this.balance;
            
            if (blockchainMode) {
                platformBalance = 0;
            } else {
                this.balance = 0;
            }
            
            this.logTransaction('WITHDRAW', amount, 'To Bank Account');
            this.save();
            app.ui.updateBalance();
            app.ui.closeModals();
            app.ui.notify(`Withdrawal Success! ${amount} sent.`, 'success');
        },
        logTransaction: function(type, amount, detail) {
            this.history.unshift({ 
                time: new Date().toLocaleTimeString(), 
                type, 
                amount: blockchainMode ? amount : Math.floor(amount), 
                detail 
            });
            if (this.history.length > 50) this.history.pop();
            this.save();
            app.ui.renderHistory();
        },
        reset: function() {
            this.balance = 0;
            this.history = [];
            this.save();
            app.ui.updateBalance();
            app.ui.renderHistory();
            app.ui.notify("Wallet Reset", 'info');
        }
    },

    // --- Game Logic ---
    game: {
        symbols: [
            'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cherries/3D/cherries_3d.png',
            'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Lemon/3D/lemon_3d.png',
            'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Grapes/3D/grapes_3d.png',
            'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Gem%20stone/3D/gem_stone_3d.png',
            'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bell/3D/bell_3d.png',
            'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Crown/3D/crown_3d.png',
            'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Four%20leaf%20clover/3D/four_leaf_clover_3d.png',
            'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Star/3D/star_3d.png'
        ],
        rtp: 0.30,
        addressResolver: null,

        adjustBet: function(delta) {
            const minBet = app.config.cards[app.state.selectedCardType].cost;
            let newBet = app.state.betAmount + (blockchainMode ? delta / 1000 : delta);
            if (newBet < minBet) newBet = minBet;
            this.updateBet(newBet);
        },
        setBet: function(val) {
            const minBet = app.config.cards[app.state.selectedCardType].cost;
            let newBet = blockchainMode ? parseFloat(val) : parseInt(val);
            if (isNaN(newBet) || newBet < minBet) newBet = minBet;
            if (newBet > 10) newBet = 10;
            this.updateBet(newBet);
        },
        updateBet: function(newBet) {
            app.state.betAmount = newBet;
            const input = document.getElementById('bet-input');
            if (input) input.value = blockchainMode ? newBet.toFixed(4) : newBet;
        },
        changeCardType: function(type) {
            app.state.selectedCardType = type;
            const cost = app.config.cards[type].cost;
            if (app.state.betAmount < cost) {
                this.updateBet(cost);
            }
        },
        checkLineWin: function(grid) {
            const lines = [
                [0,1,2], [3,4,5], [6,7,8],
                [0,3,6], [1,4,7], [2,5,8],
                [0,4,8], [2,4,6]
            ];
            for (let line of lines) {
                const [a, b, c] = line;
                if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) return true;
            }
            return false;
        },
        
        async getUserAddress() {
            return new Promise((resolve) => {
                if (blockchainMode) {
                    console.log('📤 Requesting address from parent...');
                    window.parent.postMessage({ type: 'GET_ADDRESS' }, '*');
                    this.addressResolver = resolve;
                    setTimeout(() => {
                        console.log('⏱️ Address timeout');
                        resolve('demo-user');
                    }, 3000);
                } else {
                    resolve('demo-user');
                }
            });
        },

        async buyCard() {
            if (app.state.gameActive) return;
            
            const cardConfig = app.config.cards[app.state.selectedCardType];
            const balance = blockchainMode ? platformBalance : app.wallet.balance;
            
            if (app.state.betAmount < cardConfig.cost) {
                return app.ui.notify(`Min bet: ${cardConfig.cost.toFixed(blockchainMode ? 4 : 0)}`, 'error');
            }
            
            if (app.state.betAmount > balance) {
                return app.ui.openWallet();
            }

            app.state.gameActive = true;
            app.ui.toggleControls(false);
            app.ui.hideResult();
            app.audio.sfx.click();

            if (blockchainMode) {
                console.log('🔗 Starting blockchain scratch card');
                
                try {
                    const userAddress = await this.getUserAddress();
                    
                    window.parent.postMessage({
                        type: 'SCRATCH_BET_REQUEST',
                        data: {
                            cardType: app.state.selectedCardType
                        }
                    }, '*');
                    
                    console.log('📤 Sent scratch bet request');
                    
                } catch (error) {
                    console.error('Scratch start error:', error);
                    this.handleBetFailed(error.message);
                }
            } else {
                // LOCAL MODE
                if (!app.wallet.deduct(app.state.betAmount)) {
                    app.state.gameActive = false;
                    app.ui.toggleControls(true);
                    return app.ui.openWallet();
                }
                
                app.state.currentOutcome = this.generateOutcome(app.state.betAmount, cardConfig, null);
                this.renderCard(app.state.currentOutcome);
                app.canvas.reset();
                app.ui.notify("Scratch to reveal!", 'info');
            }
        },

        generateOutcome: function(bet, cardConfig, forceResult = null) {
            let isWin;
            if (forceResult !== null) {
                isWin = forceResult;
            } else {
                isWin = app.state.forcedWin || (app.math.random() < this.rtp);
            }
            app.state.forcedWin = false;
            
            let grid = new Array(9).fill(null);
            let winSym = null;
            let multiplier = 0;

            if (isWin) {
                const payouts = cardConfig.payout;
                const rand = app.math.random();
                if (rand > 0.95) multiplier = payouts[5];
                else if (rand > 0.80) multiplier = payouts[4];
                else multiplier = payouts[2];

                winSym = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
                const line = lines[Math.floor(Math.random() * lines.length)];
                line.forEach(i => grid[i] = winSym);
                
                for(let i=0; i<9; i++) {
                    if(grid[i] === null) {
                        let s;
                        do { s = this.symbols[Math.floor(Math.random() * this.symbols.length)]; } 
                        while(s === winSym);
                        grid[i] = s;
                    }
                }
            } else {
                let safe = false;
                while(!safe) {
                    for(let i=0; i<9; i++) grid[i] = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                    if (!this.checkLineWin(grid)) safe = true;
                }
            }

            return { 
                win: isWin, 
                amount: isWin ? bet * multiplier : 0, 
                grid: grid, 
                symbol: winSym 
            };
        },

        renderCard: function(outcome) {
            const el = document.getElementById('card-underlayer');
            if (!el) return;
            
            el.innerHTML = '';
            outcome.grid.forEach(s => {
                const cell = document.createElement('div');
                cell.className = 'flex items-center justify-center bg-gray-800 rounded shadow-inner overflow-hidden';
                cell.innerHTML = `<img src="${s}" class="w-12 h-12 object-contain drop-shadow-lg filter brightness-110">`;
                el.appendChild(cell);
            });
        },

        handleBlockchainResult: function(data) {
            const { won, multiplier, grid, winSymbol, payout, newBalance } = data;
            
            console.log('🎰 Scratch result:', data);
            
            if (newBalance !== undefined) {
                platformBalance = newBalance / 1_000_000_000;
            }
            
            // Convert grid from symbol names to URLs
            const gridUrls = grid.map(symbolName => SYMBOL_URL_MAP[symbolName] || this.symbols[0]);
            const winSymbolUrl = winSymbol ? SYMBOL_URL_MAP[winSymbol] : null;
            
            app.state.currentOutcome = {
                win: won,
                amount: payout / 1_000_000_000,
                grid: gridUrls,
                symbol: winSymbolUrl
            };
            
            this.renderCard(app.state.currentOutcome);
            app.canvas.reset();
            app.ui.notify("Scratch to reveal!", 'info');
        },

        handleBetFailed: function(error) {
            console.error('❌ Bet failed:', error);
            app.state.gameActive = false;
            app.ui.toggleControls(true);
            app.ui.notify('Bet failed: ' + error, 'error');
        },

        async buyBatch(count) {
            if (app.state.gameActive) return;
            
            const cardConfig = app.config.cards[app.state.selectedCardType];
            const costPerCard = app.state.betAmount;
            const totalCost = costPerCard * count;
            const balance = blockchainMode ? platformBalance : app.wallet.balance;

            if (costPerCard < cardConfig.cost) {
                return app.ui.notify(`Min bet: ${cardConfig.cost.toFixed(blockchainMode ? 4 : 0)}`, 'error');
            }
            
            if (totalCost > balance) {
                return app.ui.openWallet();
            }

            app.audio.sfx.click();

            if (blockchainMode) {
                console.log('🔗 Starting blockchain batch scratch');
                
                try {
                    const userAddress = await this.getUserAddress();
                    
                    window.parent.postMessage({
                        type: 'SCRATCH_BATCH_REQUEST',
                        data: {
                            cardType: app.state.selectedCardType,
                            count: count
                        }
                    }, '*');
                    
                    console.log('📤 Sent batch scratch request');
                    
                } catch (error) {
                    console.error('Batch scratch error:', error);
                    app.ui.notify('Batch failed: ' + error.message, 'error');
                }
            } else {
                // LOCAL MODE
                if (!app.wallet.deduct(totalCost)) {
                    return app.ui.openWallet();
                }
                
                app.state.batchResults = [];
                
                const luck = Math.random();
                let winRate;
                
                if (luck > 0.90) winRate = 0.7 + (Math.random() * 0.2);
                else if (luck > 0.60) winRate = 0.4 + (Math.random() * 0.2);
                else winRate = 0.2 + (Math.random() * 0.2);

                const targetWins = Math.round(count * winRate);
                let results = Array(count).fill(false);
                for(let i=0; i<targetWins && i<count; i++) results[i] = true;
                
                for (let i = results.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [results[i], results[j]] = [results[j], results[i]];
                }

                let maxWinCap = 100;
                if (count === 100) maxWinCap = 40;
                else if (count === 50) maxWinCap = 60;

                for(let i=0; i<count; i++) {
                    let res = this.generateOutcome(costPerCard, cardConfig, results[i]);
                    if(res.win && res.amount > maxWinCap) res.amount = maxWinCap;
                    app.state.batchResults.push(res);
                }
                app.ui.openBatchResults();
            }
        },

        handleBatchResult: function(data) {
            const { outcomes, totalPayout, newBalance } = data;
            
            console.log('📦 Batch result:', data);
            
            if (newBalance !== undefined) {
                platformBalance = newBalance / 1_000_000_000;
            }
            
            // Convert outcomes to game format
            app.state.batchResults = outcomes.map(outcome => {
                const gridUrls = outcome.grid.map(symbolName => SYMBOL_URL_MAP[symbolName] || this.symbols[0]);
                const winSymbolUrl = outcome.winSymbol ? SYMBOL_URL_MAP[outcome.winSymbol] : null;
                
                return {
                    win: outcome.win,
                    amount: outcome.payout / 1_000_000_000,
                    grid: gridUrls,
                    symbol: winSymbolUrl
                };
            });
            
            app.ui.openBatchResults();
        },

        finishRound: function() {
            if (!app.state.gameActive) return;
            app.state.gameActive = false;
            app.canvas.clear();
            const res = app.state.currentOutcome;
            
            if (res.win) {
                if (blockchainMode) {
                    // Balance already updated by backend
                    app.wallet.logTransaction('WIN', res.amount, 'Scratch Win');
                } else {
                    app.wallet.addFunds(res.amount, 'WIN', 'Scratch Win');
                }
                app.ui.showResult(true, res.amount);
                app.effects.spawnConfetti();
            } else {
                if (blockchainMode) {
                    app.wallet.logTransaction('LOSS', app.state.betAmount, 'Scratch Card');
                } else {
                    app.wallet.logTransaction('LOSS', app.state.betAmount, 'Scratch Card');
                }
                app.ui.showResult(false, 0);
            }
            
            app.ui.toggleControls(true);
            app.ui.updateBalance();
        },

        reset: function() {
            app.ui.hideResult();
            app.canvas.reset(true);
        }
    },

    // --- Canvas ---
    canvas: {
        el: null, ctx: null, isDrawing: false, strokeCount: 0,
        init: function() {
            this.el = document.getElementById('scratch-canvas');
            if (!this.el) return;
            
            this.ctx = this.el.getContext('2d', { willReadFrequently: true });
            const h = (e) => {
                e.preventDefault();
                if(!app.state.gameActive) return;
                const pt = this.getPos(e);
                if(e.type === 'mousedown' || e.type === 'touchstart') this.isDrawing = true;
                if(e.type === 'mouseup' || e.type === 'touchend') this.isDrawing = false;
                if(this.isDrawing) this.scratch(pt);
            };
            ['mousedown','mousemove','mouseup','touchstart','touchmove','touchend'].forEach(evt => 
                this.el.addEventListener(evt, h, {passive: false})
            );
            this.reset(true);
        },
        getPos: function(e) {
            const r = this.el.getBoundingClientRect();
            const t = e.touches ? e.touches[0] : e;
            const scaleX = this.el.width / r.width;
            const scaleY = this.el.height / r.height;
            return { 
                x: (t.clientX - r.left) * scaleX, 
                y: (t.clientY - r.top) * scaleY 
            };
        },
        reset: function(cover) {
            if (!this.ctx) return;
            
            this.ctx.globalCompositeOperation = 'source-over';
            this.strokeCount = 0;
            if(cover) {
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(0,0,300,300);
                const g = this.ctx.createLinearGradient(0,0,300,300);
                g.addColorStop(0, '#111');
                g.addColorStop(0.5, getComputedStyle(document.documentElement).getPropertyValue('--theme-primary'));
                g.addColorStop(1, '#111');
                this.ctx.fillStyle = g;
                this.ctx.fillRect(0,0,300,300);
                this.ctx.fillStyle = "rgba(255,255,255,0.2)";
                this.ctx.font = "bold 30px Montserrat";
                this.ctx.textAlign = "center";
                this.ctx.fillText("SCRATCH", 150, 140);
            }
        },
        clear: function() { 
            if (this.ctx) this.ctx.clearRect(0,0,300,300); 
        },
        scratch: function(p) {
            if (!this.ctx) return;
            
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 30, 0, Math.PI*2);
            this.ctx.fill();
            this.strokeCount++;
            if(this.strokeCount % 15 === 0) this.checkProgress();
        },
        checkProgress: function() {
            if (!this.ctx) return;
            
            const img = this.ctx.getImageData(0,0,300,300);
            let t = 0;
            for(let i=3; i<img.data.length; i+=16) if(img.data[i] < 128) t++;
            const pct = (t / (img.data.length/16)) * 100; 
            if(pct > 65) app.game.finishRound(); 
        }
    },

    // --- UI ---
    ui: {
        updateBalance: () => {
            const balance = blockchainMode ? platformBalance : app.wallet.balance;
            const decimals = blockchainMode ? 4 : 0;
            
            const navBalance = document.getElementById('nav-balance');
            if (navBalance) navBalance.innerText = balance.toFixed(decimals);
            
            const walletBalance = document.getElementById('wallet-balance-display');
            if (walletBalance) walletBalance.innerText = `${balance.toFixed(decimals)} ${app.config.currency}`;
        },
        toggleControls: (e) => {
            const btn = document.getElementById('action-btn');
            if (btn) {
                btn.disabled = !e;
                btn.innerText = e ? "Buy Card" : "Scratching...";
            }
        },
        showResult: (win, amt) => {
            const overlay = document.getElementById('result-overlay');
            const title = document.getElementById('result-title');
            const amount = document.getElementById('result-amount');
            
            if (!overlay || !title || !amount) return;
            
            overlay.classList.remove('hidden');
            title.innerText = win ? "YOU WON!" : "NO LUCK";
            title.className = win ? "text-4xl font-bold text-theme-primary mb-2" : "text-2xl font-bold text-gray-400 mb-2";
            
            const decimals = blockchainMode ? 4 : 0;
            amount.innerText = win ? `${amt.toFixed(decimals)} ${app.config.currency}` : "Try Again";
            
            if(win) app.audio.sfx.win();
        },
        hideResult: () => {
            const overlay = document.getElementById('result-overlay');
            if (overlay) overlay.classList.add('hidden');
        },
        
        notify: (msg, type = 'info') => {
            const container = document.getElementById('notification-container');
            if (!container) return;
            
            const toast = document.createElement('div');
            toast.className = 'modern-toast';
            let icon = 'fa-info-circle';
            if(type === 'success') icon = 'fa-check-circle text-green-400';
            if(type === 'error') icon = 'fa-exclamation-circle text-red-400';
            toast.innerHTML = `<i class="fas ${icon} toast-icon"></i><span class="font-bold text-sm">${msg}</span>`;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        renderHistory: () => {
            const container = document.getElementById('session-log');
            if (!container) return;
            
            container.innerHTML = '';
            if (app.wallet.history.length === 0) {
                container.innerHTML = '<div class="text-gray-500 italic text-center py-4">No history yet...</div>';
                return;
            }
            
            const decimals = blockchainMode ? 4 : 0;
            
            app.wallet.history.forEach(h => {
                const el = document.createElement('div');
                
                let typeColor = 'text-gray-400';
                let amountColor = 'text-gray-400';
                let borderClass = 'border-gray-700';
                
                if (h.type === 'WIN') {
                    typeColor = 'text-green-400';
                    amountColor = 'text-green-400';
                    borderClass = 'border-green-500';
                } else if (h.type === 'LOSS') {
                    typeColor = 'text-red-500';
                    amountColor = 'text-red-500';
                    borderClass = 'border-red-500';
                } else if (h.type === 'DEPOSIT') {
                    typeColor = 'text-yellow-400';
                    amountColor = 'text-yellow-400';
                    borderClass = 'border-yellow-500';
                } else if (h.type === 'WITHDRAW') {
                    typeColor = 'text-cyan-400 text-shine';
                    amountColor = 'text-cyan-400';
                    borderClass = 'border-cyan-500';
                }

                el.className = `flex justify-between items-center bg-gray-900/50 p-2 rounded border-l-2 ${borderClass}`;
                el.innerHTML = `
                    <div class="flex flex-col">
                        <span class="font-bold ${typeColor}">${h.type}</span>
                        <span class="text-[10px] text-gray-500">${h.detail}</span>
                    </div>
                    <span class="font-mono font-bold ${amountColor}">
                        ${h.type === 'WIN' || h.type === 'DEPOSIT' ? '+' : '-'}${h.amount.toFixed(decimals)}
                    </span>
                `;
                container.appendChild(el);
            });
        },

        toggleMobileSidebar: () => {
            const sidebar = document.getElementById('left-sidebar');
            if (sidebar) sidebar.classList.toggle('-translate-x-[120%]');
        },

        toggleSettings: () => {
            const modal = document.getElementById('settings-modal');
            if (modal) modal.classList.remove('hidden');
            app.ui.updateSettingsUI();
        },
        setSound: (enabled) => {
            app.config.sounds = enabled;
            if (!blockchainMode) localStorage.setItem('scratcher_sound', enabled);
            app.ui.updateSettingsUI();
        },
        updateSettingsUI: () => {
            const btnOn = document.getElementById('btn-sound-on');
            const btnOff = document.getElementById('btn-sound-off');
            
            if (!btnOn || !btnOff) return;
            
            if (app.config.sounds) {
                btnOn.className = "px-4 py-1 rounded-md text-xs font-bold transition-colors bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]";
                btnOff.className = "px-4 py-1 rounded-md text-xs font-bold transition-colors text-gray-500 hover:text-white";
            } else {
                btnOn.className = "px-4 py-1 rounded-md text-xs font-bold transition-colors text-gray-500 hover:text-white";
                btnOff.className = "px-4 py-1 rounded-md text-xs font-bold transition-colors bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]";
            }
        },

        openWallet: () => {
            const modal = document.getElementById('wallet-modal');
            if (modal) modal.classList.remove('hidden');
        },
        openThemes: () => {
            const modal = document.getElementById('theme-modal');
            if (modal) modal.classList.remove('hidden');
            app.ui.renderThemes();
        },
        closeModals: () => {
            document.querySelectorAll('[id$="-modal"]').forEach(e => e.classList.add('hidden'));
        },
        
        openBatchResults: () => {
            const grid = document.getElementById('batch-grid');
            if (!grid) return;
            
            grid.innerHTML = '';
            const decimals = blockchainMode ? 4 : 0;
            
            app.state.batchResults.forEach((res, idx) => {
                const div = document.createElement('div');
                div.className = `mini-card ${res.win ? 'win' : ''}`;
                div.innerHTML = `
                    <div class="mini-card-cover" onclick="app.ui.revealBatchItem(${idx})">
                        <i class="fas fa-gem text-gray-500"></i>
                    </div>
                    <span class="${res.win ? 'text-theme-primary font-bold' : 'text-gray-500'}">
                        ${res.win ? res.amount.toFixed(decimals) : '❌'}
                    </span>
                `;
                div.id = `batch-card-${idx}`;
                grid.appendChild(div);
            });
            
            const totalEl = document.getElementById('batch-total-win');
            if (totalEl) totalEl.innerText = '0';
            
            const modal = document.getElementById('batch-modal');
            if (modal) modal.classList.remove('hidden');
        },
        revealBatchItem: (idx, silent = false) => {
            const el = document.getElementById(`batch-card-${idx}`);
            if(!el || el.classList.contains('revealed')) return 0;
            el.classList.add('revealed');
            const res = app.state.batchResults[idx];
            if(res.win) {
                app.wallet.addFunds(res.amount, 'WIN', 'Batch Win', silent); 
                if(!silent) app.audio.sfx.win();
                return res.amount;
            } else {
                if(!silent) app.audio.sfx.click();
                return 0;
            }
        },
        revealAllBatch: () => {
            let totalNewWin = 0;
            app.state.batchResults.forEach((_, idx) => {
                totalNewWin += app.ui.revealBatchItem(idx, true);
            });
            if(totalNewWin > 0) {
                app.audio.sfx.win();
                const decimals = blockchainMode ? 4 : 0;
                app.ui.notify(`Batch Total Win: ${totalNewWin.toFixed(decimals)} ${app.config.currency}`, 'success');
            }
            app.ui.updateBatchTotal();
        },
        updateBatchTotal: () => {
            const decimals = blockchainMode ? 4 : 0;
            const total = app.state.batchResults.reduce((acc, curr, idx) => {
                const el = document.getElementById(`batch-card-${idx}`);
                const revealed = el && el.classList.contains('revealed');
                return acc + (revealed ? curr.amount : 0);
            }, 0);
            
            const totalEl = document.getElementById('batch-total-win');
            if (totalEl) totalEl.innerText = `${total.toFixed(decimals)} ${app.config.currency}`;
        },
        
        renderThemes: () => {
            const list = document.getElementById('theme-list');
            if (!list) return;
            
            list.innerHTML = '';
            app.themes.list.forEach(t => {
                const isUnlocked = app.themes.unlocked.includes(t.id);
                const isCurrent = app.themes.current === t.id;
                const div = document.createElement('div');
                div.className = `p-3 rounded border cursor-pointer relative overflow-hidden ${isCurrent ? 'border-white ring-2 ring-white' : 'border-gray-700 bg-gray-800'}`;
                if(isCurrent) div.style.backgroundColor = t.primary + '20';
                let content = `<div class="w-full h-12 rounded mb-2" style="background: linear-gradient(45deg, ${t.primary}, ${t.secondary})"></div>
                    <div class="text-xs font-bold text-white flex justify-between"><span>${t.name}</span>${isCurrent ? '<i class="fas fa-check text-green-400"></i>' : ''}</div>`;
                if(!isUnlocked) {
                    div.onclick = () => app.ads.play('unlock_theme', t.id);
                    content += `<div class="absolute inset-0 bg-black/70 flex items-center justify-center flex-col text-xs text-gray-300"><i class="fas fa-lock mb-1"></i><span>Watch Ad</span></div>`;
                } else {
                    div.onclick = () => app.themes.apply(t.id);
                }
                div.innerHTML = content;
                list.appendChild(div);
            });
        },
        
        toggleAdmin: () => {
            const modal = document.getElementById('input-modal');
            const title = document.getElementById('input-modal-title');
            const field = document.getElementById('input-modal-field');
            const btn = document.getElementById('input-modal-confirm');
            
            if (!modal || !title || !field || !btn) return;
            
            title.innerText = "Enter Admin PIN";
            field.value = '';
            field.type = "password";
            modal.classList.remove('hidden');
            
            btn.onclick = () => {
                if(field.value === '1234') {
                    modal.classList.add('hidden');
                    const adminModal = document.getElementById('admin-modal');
                    if (adminModal) adminModal.classList.remove('hidden');
                } else {
                    app.ui.notify("Access Denied", 'error');
                }
            };
        }
    },
    
    // --- Visuals ---
    effects: {
        spawnConfetti: () => {
            for(let i=0; i<50; i++) {
                const c = document.createElement('div');
                c.className = 'confetti';
                c.style.left = Math.random()*100+'vw';
                c.style.animationDuration = (Math.random()*2+1)+'s';
                document.body.appendChild(c);
                setTimeout(()=>c.remove(), 3000);
            }
        },
        startJackpotTicker: () => {
            setInterval(() => {
                const el = document.getElementById('jackpot-display');
                if (el) el.innerText = '' + (120500 + Math.random()*100).toFixed(2);
            }, 2000);
        }
    },
    
    admin: {
        updateRTP: (v) => { 
            app.game.rtp = parseFloat(v);
            const valEl = document.getElementById('admin-rtp-val');
            if (valEl) valEl.innerText = v;
        },
        forceWinNext: () => { 
            app.state.forcedWin = true; 
            app.ui.closeModals(); 
            app.ui.notify("Next round rigged.", 'success'); 
        }
    },

    init: function() {
        console.log('🎰 Initializing Scratch Royale...');
        console.log('Blockchain mode:', blockchainMode);
        
        // Load Settings
        if (!blockchainMode) {
            const savedSound = localStorage.getItem('scratcher_sound');
            if (savedSound !== null) {
                app.config.sounds = (savedSound === 'true');
            }
        }

        // Splash Screen Logic
        if (blockchainMode) {
            const splash = document.getElementById('splash-screen');
            if (splash) splash.style.display = 'none';
        } else {
            setTimeout(() => {
                const splash = document.getElementById('splash-screen');
                if (splash) {
                    splash.style.opacity = '0';
                    setTimeout(() => splash.remove(), 800);
                }
            }, 2000);
        }

        this.audio.init();
        this.wallet.load();
        this.themes.init();
        this.canvas.init();
        this.effects.startJackpotTicker();
        
        const l = document.getElementById('leaderboard-list');
        if (l) {
            ['CryptoKing','LuckyUser','Winner777'].forEach((n,i) => {
                l.innerHTML += `<div class="flex justify-between text-xs border-b border-gray-800 pb-2 mb-2"><span class="text-gray-400">${i+1}. ${n}</span><span class="text-theme-primary">${10000-i*2000}</span></div>`;
            });
        }
        
        document.body.addEventListener('click', () => { 
            if(app.audio.ctx && app.audio.ctx.state==='suspended') app.audio.ctx.resume(); 
        }, {once:true});
        
        // Update bet input display format
        const betInput = document.getElementById('bet-input');
        if (betInput && blockchainMode) {
            betInput.value = app.state.betAmount.toFixed(4);
            betInput.step = '0.01';
            betInput.min = '0.01';
            betInput.max = '10';
        }
        
        console.log('✅ Scratch Royale initialized');
    }
};

window.app = app;
window.addEventListener('load', () => app.init());