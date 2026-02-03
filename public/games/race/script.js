// ==========================================
// BLOCKCHAIN/BACKEND INTEGRATION
// ==========================================

let blockchainMode = (window.parent !== window);
let platformBalance = 0;

const API_URL = 'https://sui-stakes-backend.onrender.com';

if (blockchainMode) {
    console.log('🏎️ Platform mode enabled for Race');
    window.parent.postMessage({ type: 'RACE_READY' }, '*');
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'BALANCE_UPDATE') {
        platformBalance = event.data.balance;
        console.log('💰 Balance updated:', platformBalance);
        if (window.Game) {
            Game.balance = platformBalance;
            Game.updateUI();
        }
    }
    
    if (event.data.type === 'BLOCKCHAIN_RESULT') {
        console.log('📊 Blockchain result:', event.data.data);
        if (window.Game) {
            Game.handleBlockchainResult(event.data.data);
        }
    }
    
    if (event.data.type === 'BET_FAILED') {
        console.error('❌ Bet failed:', event.data.error);
        if (window.Game) {
            Game.handleBetFailed(event.data.error);
        }
    }

    if (event.data.type === 'ADDRESS_RESPONSE') {
        if (window.Game && window.Game.addressResolver) {
            window.Game.addressResolver(event.data.address);
        }
    }
});

// ==========================================
// GAME CONFIGURATION
// ==========================================

const CONFIG = {
    houseEdge: 0.94, 
    baseSpeed: 5,
    trackLengthPercent: 90, 
    minBet: 0.01, // Changed to SUI
    initialBalance: 1000,
    raceDurationMin: 4000, 
    raceDurationMax: 6000  
};

const CARS = [
    { id: 0, name: "Inferno", icon: '<img src="assets/car1.png" class="w-full h-auto drop-shadow-md" alt="Inferno" onerror="this.src=\'https://cdn-icons-png.flaticon.com/512/3097/3097003.png\';this.style.filter=\'hue-rotate(0deg)\';">', color: "text-red-500", bg: "bg-red-900", hex: "#ef4444" },
    { id: 1, name: "Azure", icon: '<img src="assets/car2.png" class="w-full h-auto drop-shadow-md" alt="Azure" onerror="this.src=\'https://cdn-icons-png.flaticon.com/512/3097/3097003.png\';this.style.filter=\'hue-rotate(240deg)\';">', color: "text-blue-500", bg: "bg-blue-900", hex: "#3b82f6" },
    { id: 2, name: "Viper", icon: '<img src="assets/car3.png" class="w-full h-auto drop-shadow-md" alt="Viper" onerror="this.src=\'https://cdn-icons-png.flaticon.com/512/3097/3097003.png\';this.style.filter=\'hue-rotate(120deg)\';">', color: "text-green-500", bg: "bg-green-900", hex: "#22c55e" },
    { id: 3, name: "Voltage", icon: '<img src="assets/car4.png" class="w-full h-auto drop-shadow-md" alt="Voltage" onerror="this.src=\'https://cdn-icons-png.flaticon.com/512/3097/3097003.png\';this.style.filter=\'hue-rotate(60deg)\';">', color: "text-yellow-500", bg: "bg-yellow-900", hex: "#eab308" },
    { id: 4, name: "Phantom", icon: '<img src="assets/car5.png" class="w-full h-auto drop-shadow-md" alt="Phantom" onerror="this.src=\'https://cdn-icons-png.flaticon.com/512/3097/3097003.png\';this.style.filter=\'hue-rotate(280deg)\';">', color: "text-purple-500", bg: "bg-purple-900", hex: "#a855f7" },
    { id: 5, name: "Enforcer", icon: '<img src="assets/car6.png" class="w-full h-auto drop-shadow-md" alt="Enforcer" onerror="this.src=\'https://cdn-icons-png.flaticon.com/512/3097/3097003.png\';this.style.filter=\'grayscale(100%)\';">', color: "text-slate-300", bg: "bg-slate-700", hex: "#cbd5e1" }
];

// ==========================================
// AUDIO SYSTEM
// ==========================================

const AudioSys = {
    ctx: null,
    enabled: true,
    
    init() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
    },

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playClick() { this.playTone(800, 'sine', 0.1, 0.05); },
    playBet() { this.playTone(1200, 'triangle', 0.15, 0.05); },
    playWin() { 
        if (!this.enabled) return;
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'square', 0.3, 0.1), i * 100);
        });
    },
    playEngine() {
        this.playTone(80, 'sawtooth', 0.8, 0.05);
    }
};

// ==========================================
// GAME STATE MANAGEMENT
// ==========================================

const Game = {
    state: 'PRELOADER',
    balance: blockchainMode ? 0 : CONFIG.initialBalance,
    currentBet: 0,
    selectedCarIndex: null,
    odds: [], 
    history: [],
    soundOn: true,
    raceInterval: null,
    winnerIndex: null,
    adInterval: null,
    addressResolver: null,

    /* --- INITIALIZATION --- */
    init() {
        console.log('🏎️ Initializing Race Kings...');
        console.log('Blockchain mode:', blockchainMode);
        
        this.runPreloader();
        
        this.loadData();
        this.renderTrack();
        this.generateOdds();
        this.updateUI();
        
        const betInput = document.getElementById('custom-bet-input');
        if (betInput) {
            betInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= 0) {
                    this.currentBet = val;
                    this.updateUI();
                }
            });
        }
        
        console.log('✅ Race Kings initialized');
    },
    
    /* --- PRELOADER & LOBBY LOGIC --- */
    runPreloader() {
        const preloader = document.getElementById('preloader-screen');
        const loaderBar = document.getElementById('loader-bar');
        const menuScreen = document.getElementById('menu-screen');
        const loadingText = document.getElementById('loading-text');
        
        if (blockchainMode) {
            // Skip preloader in iframe
            if (preloader) preloader.style.display = 'none';
            if (menuScreen) menuScreen.style.display = 'none';
            const gameUI = document.getElementById('main-game-ui');
            if (gameUI) {
                gameUI.classList.remove('hidden');
                gameUI.classList.remove('opacity-0');
            }
            this.state = 'LOBBY';
            if (!AudioSys.ctx) AudioSys.init();
            return;
        }
        
        setTimeout(() => {
            if (loaderBar) {
                loaderBar.style.width = '100%';
                loaderBar.style.transition = 'width 3s ease-in-out';
            }
        }, 100);

        if (loadingText) {
            setTimeout(() => loadingText.innerText = "TUNING ENGINE...", 1000);
            setTimeout(() => loadingText.innerText = "CHECKING TIRES...", 2000);
            setTimeout(() => loadingText.innerText = "READY TO RACE!", 2800);
        }

        setTimeout(() => {
            if (preloader) preloader.style.opacity = '0';
            setTimeout(() => {
                if (preloader) preloader.style.display = 'none';
                if (menuScreen) {
                    menuScreen.classList.remove('hidden');
                    void menuScreen.offsetWidth; 
                    menuScreen.classList.remove('opacity-0');
                }
                this.state = 'MENU';
            }, 1000); 
        }, 3000);
    },

    enterLobby() {
        const menu = document.getElementById('menu-screen');
        const gameUI = document.getElementById('main-game-ui');
        
        if (menu) menu.style.opacity = '0';
        setTimeout(() => {
            if (menu) menu.style.display = 'none';
            if (gameUI) {
                gameUI.classList.remove('hidden');
                void gameUI.offsetWidth;
                gameUI.classList.remove('opacity-0');
            }
            
            this.state = 'LOBBY';
        }, 500);
        
        if (!AudioSys.ctx) AudioSys.init();
    },

    /* --- DATA PERSISTENCE --- */
    saveData() {
        if (blockchainMode) return;
        
        const data = {
            balance: this.balance,
            history: this.history,
            settings: { sound: this.soundOn }
        };
        localStorage.setItem('nitro6_data', JSON.stringify(data));
    },

    loadData() {
        if (blockchainMode) return;
        
        const raw = localStorage.getItem('nitro6_data');
        if (raw) {
            const data = JSON.parse(raw);
            this.balance = data.balance;
            this.history = data.history || [];
            this.soundOn = data.settings?.sound ?? true;
        }
        this.updateSoundIcon();
    },

    hardReset() {
        if(confirm("Reset all game data? This cannot be undone.")) {
            localStorage.removeItem('nitro6_data');
            location.reload();
        }
    },

    /* --- CORE LOGIC --- */
    generateOdds() {
        let weights = Array.from({length: 6}, () => Math.random() * 0.5 + 0.5); 
        
        if (Math.random() > 0.7) {
            const fav = Math.floor(Math.random() * 6);
            weights[fav] += 1.0;
        }

        const totalWeight = weights.reduce((a, b) => a + b, 0);
        const probabilities = weights.map(w => w / totalWeight);
        
        this.odds = probabilities.map(p => {
            let mult = (1 / p) * CONFIG.houseEdge;
            return Math.max(1.1, parseFloat(mult.toFixed(2))); 
        });
        
        this.probabilities = probabilities;
        this.renderRacerSelection();
    },

    getSecureRandom() {
        if (window.crypto && window.crypto.getRandomValues) {
            return window.crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
        }
        return Math.random();
    },

    determineWinner() {
        const r = this.getSecureRandom();
        let cumulative = 0;
        for (let i = 0; i < 6; i++) {
            cumulative += this.probabilities[i];
            if (r <= cumulative) return i;
        }
        return 5; 
    },

    /* --- BETTING ACTIONS --- */
    selectCar(index) {
        if (this.state !== 'LOBBY') return;
        this.selectedCarIndex = index;
        AudioSys.playClick();
        this.updateUI();
    },

    addChip(amount) {
        if (this.state !== 'LOBBY') return;
        const balance = blockchainMode ? platformBalance : this.balance;
        const newTotal = this.currentBet + (blockchainMode ? amount / 1000 : amount); // Convert to SUI
        
        if (newTotal <= balance) {
            this.currentBet = newTotal;
            AudioSys.playBet();
            this.updateUI();
        } else {
            const el = document.getElementById('balance-display');
            if (el) {
                el.classList.add('text-red-500');
                setTimeout(() => el.classList.remove('text-red-500'), 200);
            }
        }
    },

    adjustBet(type) {
        if (this.state !== 'LOBBY') return;
        const balance = blockchainMode ? platformBalance : this.balance;
        const minBet = blockchainMode ? 0.01 : CONFIG.minBet;
        
        if (type === 'min') this.currentBet = minBet;
        if (type === 'half') this.currentBet = Math.floor(this.currentBet / 2 * 100) / 100;
        if (type === 'double') this.currentBet = this.currentBet * 2;
        if (type === 'max') this.currentBet = balance;
        
        if (this.currentBet > balance) this.currentBet = balance;
        if (this.currentBet < 0) this.currentBet = 0;
        
        this.updateUI();
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

    async handleAction() {
        if (this.state === 'LOBBY') {
            const balance = blockchainMode ? platformBalance : this.balance;
            const minBet = blockchainMode ? 0.01 : CONFIG.minBet;
            
            if (this.selectedCarIndex === null || this.currentBet < minBet) return;
            if (this.currentBet > balance) return;
            
            await this.startRace();
        }
    },

    /* --- RACE ENGINE --- */
    async startRace() {
        const balance = blockchainMode ? platformBalance : this.balance;
        
        if (blockchainMode) {
            console.log('🔗 Starting blockchain mode race');
            
            this.state = 'RACING';
            this.updateUI();
            
            try {
                console.log('📤 Sending race bet request:', {
                    betAmount: this.currentBet,
                    selectedCar: this.selectedCarIndex
                });
                
                window.parent.postMessage({
                    type: 'RACE_BET_REQUEST',
                    data: {
                        betAmount: this.currentBet,
                        selectedCar: this.selectedCarIndex
                    }
                }, '*');
                
            } catch (error) {
                console.error('Race start error:', error);
                this.handleBetFailed(error.message);
            }
        } else {
            // LOCAL MODE
            this.balance -= this.currentBet;
            this.state = 'RACING';
            this.saveData();
            this.updateUI();

            this.winnerIndex = this.determineWinner();
            this.animateRace();
        }
    },

    animateRace() {
        const raceTime = CONFIG.raceDurationMin + Math.random() * (CONFIG.raceDurationMax - CONFIG.raceDurationMin);
        
        const carDurations = CARS.map((_, i) => {
            if (i === this.winnerIndex) return raceTime;
            return raceTime + 500 + (Math.random() * 1500);
        });

        const startTime = performance.now();
        AudioSys.playEngine();

        document.querySelectorAll('.car').forEach(el => el.style.transform = `translateX(0px)`);
        const statusEl = document.getElementById('status-text');
        if (statusEl) statusEl.innerText = "RACE IN PROGRESS...";

        const loop = (now) => {
            const elapsed = now - startTime;
            let finishedCount = 0;

            CARS.forEach((car, i) => {
                const duration = carDurations[i];
                let progress = elapsed / duration;
                
                if (progress > 1) {
                    progress = 1;
                    finishedCount++;
                }

                const jitter = (progress < 1) ? Math.random() * 2 : 0;

                const trackEl = document.getElementById('track-area');
                if (!trackEl) return;
                
                const trackWidth = trackEl.clientWidth;
                const maxPx = trackWidth * (CONFIG.trackLengthPercent / 100);
                
                const currentPx = (maxPx * progress) + jitter;
                
                const el = document.getElementById(`car-${i}`);
                if (el) el.style.transform = `translateX(${currentPx}px)`;
            });

            const timerEl = document.getElementById('race-timer');
            if (timerEl) timerEl.innerText = (elapsed/1000).toFixed(2) + 's';

            if (finishedCount < 6) {
                requestAnimationFrame(loop);
            } else {
                if (blockchainMode) {
                    // Wait for backend result
                } else {
                    this.endRace();
                }
            }
        };

        const timerEl = document.getElementById('race-timer');
        if (timerEl) timerEl.classList.remove('hidden');
        requestAnimationFrame(loop);
    },

    handleBlockchainResult(data) {
        const { won, winnerCar, multiplier, payout, newBalance, multipliers } = data;
        
        console.log('🏁 Race result:', data);
        
        if (newBalance !== undefined) {
            platformBalance = newBalance;
        }
        
        this.winnerIndex = winnerCar;
        
        if (multipliers) {
            this.odds = multipliers;
        }
        
        this.animateRace();
        
        setTimeout(() => {
            this.endRaceBlockchain(won, payout);
        }, CONFIG.raceDurationMin + 2000);
    },

    endRaceBlockchain(won, payoutInMist) {
        this.state = 'FINISHED';
        const payout = payoutInMist / 1_000_000_000;
        
        if (won) {
            AudioSys.playWin();
            Confetti.start();
        }

        this.history.unshift({
            time: new Date().toLocaleTimeString(),
            winner: CARS[this.winnerIndex].name,
            bet: this.currentBet,
            payout: payout,
            won: won
        });
        if (this.history.length > 50) this.history.pop();

        this.updateUI();
        this.showResultModal(won, payout);
    },

    handleBetFailed(error) {
        console.error('❌ Bet failed:', error);
        this.state = 'LOBBY';
        this.updateUI();
        alert('Bet failed: ' + error);
    },

    endRace() {
        this.state = 'FINISHED';
        const won = this.selectedCarIndex === this.winnerIndex;
        let payout = 0;

        if (won) {
            const multiplier = this.odds[this.winnerIndex];
            payout = Math.floor(this.currentBet * multiplier * 100) / 100;
            this.balance += payout;
            AudioSys.playWin();
            Confetti.start();
        }

        this.history.unshift({
            time: new Date().toLocaleTimeString(),
            winner: CARS[this.winnerIndex].name,
            bet: this.currentBet,
            payout: payout,
            won: won
        });
        if (this.history.length > 50) this.history.pop();

        this.saveData();
        this.showResultModal(won, payout);
    },

    resetRace() {
        this.state = 'LOBBY';
        this.selectedCarIndex = null;
        this.generateOdds(); 
        Confetti.stop();
        
        document.querySelectorAll('.car').forEach(el => {
            el.style.transform = `translateX(0px)`;
        });
        
        const modal = document.getElementById('result-modal');
        if (modal) modal.classList.remove('active');
        
        const timerEl = document.getElementById('race-timer');
        if (timerEl) timerEl.classList.add('hidden');
        
        const statusEl = document.getElementById('status-text');
        if (statusEl) statusEl.innerText = "WAITING FOR BETS...";
        
        this.updateUI();
    },

    /* --- UI UPDATES --- */
    renderTrack() {
        const container = document.getElementById('track-area');
        if (!container) return;
        
        container.innerHTML = '<div class="finish-flag" style="left: '+CONFIG.trackLengthPercent+'%"></div>';
        
        CARS.forEach((car, i) => {
            const lane = document.createElement('div');
            lane.className = 'lane border-b border-slate-600';
            
            lane.innerHTML = `
                <div id="car-${i}" class="car" style="top: 5px">
                    ${car.icon}
                </div>
                <div class="absolute left-2 text-xs text-slate-500 font-mono">${i+1}</div>
            `;
            container.appendChild(lane);
        });
    },

    renderRacerSelection() {
        const list = document.getElementById('racer-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        CARS.forEach((car, i) => {
            const btn = document.createElement('button');
            const odd = this.odds[i].toFixed(2);
            const isSelected = this.selectedCarIndex === i;
            
            btn.className = `p-2 rounded border transition flex flex-col items-center justify-between relative overflow-hidden ${isSelected ? 'bg-slate-700 border-blue-400 ring-2 ring-blue-500' : 'bg-slate-800 border-slate-600 hover:border-slate-500'}`;
            btn.onclick = () => this.selectCar(i);
            
            btn.innerHTML = `
                <div class="w-12 h-auto mx-auto mb-1 flex items-center justify-center">
                    ${car.icon}
                </div>
                <div class="text-xs font-bold text-slate-300 w-full flex justify-between px-1">
                    <span>#${i+1}</span>
                    <span class="text-yellow-400">x${odd}</span>
                </div>
                ${isSelected ? '<div class="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl"></div>' : ''}
            `;
            list.appendChild(btn);
        });
    },

    updateUI() {
        const balance = blockchainMode ? platformBalance : this.balance;
        const decimals = blockchainMode ? 4 : 2;
        
        const balanceEl = document.getElementById('balance-display');
        if (balanceEl) balanceEl.innerText = balance.toFixed(decimals);
        
        const betInputEl = document.getElementById('custom-bet-input');
        if (betInputEl) betInputEl.value = this.currentBet > 0 ? this.currentBet : '';
        
        const currentBetEl = document.getElementById('current-bet-display');
        if (currentBetEl) currentBetEl.innerText = this.currentBet.toFixed(decimals);
        
        let payout = 0;
        if (this.selectedCarIndex !== null) {
            payout = this.currentBet * this.odds[this.selectedCarIndex];
        }
        
        const payoutEl = document.getElementById('potential-payout');
        if (payoutEl) payoutEl.innerText = payout.toFixed(decimals);

        const btn = document.getElementById('action-btn');
        if (!btn) return;
        
        const minBet = blockchainMode ? 0.01 : CONFIG.minBet;
        const isValid = this.selectedCarIndex !== null && this.currentBet >= minBet && this.currentBet <= balance;
        
        if (this.state === 'RACING') {
            btn.innerText = "RACING...";
            btn.disabled = true;
            btn.className = "mt-auto w-full py-4 rounded-lg bg-slate-800 text-slate-500 font-bold text-xl tracking-wider cursor-wait";
        } else if (isValid) {
            btn.innerText = "PLACE BET & RACE";
            btn.disabled = false;
            btn.className = "mt-auto w-full py-4 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold text-xl uppercase tracking-wider transition shadow-lg transform active:scale-95";
        } else {
            btn.innerText = this.selectedCarIndex === null ? "SELECT A CAR" : "PLACE BET";
            btn.disabled = true;
            btn.className = "mt-auto w-full py-4 rounded-lg bg-slate-700 text-slate-500 font-bold text-xl uppercase tracking-wider transition shadow-lg cursor-not-allowed opacity-50";
        }

        if(this.state === 'LOBBY') this.renderRacerSelection();
    },

    showResultModal(won, payout) {
        const modal = document.getElementById('result-modal');
        const icon = document.getElementById('result-winner-icon');
        const name = document.getElementById('result-winner-name');
        const outcome = document.getElementById('result-outcome');
        
        if (!modal || !icon || !name || !outcome) return;
        
        icon.innerHTML = `<div class="w-24 mx-auto">${CARS[this.winnerIndex].icon}</div>`;
        name.innerText = CARS[this.winnerIndex].name + " Wins!";
        name.className = `text-xl font-bold ${CARS[this.winnerIndex].color}`;

        const decimals = blockchainMode ? 4 : 2;
        
        if (won) {
            outcome.innerHTML = `
                <div class="text-green-400 text-lg font-bold">YOU WON!</div>
                <div class="text-white text-3xl font-black digital-font">+${payout.toFixed(decimals)} ${blockchainMode ? 'SUI' : ''}</div>
            `;
        } else {
            outcome.innerHTML = `
                <div class="text-red-400 text-lg font-bold">YOU LOST</div>
                <div class="text-slate-500 text-sm">Better luck next time</div>
            `;
        }

        modal.classList.add('active');
    },

    toggleSettings() {
        const el = document.getElementById('settings-modal');
        if (el) el.classList.toggle('active');
    },

    toggleSoundConfig() {
        this.soundOn = !this.soundOn;
        AudioSys.enabled = this.soundOn;
        this.saveData();
        this.updateSoundIcon();
    },

    updateSoundIcon() {
        const btn = document.getElementById('toggle-sound');
        if (!btn || !btn.children[0]) return;
        
        if (this.soundOn) {
            btn.className = "w-12 h-6 bg-green-500 rounded-full relative transition-colors cursor-pointer";
            btn.children[0].className = "w-4 h-4 bg-white rounded-full absolute top-1 left-7 transition-all shadow-md";
        } else {
            btn.className = "w-12 h-6 bg-slate-600 rounded-full relative transition-colors cursor-pointer";
            btn.children[0].className = "w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-all shadow-md";
        }
    },

    openAdModal() {
        const modal = document.getElementById('ad-modal');
        const timerEl = document.getElementById('ad-timer');
        const statusEl = document.getElementById('ad-status');
        
        if (!modal) return;
        
        modal.classList.add('active');
        if (statusEl) statusEl.innerText = "";
        
        let timeLeft = 10;
        if (timerEl) timerEl.innerText = timeLeft + "s";
        
        if (this.adInterval) clearInterval(this.adInterval);
        
        this.adInterval = setInterval(() => {
            timeLeft--;
            if (timerEl) timerEl.innerText = timeLeft + "s";
            
            if (timeLeft <= 0) {
                clearInterval(this.adInterval);
                this.rewardAd();
            }
        }, 1000);
    },
    
    rewardAd() {
        const statusEl = document.getElementById('ad-status');
        if (statusEl) statusEl.innerText = "Reward Earned! +0.1 SUI";
        
        if (blockchainMode) {
            platformBalance += 0.1;
        } else {
            this.balance += 100;
        }
        
        this.saveData();
        this.updateUI();
        AudioSys.playWin(); 
        
        setTimeout(() => {
            const modal = document.getElementById('ad-modal');
            if (modal) modal.classList.remove('active');
        }, 1500);
    },

    showHistory() {
        const panel = document.getElementById('secondary-panel');
        const content = document.getElementById('secondary-content');
        const title = document.getElementById('secondary-title');
        
        if (!panel || !content || !title) return;
        
        title.innerText = "Race History";
        
        if (this.history.length === 0) {
            content.innerHTML = '<div class="text-center text-slate-500 mt-10">No races yet.</div>';
        } else {
            const decimals = blockchainMode ? 4 : 2;
            content.innerHTML = this.history.map(h => `
                <div class="flex justify-between items-center bg-slate-800 p-2 mb-2 rounded border-l-4 ${h.won ? 'border-green-500' : 'border-red-500'}">
                    <div>
                        <div class="text-xs text-slate-400">${h.time}</div>
                        <div class="font-bold text-white">Winner: ${h.winner}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-slate-400">Bet: ${h.bet.toFixed(decimals)}</div>
                        <div class="${h.won ? 'text-green-400' : 'text-slate-500'} font-bold">
                            ${h.won ? '+' + h.payout.toFixed(decimals) : '-' + h.bet.toFixed(decimals)}
                        </div>
                    </div>
                </div>
            `).join('');
        }
        panel.classList.remove('hidden');
    },

    hideSecondary() {
        const panel = document.getElementById('secondary-panel');
        if (panel) panel.classList.add('hidden');
    }
};

// ==========================================
// CONFETTI SYSTEM
// ==========================================

const Confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,

    start() {
        this.canvas = document.getElementById('confetti-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.particles = [];
        
        for(let i=0; i<150; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                color: ['#f00', '#0f0', '#00f', '#ff0', '#0ff'][Math.floor(Math.random()*5)],
                size: Math.random() * 5 + 5,
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1
            });
        }
        this.animate();
    },

    animate() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            p.y += p.speedY;
            p.x += Math.sin(p.y * 0.01) + p.speedX;
            
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);

            if (p.y > this.canvas.height) p.y = -10;
        });
        this.animationId = requestAnimationFrame(() => this.animate());
    },

    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
};

// ==========================================
// INITIALIZE
// ==========================================

window.Game = Game;

window.onload = () => Game.init();

window.onresize = () => {
    if(Confetti.canvas) {
        Confetti.canvas.width = window.innerWidth;
        Confetti.canvas.height = window.innerHeight;
    }
};