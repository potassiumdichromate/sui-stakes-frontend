// ==========================================
// BLOCKCHAIN/BACKEND INTEGRATION
// ==========================================

let blockchainMode = (window.parent !== window);
let platformBalance = 0;
let currentSessionId = null;

const API_URL = 'https://sui-stakes-backend.onrender.com';

if (blockchainMode) {
    console.log('🔗 Platform mode enabled for Crash');
    window.parent.postMessage({ type: 'CRASH_READY' }, '*');
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'BALANCE_UPDATE') {
        platformBalance = event.data.balance;
        console.log('💰 Balance updated:', platformBalance);
        if (window.game) {
            window.game.wallet = platformBalance;
            window.game.updateWallet();
        }
    }
});

// ==========================================
// SOUND SYSTEM
// ==========================================

const AudioSys = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),
    muted: false,
    
    playTone(freq, type, duration, vol=0.1) {
        if(this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    
    sfx: {
        jump: () => {
            if(AudioSys.muted) return;
            const osc = AudioSys.ctx.createOscillator();
            const gain = AudioSys.ctx.createGain();
            osc.frequency.setValueAtTime(200, AudioSys.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, AudioSys.ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, AudioSys.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, AudioSys.ctx.currentTime + 0.1);
            osc.connect(gain); gain.connect(AudioSys.ctx.destination);
            osc.start(); osc.stop(AudioSys.ctx.currentTime + 0.1);
        },
        land: () => AudioSys.playTone(150, 'sawtooth', 0.1, 0.15),
        win: () => {
            [440, 554, 659, 880].forEach((f, i) => setTimeout(() => AudioSys.playTone(f, 'square', 0.2, 0.1), i*80));
        },
        crash: () => {
            if(AudioSys.muted) return;
            const bufferSize = AudioSys.ctx.sampleRate * 0.5;
            const buffer = AudioSys.ctx.createBuffer(1, bufferSize, AudioSys.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = AudioSys.ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = AudioSys.ctx.createGain();
            gain.gain.setValueAtTime(0.5, AudioSys.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, AudioSys.ctx.currentTime + 0.5);
            noise.connect(gain); gain.connect(AudioSys.ctx.destination);
            noise.start();
        }
    }
};

// ==========================================
// 3D SCENE
// ==========================================

class SceneManager {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050510, 0.04);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 100);
        this.camera.position.set(4, 5, 6);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x050510);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        this.ball = null;
        this.stairs = [];
        this.particles = [];
        this.trailPoints = [];
        
        this.setupLights();
        this.createEnvironment();
        this.createBall();

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        window.addEventListener('resize', () => this.resize());
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0x00f3ff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xbc13fe, 1, 20);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
    }

    createEnvironment() {
        const gridHelper = new THREE.GridHelper(100, 50, 0x00f3ff, 0x111122);
        gridHelper.position.y = -2;
        this.scene.add(gridHelper);
        this.grid = gridHelper;
    }

    createBall() {
        const geo = new THREE.IcosahedronGeometry(0.4, 1);
        const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x00f3ff,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.8,
            flatShading: true
        });
        this.ball = new THREE.Mesh(geo, mat);
        this.ball.castShadow = true;
        this.ball.position.set(0, 0.4, 0);
        this.scene.add(this.ball);
    }

    spawnStair(index, x, y, z) {
        const geo = new THREE.BoxGeometry(1.8, 0.4, 1.8);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x11111f,
            roughness: 0.1,
            metalness: 0.9
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y - 0.2, z);
        mesh.receiveShadow = true;
        mesh.userData = { id: index, originalY: y - 0.2 };

        const edges = new THREE.EdgesGeometry(geo);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.5 });
        const wireframe = new THREE.LineSegments(edges, lineMat);
        mesh.add(wireframe);

        mesh.scale.set(0,0,0);
        gsap.to(mesh.scale, {x:1, y:1, z:1, duration: 0.4, ease:"back.out(1.5)"});
        
        this.scene.add(mesh);
        this.stairs.push(mesh);
        return mesh;
    }

    spawnParticles(pos, color=0x00f3ff) {
        const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: color });
        for(let i=0; i<15; i++) {
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(pos);
            p.userData.vel = new THREE.Vector3(
                (Math.random()-0.5)*0.5,
                Math.random()*0.5,
                (Math.random()-0.5)*0.5
            );
            p.userData.life = 1.0;
            this.scene.add(p);
            this.particles.push(p);
        }
    }

    spawnTrail() {
        if(!this.ball) return;
        const ghost = new THREE.Mesh(
            this.ball.geometry,
            new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.3 })
        );
        ghost.position.copy(this.ball.position);
        ghost.scale.copy(this.ball.scale);
        ghost.userData.life = 0.5;
        this.scene.add(ghost);
        this.trailPoints.push(ghost);
    }

    reset() {
        this.stairs.forEach(s => this.scene.remove(s));
        this.stairs = [];
        this.ball.position.set(0, 0.4, 0);
        this.ball.visible = true;
        this.camera.position.set(4, 5, 6);
        this.camera.lookAt(0,0,0);
        this.spawnStair(0,0,0,0);
    }

    animate() {
        requestAnimationFrame(this.animate);
        
        if(this.grid) {
            this.grid.position.z += 0.05;
            if(this.grid.position.z > 0) this.grid.position.z = -2;
        }

        if(this.ball) {
            this.ball.rotation.x -= 0.05;
            this.ball.rotation.z -= 0.02;
        }

        for(let i=this.particles.length-1; i>=0; i--) {
            const p = this.particles[i];
            p.position.add(p.userData.vel);
            p.userData.vel.y -= 0.01;
            p.userData.life -= 0.02;
            p.scale.setScalar(p.userData.life);
            if(p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i,1);
            }
        }

        if(window.game && window.game.isJumping) {
           if(Math.random() > 0.5) this.spawnTrail();
        }

        for(let i=this.trailPoints.length-1; i>=0; i--) {
            const t = this.trailPoints[i];
            t.userData.life -= 0.02;
            t.material.opacity = t.userData.life;
            t.scale.multiplyScalar(0.95);
            if(t.userData.life <= 0) {
                this.scene.remove(t);
                this.trailPoints.splice(i,1);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// ==========================================
// GAME LOGIC - MANUAL GAMEPLAY
// ==========================================

class Game {
    constructor() {
        console.log('🎮 Game constructor called');
        
        this.scene = new SceneManager();
        this.wallet = blockchainMode ? 0 : (parseFloat(localStorage.getItem('neon_wallet')) || 1000);
        this.bet = 0.01;
        this.history = [];

        this.isPlaying = false;
        this.isJumping = false;
        this.stairIndex = 0;
        this.currentMult = 1.0;

        this.els = {
            wallet: document.getElementById('wallet-display'),
            betInput: document.getElementById('bet-input'),
            mult: document.getElementById('multiplier-display'),
            risk: document.getElementById('risk-display'),
            hud: document.getElementById('game-hud'),
            betUi: document.getElementById('bet-ui'),
            playUi: document.getElementById('play-ui'),
            cashoutVal: document.getElementById('cashout-val'),
            jumpBtn: document.getElementById('jump-btn'),
            cashoutBtn: document.getElementById('cashout-btn'),
            toastContainer: document.getElementById('toast-container'),
        };

        this.init();
    }

    init() {
        console.log('🎮 Game init called');
        
        this.updateWallet();

        const startBtn = document.getElementById('start-btn');
        if(startBtn) {
            console.log('✅ Start button found');
            startBtn.onclick = () => {
                console.log('🎲 Start button clicked!');
                this.startRound();
            };
        } else {
            console.error('❌ Start button NOT found!');
        }

        if(this.els.jumpBtn) this.els.jumpBtn.onclick = () => this.jump();
        if(this.els.cashoutBtn) this.els.cashoutBtn.onclick = () => this.cashout();

        // Add bet button handlers
        const minBtn = document.getElementById('min-bet-btn');
        const doubleBtn = document.getElementById('double-bet-btn');
        const maxBtn = document.getElementById('max-bet-btn');
        
        if(minBtn) minBtn.onclick = () => this.setBet(0.01);
        if(doubleBtn) doubleBtn.onclick = () => this.doubleBet();
        if(maxBtn) maxBtn.onclick = () => this.maxBet();

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isPlaying && !this.isJumping) {
                e.preventDefault();
                this.jump();
            }
        });

        const soundBtn = document.getElementById('sound-btn');
        if(soundBtn) {
            soundBtn.onclick = () => {
                AudioSys.muted = !AudioSys.muted;
                soundBtn.style.opacity = AudioSys.muted ? 0.5 : 1;
            };
        }

        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if(splash) {
                splash.style.opacity = 0;
                setTimeout(() => splash.remove(), 500);
            }
        }, 2000);
    }
    
    setBet(v) { 
        if(this.els.betInput) this.els.betInput.value = v; 
    }
    
    doubleBet() { 
        if(this.els.betInput) this.els.betInput.value = Math.min(5000, this.els.betInput.value * 2); 
    }
    
    maxBet() { 
        const balance = blockchainMode ? platformBalance : this.wallet;
        if(this.els.betInput) this.els.betInput.value = Math.min(balance, 5000); 
    }

    updateWallet() {
        const balance = blockchainMode ? platformBalance : this.wallet;
        if(this.els.wallet) {
            this.els.wallet.innerText = balance.toFixed(4) + (blockchainMode ? ' SUI' : '');
        }
        if(!blockchainMode) {
            localStorage.setItem('neon_wallet', this.wallet);
        }
    }

    async startRound() {
        if(this.isPlaying) return;
        
        const b = parseFloat(this.els.betInput?.value || 0.01);
        const balance = blockchainMode ? platformBalance : this.wallet;
        
        if(b > balance) {
            this.msgFlash("INSUFFICIENT FUNDS", "text-red-500");
            return;
        }
        
        if(b < 0.01) {
            this.msgFlash("MIN BET 0.01", "text-red-500");
            return;
        }

        if(blockchainMode) {
            try {
                const userAddress = await this.getUserAddress();
                
                const response = await fetch(`${API_URL}/api/crash/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userAddress,
                        betAmount: Math.floor(b * 1_000_000_000)
                    })
                });

                const data = await response.json();

                if (!data.success) {
                    this.msgFlash(data.error, "text-red-500");
                    return;
                }

                currentSessionId = data.sessionId;
                platformBalance = data.newBalance / 1_000_000_000;
                this.wallet = platformBalance;
                this.updateWallet();

                this.msgFlash("PRESS SPACE TO JUMP!", "text-[#00f3ff]");
                
            } catch (error) {
                console.error('Start session error:', error);
                this.msgFlash("Failed to start round", "text-red-500");
                return;
            }
        } else {
            this.wallet -= b;
            this.updateWallet();
        }

        this.bet = b;
        this.isPlaying = true;
        this.stairIndex = 0;
        this.currentMult = 1.0;
        
        this.scene.reset();

        if(this.els.betUi) this.els.betUi.style.display = 'none';
        if(this.els.playUi) this.els.playUi.style.display = 'flex';
        if(this.els.hud) this.els.hud.style.opacity = 1;
        if(this.els.mult) this.els.mult.innerText = "1.00x";
        if(this.els.risk) this.els.risk.innerText = "5%";
        if(this.els.cashoutVal) this.els.cashoutVal.innerText = "0.00 SUI";
        if(this.els.cashoutBtn) this.els.cashoutBtn.disabled = true;
        if(this.els.jumpBtn) this.els.jumpBtn.disabled = false;

        this.spawnNextTarget();
    }

    async getUserAddress() {
        return new Promise((resolve) => {
            if (blockchainMode) {
                window.parent.postMessage({ type: 'GET_ADDRESS' }, '*');
                const handler = (event) => {
                    if (event.data.type === 'ADDRESS_RESPONSE') {
                        window.removeEventListener('message', handler);
                        resolve(event.data.address);
                    }
                };
                window.addEventListener('message', handler);
            } else {
                resolve('demo-user');
            }
        });
    }

    spawnNextTarget() {
        const x = (Math.random()-0.5) * 1;
        const y = (this.stairIndex + 1) * 0.5;
        const z = -(this.stairIndex + 1) * 2;
        this.scene.spawnStair(this.stairIndex+1, x, y, z);
    }

    async jump() {
        if(this.isJumping || !this.isPlaying) return;
        
        const nextIdx = this.stairIndex + 1;
        
        // CHECK CRASH STATUS BEFORE JUMPING
        if(blockchainMode && currentSessionId) {
            try {
                console.log('🔍 Checking crash for stair:', nextIdx);
                
                const response = await fetch(`${API_URL}/api/crash/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: currentSessionId,
                        currentStair: nextIdx
                    })
                });

                const data = await response.json();
                console.log('📊 Check result:', data);

                if (data.crashed) {
                    console.log('💥 CRASH DETECTED!', data.crashStair);
                    this.doCrashAtStair(nextIdx, data.crashStair);
                    currentSessionId = null;
                    return;
                }
            } catch (error) {
                console.error('Check crash error:', error);
            }
        }
        
        // SAFE TO JUMP
        this.isJumping = true;
        if(this.els.jumpBtn) this.els.jumpBtn.disabled = true;
        if(this.els.cashoutBtn) this.els.cashoutBtn.disabled = true;

        const stair = this.scene.stairs.find(s => s.userData.id === nextIdx);
        
        if (!stair) {
            this.isJumping = false;
            return;
        }

        const ball = this.scene.ball;
        const targetPos = { x: stair.position.x, y: stair.position.y + 0.6, z: stair.position.z };

        AudioSys.sfx.jump();

        const tl = gsap.timeline({
            onComplete: () => {
                this.isJumping = false;
                this.doLand(nextIdx);
            }
        });

        tl.to(ball.position, { x: targetPos.x, z: targetPos.z, duration: 0.6, ease: "linear" }, 0);
        tl.to(ball.position, { y: targetPos.y + 1.5, duration: 0.3, ease: "circ.out" }, 0);
        tl.to(ball.position, { y: targetPos.y, duration: 0.3, ease: "circ.in" }, 0.3);

        gsap.to(this.scene.camera.position, {
            x: targetPos.x + 3, y: targetPos.y + 5, z: targetPos.z + 6, duration: 0.8
        });
    }

    doLand(idx) {
        this.stairIndex = idx;
        this.currentMult = Math.pow(1.15, idx);
        
        AudioSys.sfx.land();
        this.scene.spawnParticles(this.scene.ball.position);
        
        if(this.els.mult) {
            this.els.mult.style.transform = "scale(1.2)";
            setTimeout(() => this.els.mult.style.transform = "scale(1)", 100);
            this.els.mult.innerText = this.currentMult.toFixed(2) + "x";
        }
        
        const potentialWin = this.bet * this.currentMult;
        if(this.els.cashoutVal) this.els.cashoutVal.innerText = potentialWin.toFixed(4) + " SUI";
        if(this.els.risk) this.els.risk.innerText = Math.min(95, Math.round((0.05 + (idx*0.04))*100)) + "%";
        
        if(this.els.jumpBtn) this.els.jumpBtn.disabled = false;
        if(this.els.cashoutBtn) this.els.cashoutBtn.disabled = false;
        
        if(this.scene.stairs.length > 6) {
            const old = this.scene.stairs.shift();
            this.scene.scene.remove(old);
        }
        this.spawnNextTarget();
    }

    doCrashAtStair(jumpStair, crashStair) {
        console.log('💥 Crashing at stair:', crashStair);
        
        const stair = this.scene.stairs.find(s => s.userData.id === jumpStair);
        
        AudioSys.sfx.crash();
        this.scene.spawnParticles(this.scene.ball.position, 0xff0055);
        this.scene.ball.visible = false;
        
        if(stair) {
            gsap.to(stair.rotation, {x: 0.5, z: 0.5, duration: 0.5});
            gsap.to(stair.position, {y: -5, duration: 0.5});
        }

        this.msgFlash(`💥 CRASHED AT STAIR ${crashStair}!`, "text-red-500");
        
        // Update balance
        if(blockchainMode) {
            setTimeout(async () => {
                try {
                    const userAddress = await this.getUserAddress();
                    const response = await fetch(`${API_URL}/api/balance/${userAddress}`);
                    const data = await response.json();
                    platformBalance = data.balance / 1_000_000_000;
                    this.wallet = platformBalance;
                    this.updateWallet();
                    
                    this.msgFlash(`Lost ${this.bet.toFixed(4)} SUI`, "text-red-500");
                } catch (error) {
                    console.error('Balance fetch error:', error);
                }
                
                this.endRound(false);
            }, 1500);
        } else {
            setTimeout(() => this.endRound(false), 1500);
        }
    }

    async cashout() {
        if(!this.isPlaying || this.stairIndex === 0) return;
        
        console.log('💰 Cashing out at stair:', this.stairIndex);
        
        if(blockchainMode && currentSessionId) {
            try {
                const response = await fetch(`${API_URL}/api/crash/finalize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: currentSessionId,
                        cashedOutAt: this.stairIndex
                    })
                });

                const data = await response.json();
                console.log('💰 Cashout result:', data);

                if (data.success && data.won) {
                    platformBalance = data.newBalance / 1_000_000_000;
                    this.wallet = platformBalance;
                    this.updateWallet();
                    
                    AudioSys.sfx.win();
                    const profit = (data.payout / 1_000_000_000) - this.bet;
                    this.msgFlash(`✅ WON ${data.multiplier.toFixed(2)}x! +${profit.toFixed(4)} SUI`, "text-[#0aff0a]");
                    
                    if(typeof confetti !== 'undefined') {
                        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00f3ff', '#bc13fe'] });
                    }
                } else {
                    this.msgFlash("Already crashed!", "text-red-500");
                }

                currentSessionId = null;
                
            } catch (error) {
                console.error('Cashout error:', error);
                this.msgFlash("Cashout failed", "text-red-500");
            }
        } else {
            const win = this.bet * this.currentMult;
            this.wallet += win;
            this.updateWallet();
            
            AudioSys.sfx.win();
            this.msgFlash(`WON ${win.toFixed(4)}!`, "text-[#0aff0a]");
        }

        this.endRound(true);
    }

    endRound(won) {
        this.isPlaying = false;
        
        setTimeout(() => {
            if(this.els.playUi) this.els.playUi.style.display = 'none';
            if(this.els.betUi) this.els.betUi.style.display = 'block';
            if(this.els.hud) this.els.hud.style.opacity = 0;
            gsap.to(this.scene.camera.position, { x: 4, y: 5, z: 6, duration: 1.5 });
        }, 1000);
    }

    msgFlash(txt, cls) {
        if(!this.els.toastContainer) return;
        
        const el = document.createElement('div');
        
        let borderColor = 'border-blue-500';
        
        if (cls.includes('red')) {
            borderColor = 'border-red-500';
        } else if (cls.includes('#0aff0a') || cls.includes('green')) {
            borderColor = 'border-[#0aff0a]';
        }

        el.className = `toast-enter pointer-events-auto bg-[#050510]/95 backdrop-blur-md border-l-4 ${borderColor} text-white p-4 rounded-r-lg shadow-lg min-w-[200px]`;
        el.innerHTML = `<div class="font-bold">${txt}</div>`;

        this.els.toastContainer.appendChild(el);

        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transition = 'all 0.3s ease';
            setTimeout(() => el.remove(), 300);
        }, 3000);
    }
}

console.log('📜 Script loaded, creating game...');
window.game = null;

window.addEventListener('load', () => {
    console.log('🌐 Window loaded, initializing game...');
    window.game = new Game();
    console.log('✅ Game created:', window.game);
});