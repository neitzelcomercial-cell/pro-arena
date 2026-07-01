const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf-8');

// Colors - military green
c = c.replace('--green: #22c55e;', '--green: #4a7c3f;');
c = c.replace('--green-dark: #16a34a;', '--green-dark: #2d5a27;');
c = c.replace('--green-light: #4ade80;', '--green-light: #6b9e5e;');
c = c.replace('--green-glass: rgba(34,197,94,0.2);', '--green-glass: rgba(74,124,63,0.15);');
c = c.replace('--green-glass-hover: rgba(34,197,94,0.3);', '--green-glass-hover: rgba(74,124,63,0.25);');
c = c.replace('--green-glow: rgba(34,197,94,0.35);', '--green-glow: rgba(74,124,63,0.20);');
c = c.replace('--green-glow-strong: rgba(34,197,94,0.55);', '--green-glow-strong: rgba(74,124,63,0.35);');
c = c.replace('--sand: #d4d4d4;', '--sand: #c0c0c0;');
c = c.replace('--sand-dark: #a1a1aa;', '--sand-dark: #8a8a8a;');
c = c.replace('--red: #ef4444;', '--red: #8b3a3a;');
c = c.replace('--red-light: #dc2626;', '--red-light: #a52a2a;');
c = c.replace('--dark: #0a0a0a;', '--dark: #050505;');
c = c.replace('--dark-2: #111111;', '--dark-2: #0d0d0d;');
c = c.replace('--dark-3: #1a1a1a;', '--dark-3: #141414;');

// Glass & borders
c = c.replace('--glass-bg: rgba(255,255,255,0.06);', '--glass-bg: rgba(255,255,255,0.04);');
c = c.replace('--glass-bg-hover: rgba(255,255,255,0.10);', '--glass-bg-hover: rgba(255,255,255,0.07);');
c = c.replace('--glass-border: rgba(255,255,255,0.10);', '--glass-border: rgba(255,255,255,0.06);');
c = c.replace('--radius: 16px;', '--radius: 10px;');
c = c.replace('--radius-sm: 10px;', '--radius-sm: 6px;');
c = c.replace('--radius-xs: 6px;', '--radius-xs: 4px;');

// Remove festive animations
c = c.replace('animation: heroGlow 3s ease-in-out infinite;', 'animation: none;');
c = c.replace('animation: logoPulse 4s ease-in-out infinite;', 'animation: none;');
c = c.replace('animation: scrollBounce 2s ease-in-out infinite;', 'animation: none;');
c = c.replace('animation: heroZoom 20s ease-in-out infinite alternate;', 'animation: none;');
c = c.replace('animation: float 3s ease-in-out infinite;', 'animation: none;');

// Darker backgrounds
c = c.replace('filter:blur(2px) brightness(0.25)', 'filter:blur(4px) brightness(0.15)');
c = c.replace('filter: blur(4px) brightness(0.2) sepia(0.2) saturate(0.5);\n            opacity: 0.5;', 'filter: blur(6px) brightness(0.12) sepia(0.3) saturate(0.4);\n            opacity: 0.7;');

// Titles more serious
c = c.replace('.landing-title { font-family:Orbitron,monospace;font-size:clamp(22px,4vw,32px);color:#fff;letter-spacing:2px;text-align:center;font-weight:400; }', '.landing-title { font-family:Orbitron,monospace;font-size:clamp(18px,3.5vw,26px);color:#e0e0e0;letter-spacing:4px;text-align:center;font-weight:400;text-transform:uppercase; }');
c = c.replace('.landing-divider { width:60px;height:2px;background:var(--green);margin:12px auto 32px; }', '.landing-divider { width:36px;height:1px;background:var(--green);margin:10px auto 28px; }');

// Hero
c = c.replace('.landing-hero-title { font-family:Orbitron,monospace;font-size:clamp(32px,8vw,56px);color:#fff;letter-spacing:4px;font-weight:400; }', '.landing-hero-title { font-family:Orbitron,monospace;font-size:clamp(26px,6vw,44px);color:#e8e8e8;letter-spacing:8px;font-weight:400; }');
c = c.replace('.landing-hero-sub { font-size:clamp(16px,3vw,22px);color:var(--sand);margin-top:12px;font-weight:500; }', '.landing-hero-sub { font-size:clamp(13px,2vw,16px);color:var(--sand-dark);margin-top:10px;font-weight:400;letter-spacing:3px; }');
c = c.replace(".landing-hero-quote { font-family:'Special Elite',monospace;font-size:clamp(14px,2vw,18px);color:var(--green-light);margin-top:20px;opacity:0.7;font-style:italic; }", ".landing-hero-quote { font-family:'Special Elite',monospace;font-size:clamp(12px,1.8vw,15px);color:var(--sand-dark);margin-top:16px;opacity:0.5;font-style:normal;letter-spacing:1px; }");

// Buttons more straight
c = c.replace('.landing-btn { padding:12px 28px; border-radius:12px; font-weight:700; font-size:14px;', '.landing-btn { padding:8px 22px; border-radius:4px; font-weight:600; font-size:12px;');
c = c.replace('.landing-btn.primary:hover { transform:translateY(-2px);box-shadow:0 0 30px rgba(34,197,94,0.3); }', '.landing-btn.primary:hover { box-shadow:0 0 15px rgba(74,124,63,0.2); }');
c = c.replace('.landing-btn.secondary:hover { background:var(--green-glass);border-color:var(--green);color:var(--green); }', '.landing-btn.secondary:hover { border-color:var(--green);color:var(--green); }');

// Nav
c = c.replace('.landing-nav a { color:var(--sand); text-decoration:none; font-weight:600; font-size:12px;', '.landing-nav a { color:var(--sand-dark); text-decoration:none; font-weight:500; font-size:11px;');
c = c.replace('.landing-nav a:hover { background:var(--green-glass); color:var(--green); }', '.landing-nav a:hover { color:var(--green); }');

// Value cards
c = c.replace('.landing-value-card h3 { font-family:Orbitron,monospace;font-size:16px;color:var(--green);margin-bottom:8px; }', '.landing-value-card h3 { font-family:Orbitron,monospace;font-size:13px;color:var(--green);margin-bottom:6px;letter-spacing:2px; }');
c = c.replace('.landing-value-card p { font-size:14px;color:var(--sand-dark);line-height:1.5; }', '.landing-value-card p { font-size:12px;color:var(--sand-dark);line-height:1.6; }');

// Pricing
c = c.replace('.landing-price-value { font-family:Orbitron,monospace;font-size:28px;font-weight:900;color:#fff;margin:8px 0; }', '.landing-price-value { font-family:Orbitron,monospace;font-size:24px;font-weight:700;color:#e0e0e0;margin:6px 0; }');
c = c.replace('.landing-price-card h3 { font-family:Orbitron,monospace;font-size:14px;color:var(--green);margin-bottom:8px; }', '.landing-price-card h3 { font-family:Orbitron,monospace;font-size:12px;color:var(--green);margin-bottom:4px;letter-spacing:2px; }');

// Subtle hovers
c = c.replace('.landing-gallery-item:hover { border-color:var(--green);transform:scale(1.02); }', '.landing-gallery-item:hover { border-color:var(--green); }');
c = c.replace('.landing-info-card:hover { border-color:var(--green);transform:translateY(-4px);box-shadow:0 8px 30px rgba(34,197,94,0.1); }', '.landing-info-card:hover { border-color:var(--green); }');

// Darker overlay
c = c.replace('background:linear-gradient(180deg,rgba(10,10,10,0.4) 0%,rgba(10,10,10,0.8) 50%,var(--dark) 100%)', 'background:linear-gradient(180deg,rgba(5,5,5,0.5) 0%,rgba(5,5,5,0.85) 50%,var(--dark) 100%)');

// Text
c = c.replace('.landing-text { font-size:15px;line-height:1.8;color:var(--sand); }', '.landing-text { font-size:14px;line-height:1.7;color:var(--sand-dark); }');

// Contact
c = c.replace('.landing-contact-item strong { font-size:13px;color:var(--green);display:block;margin-bottom:2px; }', '.landing-contact-item strong { font-size:12px;color:var(--green);display:block;margin-bottom:2px;letter-spacing:1px; }');
c = c.replace('.landing-contact-item p { font-size:13px;color:var(--sand);line-height:1.4; }', '.landing-contact-item p { font-size:12px;color:var(--sand-dark);line-height:1.4; }');

// Social buttons
c = c.replace('.landing-social-btn { padding:10px;border-radius:8px;color:var(--sand);text-decoration:none;font-weight:700;font-size:12px;text-align:center;border:1px solid var(--glass-border);background:var(--glass-bg);backdrop-filter:blur(8px); }', '.landing-social-btn { padding:8px;border-radius:4px;color:var(--sand);text-decoration:none;font-weight:600;font-size:11px;text-align:center;border:1px solid var(--glass-border);background:var(--glass-bg); }');
c = c.replace('.landing-social-btn:hover { border-color:var(--glass-border-hover);background:var(--glass-bg-hover); }', '.landing-social-btn:hover { border-color:var(--green); }');

// Particles
c = c.replace('const count = Math.min(80, Math.floor(w*h/15000));', 'const count = Math.min(30, Math.floor(w*h/25000));');
c = c.replace('ctx.fillStyle=`rgba(34,197,94,${p.a})`;', 'ctx.fillStyle=`rgba(74,124,63,${p.a*0.5})`;');
c = c.replace('ctx.strokeStyle=`rgba(34,197,94,${0.05*(1-dist/120)})`;', 'ctx.strokeStyle=`rgba(74,124,63,${0.03*(1-dist/120)})`;');
c = c.replace("ctx.strokeStyle='rgba(34,197,94,0.03)';", "ctx.strokeStyle='rgba(74,124,63,0.02)';");
c = c.replace('ctx.fillStyle = `rgba(34,197,94,${0.08 + Math.random() * 0.15})`;', 'ctx.fillStyle = `rgba(74,124,63,${0.03 + Math.random() * 0.06})`;');

// Canvas opacity
c = c.replace('#matrixCanvas { position: fixed; inset: 0; z-index: 0; width: 100vw; height: 100vh; pointer-events: none; opacity: 0.4; }', '#matrixCanvas { position: fixed; inset: 0; z-index: 0; width: 100vw; height: 100vh; pointer-events: none; opacity: 0.10; }');
c = c.replace('#particleCanvas { position:fixed; inset:0; z-index:0; width:100vw; height:100vh; pointer-events:none; opacity:0.6; }', '#particleCanvas { position:fixed; inset:0; z-index:0; width:100vw; height:100vh; pointer-events:none; opacity:0.15; }');

// Text replacements
c = c.replace('Mais que um esporte — uma experiência de estratégia, honra e superação', 'ESTRATÉGIA · HONRA · SUPERAÇÃO');
c = c.replace('"O campo de batalha não define quem você é — ele revela."', '"A disciplina forja guerreiros. A honra define homens."');
c = c.replace('"A guerra não é vencida por aquele que atira primeiro, mas por aquele que nunca desiste do seu squad."', '"A verdadeira vitória está na superação dos próprios limites."');

// Nav uppercase
c = c.replace('>Início<', '>INÍCIO<');
c = c.replace('>Sobre<', '>SOBRE<');
c = c.replace('>Fotos<', '>FOTOS<');
c = c.replace('>Contato<', '>CONTATO<');
c = c.replace('>Agenda<', '>AGENDA<');

// Button texts
c = c.replace('📅 Agende seu Jogo', '◆ AGENDAR');
c = c.replace('◆ Conheça mais', '◆ CONHECER');
c = c.replace('📅 Agende Agora', '◆ AGENDAR');

fs.writeFileSync('index.html', c, 'utf-8');
console.log('✅ Ar serio aplicado!');
