// ==========================================
// BLOCKCHAIN/BACKEND INTEGRATION
// ==========================================

let blockchainMode = (window.parent !== window);
let platformBalance = 0;

const API_URL = 'http://localhost:3001';

if (blockchainMode) {
    console.log('🎡 Platform mode enabled for Wheel');
    window.parent.postMessage({ type: 'WHEEL_READY' }, '*');
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'BALANCE_UPDATE') {
        platformBalance = event.data.balance;
        console.log('💰 Balance updated:', platformBalance);
        if (window.game) {
            window.game.balance = platformBalance;
            window.game.updateBalance();
        }
    }
    
    if (event.data.type === 'BLOCKCHAIN_RESULT') {
        console.log('📊 Blockchain result:', event.data.data);
        if (window.game) {
            window.game.handleBlockchainResult(event.data.data);
        }
    }
    
    if (event.data.type === 'BET_FAILED') {
        console.error('❌ Bet failed:', event.data.error);
        if (window.game) {
            window.game.handleBetFailed(event.data.error);
        }
    }

    if (event.data.type === 'ADDRESS_RESPONSE') {
        if (window.game && window.game.addressResolver) {
            window.game.addressResolver(event.data.address);
        }
    }
});

// ==========================================
// GAME OBJECT
// ==========================================

const game = {
    balance: blockchainMode ? 0 : 1000,
    selectedNumber: null,
    currentBet: 0.05, // Changed to SUI
    risk: 'high',
    spinning: false,
    canvas: null,
    ctx: null,
    rotation: 0,
    targetRotation: 0,
    skin: 'classic',
    vipUnlocked: false,
    addressResolver: null,
    
    multipliers: {
        low: 1.5,
        med: 3.0,
        high: 10.0
    },

    colors: {
        classic: ['#4E9FFF', '#5FB4FF', '#6FC9FF', '#4E9FFF', '#5FB4FF', '#6FC9FF', '#4E9FFF', '#5FB4FF', '#6FC9FF', '#4E9FFF'],
        vip: ['#FFD700', '#FFA500', '#FF8C00', '#FFD700', '#FFA500', '#FF8C00', '#FFD700', '#FFA500', '#FF8C00', '#FFD700']
    },

    init() {
        console.log('🎡 Initializing wheel game...');
        
        this.canvas = document.getElementById('wheelCanvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        this.drawWheel();
        this.generateNumberGrid();
        this.updateBalance();
        this.updateBet();
        this.updatePayout();
        
        // Skip splash if in iframe
        if (blockchainMode) {
            document.getElementById('splashScreen').style.display = 'none';
            document.getElementById('gameMenu').style.display = 'none';
            document.getElementById('mainGame').style.display = 'block';
        } else {
            setTimeout(() => {
                const splash = document.getElementById('splashScreen');
                if (splash) {
                    splash.style.opacity = '0';
                    setTimeout(() => {
                        splash.style.display = 'none';
                        document.getElementById('gameMenu').style.display = 'flex';
                    }, 500);
                }
            }, 2000);
        }
        
        console.log('✅ Game initialized');
    },

    drawWheel() {
        if (!this.canvas || !this.ctx) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 250;
        const segmentAngle = (2 * Math.PI) / 10;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const colors = this.vipUnlocked ? this.colors.vip : this.colors.classic;
        
        for (let i = 0; i < 10; i++) {
            const angle = this.rotation + i * segmentAngle;
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, angle, angle + segmentAngle);
            this.ctx.closePath();
            
            this.ctx.fillStyle = colors[i];
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Draw number
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(angle + segmentAngle / 2);
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 36px Cinzel';
            this.ctx.fillText(i + 1, radius * 0.7, 10);
            this.ctx.restore();
        }
        
        // Center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fill();
        this.ctx.strokeStyle = this.vipUnlocked ? '#FFD700' : '#4E9FFF';
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
    },

    generateNumberGrid() {
        const grid = document.getElementById('numberGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('button');
            btn.className = 'number-btn';
            btn.innerText = i;
            btn.onclick = () => this.selectNumber(i);
            if (this.selectedNumber === i) btn.classList.add('active');
            grid.appendChild(btn);
        }
    },

    selectNumber(num) {
        this.selectedNumber = num;
        this.generateNumberGrid();
        this.updatePayout();
        console.log('✅ Selected number:', num);
    },

    setRisk(level) {
        this.risk = level;
        
        document.querySelectorAll('.risk-btn').forEach(btn => btn.classList.remove('active'));
        const btn = document.getElementById('risk' + level.charAt(0).toUpperCase() + level.slice(1));
        if (btn) btn.classList.add('active');
        
        this.updatePayout();
    },

    setBet(amount) {
        this.currentBet = amount / 1000; // Convert to SUI (50 = 0.05 SUI)
        
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        if (event && event.target) event.target.classList.add('active');
        
        this.updateBet();
        this.updatePayout();
    },

    updateBalance() {
        const balance = blockchainMode ? platformBalance : this.balance;
        const el = document.getElementById('balanceDisplay');
        if (el) el.innerText = balance.toFixed(4);
    },

    updateBet() {
        const el = document.getElementById('currentBetDisplay');
        if (el) el.innerText = this.currentBet.toFixed(4);
    },

    updatePayout() {
        const mult = this.multipliers[this.risk];
        const payout = (this.currentBet * mult).toFixed(4);
        const el = document.getElementById('payoutDisplay');
        if (el) el.innerText = `(Win: ${payout} SUI)`;
    },

    async getUserAddress() {
        return new Promise((resolve) => {
            if (blockchainMode) {
                console.log('📤 Requesting address...');
                window.parent.postMessage({ type: 'GET_ADDRESS' }, '*');
                this.addressResolver = resolve;
                setTimeout(() => {
                    console.log('⏱️ Address timeout, using demo');
                    resolve('demo-user');
                }, 3000);
            } else {
                resolve('demo-user');
            }
        });
    },

    async spin() {
        if (this.spinning) {
            console.log('⏳ Already spinning');
            return;
        }
        
        if (this.selectedNumber === null) {
            this.showToast('⚠️ Please select a number first!', 'error');
            return;
        }
        
        const balance = blockchainMode ? platformBalance : this.balance;
        
        if (this.currentBet > balance) {
            this.showToast('❌ Insufficient balance!', 'error');
            return;
        }

        console.log('🎡 Starting spin...');
        this.spinning = true;
        
        const spinBtn = document.getElementById('spinBtn');
        if (spinBtn) {
            spinBtn.disabled = true;
            spinBtn.innerText = 'SPINNING...';
        }

        if (blockchainMode) {
            try {
                const userAddress = await this.getUserAddress();
                console.log('📤 Sending bet request:', {
                    userAddress,
                    betAmount: this.currentBet,
                    targetNumber: this.selectedNumber,
                    risk: this.risk
                });
                
                window.parent.postMessage({
                    type: 'WHEEL_BET_REQUEST',
                    data: {
                        betAmount: this.currentBet,
                        targetNumber: this.selectedNumber,
                        risk: this.risk
                    }
                }, '*');
            } catch (error) {
                console.error('Spin error:', error);
                this.handleBetFailed(error.message);
            }
        } else {
            // Local mode
            this.balance -= this.currentBet;
            this.updateBalance();
            
            const result = Math.floor(Math.random() * 10) + 1;
            const won = result === this.selectedNumber;
            
            setTimeout(() => {
                this.handleBlockchainResult({
                    won,
                    resultNumber: result,
                    multiplier: won ? this.multipliers[this.risk] : 0,
                    payout: won ? this.currentBet * this.multipliers[this.risk] : 0
                });
            }, 100);
        }
    },

    handleBlockchainResult(data) {
        const { won, resultNumber, multiplier, payout, newBalance } = data;
        
        console.log('🎯 Result received:', data);
        
        // Update balance if provided
        if (newBalance !== undefined && blockchainMode) {
            platformBalance = newBalance;
            this.updateBalance();
        }
        
        // Calculate rotation
        const segmentAngle = (2 * Math.PI) / 10;
        const targetAngle = (resultNumber - 1) * segmentAngle;
        const spins = 5;
        this.targetRotation = (spins * 2 * Math.PI) + targetAngle;
        
        this.animateWheel(won, payout, resultNumber);
    },

    animateWheel(won, payout, resultNumber) {
        const duration = 3000;
        const startTime = Date.now();
        const startRotation = this.rotation;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.rotation = startRotation + (this.targetRotation - startRotation) * eased;
            this.drawWheel();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.showResult(won, payout, resultNumber);
            }
        };
        
        animate();
    },

    showResult(won, payout, resultNumber) {
        this.spinning = false;
        
        const spinBtn = document.getElementById('spinBtn');
        if (spinBtn) {
            spinBtn.disabled = false;
            spinBtn.innerText = 'SPIN WHEEL';
        }
        
        if (won) {
            if (!blockchainMode) {
                this.balance += payout;
            }
            
            this.showToast(`🎉 YOU WON ${payout.toFixed(4)} SUI!`, 'success');
            
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#4E9FFF', '#FFD700', '#FFA500']
                });
            }
        } else {
            this.showToast(`💫 Wheel landed on ${resultNumber}. Try again!`, 'error');
        }
        
        this.updateBalance();
        this.addHistory(won, payout, resultNumber);
    },

    handleBetFailed(error) {
        console.error('❌ Bet failed:', error);
        
        this.spinning = false;
        const spinBtn = document.getElementById('spinBtn');
        if (spinBtn) {
            spinBtn.disabled = false;
            spinBtn.innerText = 'SPIN WHEEL';
        }
        
        this.showToast(`❌ ${error}`, 'error');
    },

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.innerText = message;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : '#ef4444'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    addHistory(won, payout, resultNumber) {
        const log = document.getElementById('historyLog');
        if (!log) return;
        
        const entry = document.createElement('div');
        entry.className = `history-item ${won ? 'win' : 'loss'}`;
        entry.innerHTML = `
            <div style="font-size: 10px;">${new Date().toLocaleTimeString()}</div>
            <div style="font-weight: bold;">Picked: ${this.selectedNumber} | Result: ${resultNumber}</div>
            <div style="font-weight: bold;">${won ? '+' : '-'}${won ? payout.toFixed(4) : this.currentBet.toFixed(4)} SUI</div>
        `;
        log.insertBefore(entry, log.firstChild);
        
        while (log.children.length > 20) {
            log.removeChild(log.lastChild);
        }
    },

    setSkin(skin) {
        this.skin = skin;
        if (skin === 'classic') {
            this.vipUnlocked = false;
        }
        this.drawWheel();
    },

    tryVip() {
        if (this.vipUnlocked) {
            this.vipUnlocked = true;
            this.drawWheel();
            const icon = document.getElementById('vipLockIcon');
            if (icon) icon.className = 'fas fa-unlock';
        } else {
            this.showToast('🔒 VIP Gold Wheel - Coming Soon!', 'error');
        }
    },

    watchAd(type) {
        this.showToast('💰 Added 0.1 SUI to balance!', 'success');
        if (blockchainMode) {
            platformBalance += 0.1;
        } else {
            this.balance += 0.1;
        }
        this.updateBalance();
    },

    closeAd() {
        const modal = document.getElementById('adModal');
        if (modal) modal.classList.remove('active');
    }
};

// ==========================================
// MENU HANDLERS
// ==========================================

window.Menu = {
    startGame() {
        console.log('🎮 Starting game...');
        document.getElementById('gameMenu').style.display = 'none';
        document.getElementById('mainGame').style.display = 'block';
    },
    
    showRules() {
        document.getElementById('rulesModal').classList.add('active');
    },
    
    closeRules() {
        document.getElementById('rulesModal').classList.remove('active');
    }
};

window.UI = {
    clearHistory() {
        if (confirm('Clear all history?')) {
            const log = document.getElementById('historyLog');
            if (log) log.innerHTML = '';
        }
    }
};

// Make game global
window.game = game;

// ==========================================
// INITIALIZE
// ==========================================

window.addEventListener('load', () => {
    console.log('🌐 Window loaded');
    game.init();
});

// CSS Animations
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .number-btn {
        padding: 12px;
        background: #1a1a2e;
        color: white;
        border: 2px solid #4E9FFF;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 16px;
        font-weight: bold;
    }
    .number-btn:hover {
        background: #2a2a3e;
        border-color: #6FC9FF;
        transform: scale(1.05);
    }
    .number-btn.active {
        background: #4E9FFF;
        border-color: #4E9FFF;
        color: #000;
        transform: scale(1.1);
    }
    .modal-overlay {
        display: none;
    }
    .modal-overlay.active {
        display: flex !important;
    }
    .history-item {
        padding: 8px;
        margin-bottom: 5px;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-size: 11px;
    }
    .history-item.win {
        background: rgba(34, 197, 94, 0.2);
        border-left: 3px solid #22c55e;
    }
    .history-item.loss {
        background: rgba(239, 68, 68, 0.2);
        border-left: 3px solid #ef4444;
    }
`;
document.head.appendChild(style);