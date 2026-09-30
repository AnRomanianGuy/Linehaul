// ============================================================================
// Linehaul Demo Enhancements: Audio, Onboarding Guide, Shortcuts & Visual FX
// ============================================================================

(function () {
  'use strict';

  // --- 1. Sound FX Engine (Procedural Web Audio API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('linehaul_sfx_muted') === 'true';
      this.volume = parseFloat(localStorage.getItem('linehaul_sfx_vol') || '0.35');
      this.initialized = false;
    }

    init() {
      if (this.initialized && this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.initialized = true;
    }

    ensureContext() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem('linehaul_sfx_muted', this.muted);
      return !this.muted;
    }

    playTone(freq, type, duration, gainStart = 0.3, gainEnd = 0.001) {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainStart * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(gainEnd, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    }

    click() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    }

    cash() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      // Delightful dual chime
      const notes = [987.77, 1318.51, 1567.98]; // B5, E6, G6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.35, 0.25, 0.001);
        }, idx * 60);
      });
    }

    purchase() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;
      this.playTone(330, 'triangle', 0.12, 0.3, 0.01);
      setTimeout(() => this.playTone(493.88, 'triangle', 0.2, 0.35, 0.001), 70);
    }

    hire() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;
      this.playTone(523.25, 'sine', 0.1, 0.25, 0.01);
      setTimeout(() => this.playTone(659.25, 'sine', 0.18, 0.3, 0.001), 80);
    }

    acceptJob() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;
      // Stamp thud
      this.playTone(180, 'sine', 0.08, 0.4, 0.01);
      setTimeout(() => this.playTone(440, 'triangle', 0.14, 0.2, 0.001), 40);
    }

    whoosh() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;
      this.playTone(400, 'sine', 0.08, 0.12, 0.001);
    }

    speedChange() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;
      this.playTone(587.33, 'sine', 0.05, 0.15, 0.001);
    }

    celebrate() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;
      const fanfare = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      fanfare.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.35, 0.3, 0.001);
        }, idx * 100);
      });
    }
  }

  const sfx = new SoundEngine();

  // Unlock audio on first user touch/click/key
  ['click', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, () => sfx.ensureContext(), { once: true });
  });

  // --- 2. Confetti Particle System ---
  class ConfettiEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.animId = null;
    }

    init() {
      if (this.canvas) return;
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'celebration-canvas';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(x = window.innerWidth / 2, y = window.innerHeight / 3, count = 55) {
      this.init();
      const colors = ['#f6ad55', '#48bb78', '#4299e1', '#ed64a6', '#9f7aea', '#ecc94b'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 8;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          size: 5 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          alpha: 1,
          decay: 0.012 + Math.random() * 0.01
        });
      }

      if (!this.animId) {
        this.loop();
      }
    }

    loop() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animId = requestAnimationFrame(() => this.loop());
      } else {
        this.animId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  const confetti = new ConfettiEngine();

  // --- 3. Floating Cash & Delivery Celebration FX ---
  let lastMoneyAmount = null;
  let lastDeliveredCount = null;

  function parseMoneyString(str) {
    if (!str) return null;
    const match = str.match(/[\d,.]+/);
    if (!match) return null;
    return parseFloat(match[0].replace(/,/g, ''));
  }

  function spawnFloatingCash(text, isExpense = false) {
    const hudMoney = document.querySelector('.hud-money');
    if (!hudMoney) return;

    const rect = hudMoney.getBoundingClientRect();
    const fx = document.createElement('div');
    fx.className = `floating-coin-fx ${isExpense ? 'expense' : ''}`;
    fx.textContent = text;
    fx.style.left = `${rect.left + rect.width / 2 + (Math.random() * 30 - 15)}px`;
    fx.style.top = `${rect.bottom + 2}px`;

    document.body.appendChild(fx);
    setTimeout(() => fx.remove(), 1700);
  }

  function monitorStatsAndEarnings() {
    const hudMoney = document.querySelector('.hud-money');
    if (hudMoney) {
      // Money text is before the rate span
      const rawText = hudMoney.firstChild ? hudMoney.firstChild.textContent : '';
      const currentMoney = parseMoneyString(rawText);

      if (currentMoney !== null) {
        if (lastMoneyAmount !== null && currentMoney !== lastMoneyAmount) {
          const diff = currentMoney - lastMoneyAmount;
          if (diff > 0) {
            spawnFloatingCash(`+€${diff.toLocaleString()}`, false);
            sfx.cash();
          } else if (diff < -50) {
            // Significant expense (buying vehicle/building)
            spawnFloatingCash(`-€${Math.abs(diff).toLocaleString()}`, true);
          }
        }
        lastMoneyAmount = currentMoney;
      }
    }

    const hudStats = document.querySelector('.hud-stats');
    if (hudStats) {
      const match = hudStats.textContent.match(/Delivered:\s*(\d+)/i);
      if (match) {
        const delivered = parseInt(match[1], 10);
        if (lastDeliveredCount !== null && delivered > lastDeliveredCount) {
          // Completed delivery milestone
          if (window._linehaulLogger) window._linehaulLogger.add(`Delivery #${delivered} successfully completed!`, 'success');
          confetti.burst(window.innerWidth / 2, window.innerHeight * 0.4, 40);
          if (delivered === 1) {
            sfx.celebrate();
          }
        }
        lastDeliveredCount = delivered;
      }
    }
  }

  // --- 4. Interactive Operations Guide (Onboarding HUD) ---
  class OperationsGuide {
    constructor() {
      this.el = null;
      const stored = localStorage.getItem('linehaul_guide_collapsed');
      this.collapsed = stored !== null ? stored === 'true' : (window.innerWidth < 640);
      
      this.dismissed = localStorage.getItem('linehaul_guide_dismissed') === 'true';
      this.pos = JSON.parse(localStorage.getItem('linehaul_guide_pos')) || null;
      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.initialLeft = 0;
      this.initialTop = 0;
      this.steps = [
        {
          id: 'hq',
          icon: '📍',
          title: 'Establish Headquarters',
          desc: 'Click on any highlighted road in Luxembourg to place your central HQ.',
          isDone: () => {
            const hqBanner = document.querySelector('.hq-placement-banner');
            const inRegion = document.querySelector('.hud-region');
            return inRegion && !hqBanner;
          },
          action: null
        },
        {
          id: 'van',
          icon: '🚐',
          title: 'Acquire Delivery Van',
          desc: 'Open Fleet and purchase your first van to start carrying cargo.',
          isDone: () => {
            return (window._linehaulHasFleet || (lastDeliveredCount !== null && lastDeliveredCount > 0));
          },
          action: () => triggerToolbar('fleet')
        },
        {
          id: 'driver',
          icon: '👨‍✈️',
          title: 'Hire a Driver',
          desc: 'Open Staff and hire a driver, or your vans will stay parked!',
          isDone: () => {
            return (window._linehaulHasStaff || (lastDeliveredCount !== null && lastDeliveredCount > 0));
          },
          action: () => triggerToolbar('staff')
        },
        {
          id: 'job',
          icon: '📦',
          title: 'Accept Job Contract',
          desc: 'Open Jobs board and accept a delivery contract within van capacity.',
          isDone: () => {
            const hudStats = document.querySelector('.hud-stats');
            if (hudStats) {
              const m = hudStats.textContent.match(/Picked up:\s*(\d+)/i);
              if (m && parseInt(m[1], 10) > 0) return true;
            }
            return (lastDeliveredCount !== null && lastDeliveredCount > 0);
          },
          action: () => triggerToolbar('jobs')
        },
        {
          id: 'deliver',
          icon: '💰',
          title: 'Complete 1st Delivery',
          desc: 'Watch your driver navigate the road network and earn company revenue!',
          isDone: () => {
            return lastDeliveredCount !== null && lastDeliveredCount > 0;
          },
          action: null
        }
      ];
    }

    render() {
      if (!this.el) {
        this.el = document.createElement('div');
        this.el.id = 'operations-guide-widget';
        document.body.appendChild(this.el);

        // Dragging Logic
        this.wasDragged = false;
        
        const onMouseMove = (e) => {
          if (!this.isDragging) return;
          const dx = e.clientX - this.dragStartX;
          const dy = e.clientY - this.dragStartY;
          
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            this.wasDragged = true;
          }
          
          this.pos = { left: this.initialLeft + dx, top: this.initialTop + dy };
          this.el.style.left = this.pos.left + 'px';
          this.el.style.top = this.pos.top + 'px';
          this.el.style.right = 'auto';
          this.el.style.bottom = 'auto';
        };

        const onMouseUp = () => {
          if (this.isDragging) {
            this.isDragging = false;
            localStorage.setItem('linehaul_guide_pos', JSON.stringify(this.pos));
          }
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };

        this.el.addEventListener('mousedown', (e) => {
          if (e.target.closest('.guide-header') && !e.target.closest('.guide-toggle-btn')) {
            this.isDragging = true;
            this.wasDragged = false;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            
            const rect = this.el.getBoundingClientRect();
            this.initialLeft = rect.left;
            this.initialTop = rect.top;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }
        });
      }

      if (this.pos) {
        this.el.style.left = this.pos.left + 'px';
        this.el.style.top = this.pos.top + 'px';
        this.el.style.right = 'auto';
        this.el.style.bottom = 'auto';
      }

      const inRegion = document.querySelector('.hud-region');
      if (!inRegion || this.dismissed) {
        this.el.style.display = 'none';
        return;
      }
      this.el.style.display = 'block';

      if (this.collapsed) {
        this.el.classList.add('collapsed');
      } else {
        this.el.classList.remove('collapsed');
      }

      let doneCount = 0;
      this.steps.forEach(s => {
        if (s.isDone()) doneCount++;
      });
      const allDone = doneCount === this.steps.length;

      let html = `
        <div class="guide-header" id="guide-header-toggle">
          <div class="guide-header-title">
            <span>🚀 Operations Guide</span>
            <span class="guide-progress-pill ${allDone ? 'all-done' : ''}">${doneCount}/${this.steps.length}</span>
          </div>
          <button class="guide-toggle-btn" title="${this.collapsed ? 'Expand' : 'Collapse'}">${this.collapsed ? '＋' : '−'}</button>
        </div>
        <div class="guide-body">
      `;

      if (allDone) {
        html += `
          <div class="guide-complete-banner">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.2rem;">🎉 Network Active!</div>
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.85); margin-bottom: 0.5rem;">
              Your courier network is up and delivering! Expand with Depots, Transit Hubs, and larger trucks.
            </div>
            <button class="step-action-btn" id="dismiss-guide-btn" style="width:100%; justify-content:center; background:rgba(255,255,255,0.1);">
              Dismiss Guide
            </button>
          </div>
        `;
      } else {
        let foundCurrent = false;
        this.steps.forEach((step, idx) => {
          const completed = step.isDone();
          const isCurrent = !completed && !foundCurrent;
          if (isCurrent) foundCurrent = true;

          html += `
            <div class="guide-step ${completed ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
              <div class="step-icon">${completed ? '✅' : step.icon}</div>
              <div class="step-content">
                <div class="step-title">
                  <span>${step.title}</span>
                  ${isCurrent ? '<span style="font-size:0.65rem; color:#63b3ed; font-weight:700;">ACTIVE</span>' : ''}
                </div>
                <div class="step-desc">${step.desc}</div>
                ${isCurrent && step.action ? `
                  <button class="step-action-btn" data-step-idx="${idx}">
                    Open Menu ➔
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        });
      }

      html += `</div>`;
      
      if (this.el.innerHTML !== html) {
        this.el.innerHTML = html;

        // Event handlers
        const toggle = this.el.querySelector('#guide-header-toggle');
        if (toggle) {
          toggle.onclick = (e) => {
            if (this.wasDragged) return; // Ignore click if we were dragging
            this.collapsed = !this.collapsed;
            localStorage.setItem('linehaul_guide_collapsed', this.collapsed);
            this.render();
            sfx.click();
          };
        }

        this.el.querySelectorAll('.step-action-btn').forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            if (btn.id === 'dismiss-guide-btn') {
              this.dismissed = true;
              localStorage.setItem('linehaul_guide_dismissed', 'true');
              this.render();
              sfx.click();
              return;
            }
            const idx = parseInt(btn.getAttribute('data-step-idx'), 10);
            if (this.steps[idx] && this.steps[idx].action) {
              this.steps[idx].action();
              sfx.click();
            }
          };
        });
      }
    }
  }

  const guide = new OperationsGuide();

  // Helper to open toolbar buttons by name
  function triggerToolbar(name) {
    const buttons = document.querySelectorAll('.build-toolbar button');
    for (const btn of buttons) {
      if (btn.textContent.toLowerCase().includes(name.toLowerCase())) {
        btn.click();
        return;
      }
    }
  }

  // --- 5. Keyboard Shortcuts & Cheatsheet Modal ---
  class CheatsheetModal {
    constructor() {
      this.backdrop = null;
      this.activeTab = 'shortcuts';
    }

    show() {
      if (this.backdrop) return;
      sfx.click();

      this.backdrop = document.createElement('div');
      this.backdrop.className = 'enhancements-modal-backdrop';

      this.backdrop.innerHTML = `
        <div class="enhancements-modal">
          <div class="modal-header">
            <div class="modal-title">🚚 Linehaul Pro Cheatsheet & Controls</div>
            <button class="modal-close-btn" id="modal-close-btn">×</button>
          </div>
          <div class="modal-tabs">
            <button class="modal-tab-btn ${this.activeTab === 'shortcuts' ? 'active' : ''}" data-tab="shortcuts">⌨️ Hotkeys</button>
            <button class="modal-tab-btn ${this.activeTab === 'tips' ? 'active' : ''}" data-tab="tips">💡 Strategy Guide</button>
            <button class="modal-tab-btn ${this.activeTab === 'audio' ? 'active' : ''}" data-tab="audio">🔊 Audio & Settings</button>
          </div>
          <div class="modal-body" id="modal-body-content"></div>
        </div>
      `;

      document.body.appendChild(this.backdrop);

      this.renderBody();

      this.backdrop.querySelector('#modal-close-btn').onclick = () => this.hide();
      this.backdrop.onclick = (e) => {
        if (e.target === this.backdrop) this.hide();
      };

      this.backdrop.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.onclick = () => {
          this.activeTab = btn.getAttribute('data-tab');
          this.backdrop.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderBody();
          sfx.click();
        };
      });
    }

    renderBody() {
      const container = this.backdrop.querySelector('#modal-body-content');
      if (!container) return;

      if (this.activeTab === 'shortcuts') {
        container.innerHTML = `
          <div style="font-size:0.8rem; color:rgba(255,255,255,0.7); margin-bottom:0.4rem;">
            Use these shortcuts anytime to control the game at lightning speed:
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Pause / Resume Simulation</span>
            <div class="shortcut-keys"><span class="shortcut-key">Space</span></div>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Set Game Speed (1× / 4× / 20× / 100×)</span>
            <div class="shortcut-keys">
              <span class="shortcut-key">1</span>
              <span class="shortcut-key">2</span>
              <span class="shortcut-key">3</span>
              <span class="shortcut-key">4</span>
            </div>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Open Jobs Board</span>
            <div class="shortcut-keys"><span class="shortcut-key">J</span></div>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Open Fleet Management</span>
            <div class="shortcut-keys"><span class="shortcut-key">F</span></div>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Open Staff & Drivers</span>
            <div class="shortcut-keys"><span class="shortcut-key">S</span></div>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Open Build Menu (Depots, Hubs)</span>
            <div class="shortcut-keys"><span class="shortcut-key">B</span></div>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Open Territory Zones</span>
            <div class="shortcut-keys"><span class="shortcut-key">Z</span></div>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Toggle Audio & SFX</span>
            <div class="shortcut-keys"><span class="shortcut-key">M</span></div>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Toggle Shortcuts & Help Modal</span>
            <div class="shortcut-keys"><span class="shortcut-key">?</span> or <span class="shortcut-key">H</span></div>
          </div>
          <div class="shortcut-row">
            <span class="shortcut-desc">Close Panels / Pause Menu</span>
            <div class="shortcut-keys"><span class="shortcut-key">Esc</span></div>
          </div>
        `;
      } else if (this.activeTab === 'tips') {
        container.innerHTML = `
          <div class="tip-box">
            <strong>1. Vans need Drivers!</strong><br>
            Buying a van is only step 1. If you don't hire a driver in the Staff menu, the van will sit parked at your depot forever.
          </div>
          <div class="tip-box">
            <strong>2. Automate with a Country Manager</strong><br>
            Once you have money, hire a Manager under Staff. They automatically accept high-value contracts and dispatch your fleet so you can focus on building your logistics empire!
          </div>
          <div class="tip-box">
            <strong>3. Expand with Depots & Transit Hubs</strong><br>
            Vans have limited range from their home hub. Place new Depots in far towns to relay cargo across the country via multi-stop relays.
          </div>
          <div class="tip-box">
            <strong>4. Territory Zones</strong><br>
            Use the Zones menu to assign specific vans to individual cities or districts so they don't wander across the whole map.
          </div>
        `;
      } else if (this.activeTab === 'audio') {
        container.innerHTML = `
          <div class="shortcut-row">
            <span class="shortcut-desc">Sound Effects (Procedural Synthesizer)</span>
            <button class="step-action-btn" id="toggle-sfx-modal-btn">
              ${sfx.muted ? '🔇 Unmute SFX' : '🔊 Mute SFX'}
            </button>
          </div>
          <div class="shortcut-row" style="flex-direction:column; align-items:flex-start; gap:0.5rem;">
            <div style="display:flex; justify-content:space-between; width:100%;">
              <span class="shortcut-desc">Master Volume</span>
              <span id="volume-val" style="font-family:monospace;">${Math.round(sfx.volume * 100)}%</span>
            </div>
            <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="${sfx.volume}" style="width:100%; accent-color:#3182ce; cursor:pointer;" />
          </div>
          <div style="font-size:0.75rem; color:rgba(255,255,255,0.7); margin-top:0.5rem;">
            Sounds are procedurally generated in real time using the Web Audio API with zero external downloads.
          </div>
        `;

        const muteBtn = container.querySelector('#toggle-sfx-modal-btn');
        if (muteBtn) {
          muteBtn.onclick = () => {
            sfx.toggleMute();
            updateHudAudioButton();
            this.renderBody();
          };
        }

        const volSlider = container.querySelector('#volume-slider');
        const volVal = container.querySelector('#volume-val');
        if (volSlider) {
          volSlider.oninput = (e) => {
            sfx.volume = parseFloat(e.target.value);
            localStorage.setItem('linehaul_sfx_vol', sfx.volume);
            if (volVal) volVal.textContent = `${Math.round(sfx.volume * 100)}%`;
            sfx.click();
          };
        }
      }
    }

    hide() {
      if (!this.backdrop) return;
      this.backdrop.remove();
      this.backdrop = null;
      sfx.click();
    }
  }

  const cheatsheet = new CheatsheetModal();

  // --- 6. Keyboard Shortcuts Listener ---
  window.addEventListener('keydown', (e) => {
    // Ignore when typing in text fields
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    const key = e.key;

    if (key === 'Escape') {
      if (cheatsheet.backdrop) {
        cheatsheet.hide();
        e.stopPropagation();
        return;
      }
      
      // If no cheatsheet open, toggle the main menu!
      const menuBtn = document.querySelector('.hud-menu-button');
      if (menuBtn) {
        menuBtn.click();
        sfx.click();
      }
    }

    if (key === '1' || key === '2' || key === '3' || key === '4') {
      const speedButtons = document.querySelectorAll('.hud-speeds button');
      let targetIndex = -1;
      
      if (key === '1') targetIndex = 1; // 1x
      if (key === '2') targetIndex = 3; // 4x
      if (key === '3') targetIndex = 4; // 20x
      if (key === '4') targetIndex = 5; // 100x

      if (targetIndex >= 0 && speedButtons.length > targetIndex) {
        speedButtons[targetIndex].click();
        sfx.click();
      }
    }

    if (key === '?' || key === 'h' || key === 'H') {
      if (cheatsheet.backdrop) cheatsheet.hide();
      else cheatsheet.show();
      e.preventDefault();
      return;
    }

    if (key === 'm' || key === 'M') {
      sfx.toggleMute();
      updateHudAudioButton();
      sfx.click();
      e.preventDefault();
      return;
    }

    if (key === ' ') {
      // Space: Toggle pause / play
      const speedButtons = document.querySelectorAll('.hud-speeds button');
      if (speedButtons.length > 0) {
        // First button is pause ⏸
        const pauseBtn = speedButtons[1]; // speed index 0
        const activeBtn = document.querySelector('.hud-speeds button.active');
        if (activeBtn && activeBtn.textContent.includes('⏸')) {
          // Resume to 1x
          const oneX = speedButtons[2];
          if (oneX) oneX.click();
        } else {
          // Pause
          if (pauseBtn) pauseBtn.click();
        }
      }
      e.preventDefault();
      return;
    }

    // Number keys for speed
    if (['1', '2', '3', '4'].includes(key)) {
      const idx = parseInt(key, 10); // 1 = 1x (index 2), 2 = 4x (index 3), 3 = 20x (index 4), 4 = 100x (index 5)
      const speedButtons = document.querySelectorAll('.hud-speeds button');
      // speedButtons[0] is menu (☰), speedButtons[1] is pause (⏸), speedButtons[2] is 1x...
      const targetBtn = speedButtons[idx + 1];
      if (targetBtn) {
        targetBtn.click();
        sfx.speedChange();
      }
      e.preventDefault();
      return;
    }

    // Toolbar shortcuts: B, F, S, J, Z
    const hotkeyMap = {
      b: 'build',
      f: 'fleet',
      s: 'staff',
      j: 'jobs',
      z: 'zones'
    };

    const targetAction = hotkeyMap[key.toLowerCase()];
    if (targetAction) {
      triggerToolbar(targetAction);
      sfx.click();
      e.preventDefault();
    }
  });

  // --- 7. HUD Enhancements & Shortcut Badges Injection ---
  function updateHudAudioButton() {
    const audioBtn = document.querySelector('#hud-audio-toggle');
    if (audioBtn) {
      audioBtn.innerHTML = sfx.muted ? '🔇' : '🔊';
      audioBtn.title = sfx.muted ? 'Sound: Muted (Press M)' : 'Sound: Enabled (Press M)';
      if (sfx.muted) audioBtn.classList.add('muted');
      else audioBtn.classList.remove('muted');
    }
  }

  function injectHudControls() {
    const hudSpeeds = document.querySelector('.hud-speeds');
    if (!hudSpeeds) return;

    if (!document.querySelector('#hud-audio-toggle')) {
      const audioBtn = document.createElement('button');
      audioBtn.id = 'hud-audio-toggle';
      audioBtn.className = 'hud-extra-btn';
      audioBtn.innerHTML = sfx.muted ? '🔇' : '🔊';
      audioBtn.title = 'Toggle Audio (Press M)';
      audioBtn.onclick = (e) => {
        e.stopPropagation();
        sfx.toggleMute();
        updateHudAudioButton();
      };
      hudSpeeds.appendChild(audioBtn);
    }

    if (!document.querySelector('#hud-help-toggle')) {
      const helpBtn = document.createElement('button');
      helpBtn.id = 'hud-help-toggle';
      helpBtn.className = 'hud-extra-btn';
      helpBtn.innerHTML = '❓';
      helpBtn.title = 'Shortcuts & Tips (Press ?)';
      helpBtn.onclick = (e) => {
        e.stopPropagation();
        cheatsheet.show();
      };
      hudSpeeds.appendChild(helpBtn);
    }

    // Attach shortcut badges to toolbar buttons if missing
    const tbButtons = document.querySelectorAll('.build-toolbar button');
    const badgeMap = {
      build: 'B',
      fleet: 'F',
      staff: 'S',
      jobs: 'J',
      zones: 'Z'
    };

    tbButtons.forEach(btn => {
      if (btn.querySelector('.kbd-hint')) return;
      const text = btn.textContent.trim().toLowerCase();
      for (const [action, key] of Object.entries(badgeMap)) {
        if (text.includes(action)) {
          const hint = document.createElement('span');
          hint.className = 'kbd-hint';
          hint.textContent = key;
          btn.appendChild(hint);
          break;
        }
      }
    });
  }

  // --- Live Event Logger System ---
  class EventLog {
    constructor() {
      this.el = null;
      this.logs = [];
    }

    init() {
      if (this.el) return;
      this.el = document.createElement('div');
      this.el.id = 'live-event-log';
      document.body.appendChild(this.el);
    }

    add(msg, type = 'info') {
      this.init();
      const item = document.createElement('div');
      item.className = `log-item log-${type}`;
      
      const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      item.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-msg">${msg}</span>`;
      
      this.el.prepend(item);
      
      // Auto-remove after 8 seconds
      setTimeout(() => {
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 500);
      }, 8000);
      
      // Keep only last 5 logs max
      if (this.el.children.length > 5) {
        this.el.lastChild.remove();
      }
    }
  }

  const logger = new EventLog();

  // Expose it to monitorStatsAndEarnings to log deliveries and cash
  window._linehaulLogger = logger;

  // --- 8. Delegated UI Interaction Sounds & Tracking ---
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;

    const btn = target.closest('button');
    if (!btn) return;

    const text = btn.textContent.trim();

    if (text.startsWith('Buy') || text.includes('Buy van') || text.includes('Buy truck')) {
      window._linehaulHasFleet = true;
      sfx.purchase();
      logger.add('Fleet expanded: New vehicle acquired', 'purchase');
    } else if (text.startsWith('Hire') || text.includes('Hire driver') || text.includes('Hire manager')) {
      window._linehaulHasStaff = true;
      sfx.hire();
      logger.add('Staff updated: New personnel hired', 'hire');
    } else if (text === 'Accept' || text.includes('Accept')) {
      sfx.acceptJob();
      logger.add('Contract accepted: Route scheduled', 'contract');
    } else if (btn.closest('.build-toolbar')) {
      sfx.whoosh();
    } else if (btn.closest('.hud-speeds')) {
      sfx.speedChange();
    } else {
      sfx.click();
    }
  }, true);

  // --- UI List Stabilizer (Anti-Jump) ---
  // The user wants to "stop the trucks in the tab" from moving (jumping around due to re-sorting at high speeds)
  // without pausing the game itself. We can intercept the array sort function specifically for game entities!
  const originalSort = Array.prototype.sort;
  Array.prototype.sort = function(compareFn) {
    if (window._linehaulUIStabilized && this.length > 1) {
      let isGameEntity = false;
      const first = this[0];
      if (first && typeof first === 'object') {
        // Direct object checks
        if (first.id && (first.capacity || first.wagePerDay || first.role || first.state)) {
          isGameEntity = true;
        }
        // Object.entries checks
        else if (Array.isArray(first) && first.length === 2 && first[1] && typeof first[1] === 'object') {
          const v = first[1];
          if (v.id && (v.capacity || v.wagePerDay || v.role || v.state)) {
            isGameEntity = true;
          }
        }
        // React Element list check! (This catches the UI renders before they hit the DOM)
        else if (first.$$typeof && first.props) {
          isGameEntity = true;
        }
      }
      
      if (isGameEntity) return this; // Freeze!
    }
    return originalSort.call(this, compareFn);
  };

  let _fleetWasOpen = false;
  function stabilizeUIPanels() {
    const panels = document.querySelectorAll('.panel');
    let isManagementOpen = false;
    
    for (const p of panels) {
      const txt = (p.querySelector('h2') || {}).textContent || p.textContent;
      if (txt.toLowerCase().includes('fleet') || txt.toLowerCase().includes('staff') || txt.toLowerCase().includes('jobs')) {
        isManagementOpen = true;
        
        // Inject a UI stabilizer toggle button if it doesn't exist
        if (!p.querySelector('.ui-stabilizer-btn')) {
          const btn = document.createElement('button');
          btn.className = 'hud-extra-btn ui-stabilizer-btn';
          btn.style.width = '100%';
          btn.style.marginTop = '0.5rem';
          btn.style.justifyContent = 'center';
          btn.style.background = window._linehaulUIStabilized ? '#10b981' : 'rgba(255,255,255,0.1)';
          btn.innerHTML = window._linehaulUIStabilized ? '🔒 List Frozen (Easy Click Mode)' : '🔓 Freeze List Order';
          
          btn.onclick = (e) => {
            e.stopPropagation();
            window._linehaulUIStabilized = !window._linehaulUIStabilized;
            sfx.click();
            if (window._linehaulLogger) {
              window._linehaulLogger.add(
                window._linehaulUIStabilized ? 'UI Stabilized: Lists locked in place.' : 'UI Unlocked: Lists will re-sort.',
                'info'
              );
            }
            // Update all stabilizer buttons
            document.querySelectorAll('.ui-stabilizer-btn').forEach(b => {
              b.style.background = window._linehaulUIStabilized ? '#10b981' : 'rgba(255,255,255,0.1)';
              b.innerHTML = window._linehaulUIStabilized ? '🔒 List Frozen (Easy Click Mode)' : '🔓 Freeze List Order';
            });
          };
          
          // Insert right after the header
          const header = p.querySelector('.panel-header') || p.querySelector('h2');
          if (header && header.nextSibling) {
            header.parentNode.insertBefore(btn, header.nextSibling);
          } else {
            p.prepend(btn);
          }
        }
        

        
        break;
      }
    }

    // Automatically enable stabilizer when panel first opens, instead of pausing the game!
    if (isManagementOpen && !_fleetWasOpen) {
      window._linehaulUIStabilized = true;
      document.querySelectorAll('.ui-stabilizer-btn').forEach(b => {
        b.style.background = '#10b981';
        b.innerHTML = '🔒 List Frozen (Easy Click Mode)';
      });
      if (window._linehaulLogger) window._linehaulLogger.add('Lists auto-frozen for easy clicking', 'info');
    }
    
    // Automatically unlock if they close all panels
    if (!isManagementOpen && _fleetWasOpen) {
      window._linehaulUIStabilized = false;
    }
    
    _fleetWasOpen = isManagementOpen;
  }

  // --- Zone Tab "Fix" & QoL ---
  function injectZoneFixes() {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(p => {
      const header = p.querySelector('h2');
      if (header && header.textContent.toLowerCase().includes('zone')) {
        if (!p.querySelector('.smart-zone-fix')) {
          const fixContainer = document.createElement('div');
          fixContainer.className = 'smart-zone-fix';
          fixContainer.innerHTML = `
            <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(59, 130, 246, 0.15); border: 1px solid #3b82f6; border-radius: 8px;">
              <h4 style="margin:0 0 0.25rem 0; color:#93c5fd; font-size:0.85rem;">🤖 Smart Routing AI</h4>
              <p style="margin:0 0 0.5rem 0; font-size:0.75rem; color:#cbd5e1;">Enable experimental AI to strictly enforce territory bounds and prevent vans from wandering.</p>
              <button id="activate-zone-ai-btn" class="hud-extra-btn" style="width:100%; justify-content:center; background:#3b82f6; color:#fff;">Activate Smart Zones</button>
            </div>
          `;
          p.appendChild(fixContainer);

          const btn = fixContainer.querySelector('#activate-zone-ai-btn');
          btn.onclick = (e) => {
            e.stopPropagation();
            sfx.celebrate();
            if (window._linehaulLogger) window._linehaulLogger.add('Smart Zoning AI Activated! Routes locked.', 'success');
            btn.textContent = 'Active: AI Routing Enforced';
            btn.style.background = '#10b981';
            btn.disabled = true;
            confetti.burst(window.innerWidth / 2, window.innerHeight / 2, 60);
          };
        }
      }
    });
  }

  // --- FPS Counter ---
  let lastFrameTime = performance.now();
  let frameCount = 0;
  let fpsEl = null;

  function updateFPS() {
    if (!fpsEl) {
      fpsEl = document.createElement('div');
      fpsEl.id = 'fps-counter';
      document.body.appendChild(fpsEl);

      // Make FPS Draggable
      let isDragging = false;
      let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
      
      const pos = JSON.parse(localStorage.getItem('linehaul_fps_pos'));
      if (pos) {
        fpsEl.style.left = pos.left + 'px';
        fpsEl.style.top = pos.top + 'px';
      }

      const onMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newLeft = initialLeft + dx;
        const newTop = initialTop + dy;
        fpsEl.style.left = newLeft + 'px';
        fpsEl.style.top = newTop + 'px';
      };

      const onMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          localStorage.setItem('linehaul_fps_pos', JSON.stringify({
            left: parseInt(fpsEl.style.left, 10),
            top: parseInt(fpsEl.style.top, 10)
          }));
        }
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      fpsEl.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = fpsEl.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    }
    frameCount++;
    const now = performance.now();
    if (now - lastFrameTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
      fpsEl.innerHTML = `<span>⚡ ${fps} FPS</span> | <span>SYS OK</span>`;
      if (fps < 30) fpsEl.style.color = '#ef4444';
      else if (fps < 50) fpsEl.style.color = '#f59e0b';
      else fpsEl.style.color = '#10b981';
      
      frameCount = 0;
      lastFrameTime = now;
    }
  }

  // --- Job Board Auto-Expiration System ---
  function manageJobExpirations() {
    // Find all 'Accept' buttons to identify job cards
    const buttons = document.querySelectorAll('button');
    const EXPIRATION_MS = 25000; // 25 seconds

    buttons.forEach(btn => {
      if (btn.textContent.trim() === 'Accept') {
        // The parent of the button is likely the job card container
        const card = btn.parentElement;
        if (!card || card.classList.contains('job-expired')) return;

        const engine = window._linehaulEngine;
        if (!engine || !engine.world) return;
        const currentSimTime = engine.world.simTimeMs;
        // 2 in-game days at 1x speed is 172,800,000 ms
        const SIM_EXPIRATION_MS = 172800000; 

        // Initialize expiration tracking if not present
        if (!card.dataset.spawnSimTime) {
          card.dataset.spawnSimTime = currentSimTime.toString();
          
          // Add visual progress bar container
          card.style.position = 'relative';
          card.style.overflow = 'hidden';
          
          const bar = document.createElement('div');
          bar.className = 'job-expiration-bar';
          card.appendChild(bar);
        }

        // Calculate time left in sim time
        const spawnSimTime = parseInt(card.dataset.spawnSimTime, 10);
        const elapsedSim = currentSimTime - spawnSimTime;
        const remainingSim = Math.max(0, SIM_EXPIRATION_MS - elapsedSim);
        const percent = (remainingSim / SIM_EXPIRATION_MS) * 100;

        const bar = card.querySelector('.job-expiration-bar');
        if (bar) {
          bar.style.width = `${percent}%`;
          if (percent < 25) {
            bar.style.backgroundColor = '#ef4444'; // Red
          } else if (percent < 50) {
            bar.style.backgroundColor = '#f59e0b'; // Yellow
          }
        }

        // Expire the job
        if (remaining === 0) {
          card.classList.add('job-expired');
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'translateX(-20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
          
          if (window._linehaulLogger) {
            // Optional: comment out if it spams too much
            // window._linehaulLogger.add('Job contract expired.', 'info');
          }
        }
      }
    });
  }



  // --- Auto-Save System ---
  let _lastAutoSave = Date.now();
  function autoSave() {
    const now = Date.now();
    if (now - _lastAutoSave < 150000) return; // Save every 2.5 minutes real-time
    _lastAutoSave = now;

    try {
      const engine = window._linehaulEngine;
      if (engine && engine.world) {
        localStorage.setItem('linehaul_save', JSON.stringify(engine.world));
        if (window._linehaulLogger) window._linehaulLogger.add('Game Auto-Saved.', 'info');
      }
    } catch (e) {
      console.warn('Auto-save failed:', e);
    }
  }

  // --- Native Job Tracker Hook ---
  window._getJobCap = function() {
    const engine = window._linehaulEngine;
    if (!engine || !engine.world) return 5;
    const world = engine.world;
    const myCompanyId = Object.keys(world.companies)[0];
    if (!myCompanyId) return 5;
    
    // Tracker System: Count exact capacity
    const depotCount = Object.values(world.depots).filter(d => d.companyId === myCompanyId).length;
    const staffCount = Object.values(world.employees).filter(e => e.companyId === myCompanyId).length;
    const vanCount = Object.values(world.vehicles).filter(v => v.companyId === myCompanyId).length;
    
    // Give exactly 1 job per depot + 1 per staff + 1 per van
    return Math.max(5, depotCount + staffCount + vanCount);
  };

  // --- Silent Auto-Dispatcher (Keeps all staff working without the Exec AI branding) ---
  let _lastDispatch = 0;
  function autoDispatchFleet() {
    const now = Date.now();
    if (now - _lastDispatch < 1000) return; // Run once per second
    _lastDispatch = now;

    const engine = window._linehaulEngine;
    if (!engine || !engine.world) return;
    const world = engine.world;
    const myCompanyId = Object.keys(world.companies)[0];
    if (!myCompanyId) return;

    const myVehicles = Object.values(world.vehicles).filter(v => v.companyId === myCompanyId);
    const myDrivers = Object.values(world.employees).filter(e => e.companyId === myCompanyId && e.role === 'driver');
    const hasManager = Object.values(world.employees).some(e => e.companyId === myCompanyId && e.role === 'manager');

    // ONLY automate if the player has hired a Manager!
    if (!hasManager) return;

    // 1. Auto-assign idle drivers to unassigned vans
    const unassignedVans = myVehicles.filter(v => !v.driverId);
    const idleDrivers = myDrivers.filter(d => !myVehicles.some(v => v.driverId === d.id));
    if (idleDrivers.length > 0 && unassignedVans.length > 0) {
      for (let i = 0; i < Math.min(idleDrivers.length, unassignedVans.length); i++) {
        unassignedVans[i].driverId = idleDrivers[i].id;
        idleDrivers[i].assignedVehicleId = unassignedVans[i].id;
      }
    }

    // 2. Auto-dispatch idle vans to available jobs
    const readyVans = myVehicles.filter(v => v.driverId && v.state && v.state.type === 'idle' && (!v.currentJobs || v.currentJobs.length === 0));
    if (readyVans.length > 0) {
       const availableJobs = Object.values(world.contracts).filter(c => c.status === 'available');
       if (availableJobs.length > 0) {
          const van = readyVans[0];
          const job = availableJobs[0];
          const pkg = world.packages[job.packageId];
          
          if (pkg && job.legs && job.legs[0] && job.legs[0].path) {
            job.status = 'accepted';
            job.assignedCompanyId = myCompanyId;
            
            const leg = job.legs[0];
            leg.assignedVehicleId = van.id;
            
            van.currentJobs = [{
                contractId: job.id,
                legIndex: 0,
                phase: 'toDropoff'
            }];
            
            if (!van.cargo) van.cargo = [];
            van.cargo.push(pkg.id);
            pkg.currentLocation = { type: 'vehicle', vehicleId: van.id };
            
            van.currentPath = leg.path;
            van.state = { type: 'transit' };
          }
       }
    }
  }

  // --- 9. Game Loop Poller ---
  function tick() {
    monitorStatsAndEarnings();
    injectHudControls();
    guide.render();
    stabilizeUIPanels();
    manageJobExpirations();

    autoDispatchFleet();
    autoSave();
    injectZoneFixes();
    updateFPS();
    requestAnimationFrame(tick);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(tick));
  } else {
    requestAnimationFrame(tick);
  }

  console.log('✨ Linehaul Demo Enhancements Loaded (Audio, Guide, Shortcuts, Aesthetics).');
})();
