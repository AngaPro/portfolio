document.addEventListener('DOMContentLoaded', () => {
    const ambientBg = document.getElementById('ambient-bg');
    
    
    function updateClock() {
        const clock = document.getElementById('clock');
        if(clock) {
            clock.textContent = new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    const waveDisplacement = document.getElementById('wave-displacement');

    let targetScale = 0; 
    let currentScale = 0; 
    let waveTime = 0; 

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const width = window.innerWidth;
        const height = window.innerHeight;

        const pctX = (x / width) * 100;
        const pctY = (y / height) * 100;

        const dx = x - width / 2;
        const dy = y - height / 2;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        if (ambientBg) {
            ambientBg.style.setProperty('--mouse-x', `${pctX}%`);
            ambientBg.style.setProperty('--mouse-y', `${pctY}%`);
            ambientBg.style.setProperty('--angle', angle.toFixed(4));
        }

        
        targetScale = Math.min(targetScale + 55, 190);
    });

function animateLiquid() {
    
    if (ambientBg && ambientBg.classList.contains('liquid-enabled')) {
        waveTime += 0.005;
        currentScale += (targetScale - currentScale) * 0.07;
        targetScale *= 0.93; 

        if (waveDisplacement) {
            waveDisplacement.setAttribute('scale', currentScale.toFixed(2));
        }
    } else {
        
        if (waveDisplacement && waveDisplacement.getAttribute('scale') !== '0') {
            waveDisplacement.setAttribute('scale', '0');
        }
    }
    requestAnimationFrame(animateLiquid);
}
animateLiquid();

    function centerWindow(targetWindow) {
        const systemHeader = document.querySelector('.system-header');
        const minTop = systemHeader ? systemHeader.offsetHeight : 30; 
        
        
        const left = (window.innerWidth - targetWindow.offsetWidth) / 2;
        
        const top = minTop + (window.innerHeight - minTop - targetWindow.offsetHeight) / 2;
        
        
        targetWindow.style.left = `${Math.max(0, left)}px`;
        targetWindow.style.top = `${Math.max(minTop, top)}px`;
    }
    
    const body = document.body;

    function initWindowDragging(windowId, headerId) {
        const targetWindow = document.getElementById(windowId);
        const targetHeader = document.getElementById(headerId);
        if (!targetWindow || !targetHeader) return;

        let isDragging = false;
        let offset = { x: 0, y: 0 };

        targetHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            offset = { 
                x: e.clientX - targetWindow.offsetLeft, 
                y: e.clientY - targetWindow.offsetTop 
            };
            
            body.classList.add('dragging');
            targetWindow.style.transition = "none";
            targetWindow.style.transform = "scale(1.015)";
            
            
            const pw = document.getElementById('draggableWindow');
            const sw = document.getElementById('settingsWindow');
            const cw = document.getElementById('codeWindow');
            if (pw && targetWindow !== pw) pw.style.zIndex = "100";
            if (sw && targetWindow !== sw) sw.style.zIndex = "100";
            if (cw && targetWindow !== cw) cw.style.zIndex = "100";
            targetWindow.style.zIndex = "1000";
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            
            let newX = e.clientX - offset.x;
            let newY = e.clientY - offset.y;

            
            const systemHeader = document.querySelector('.system-header');
            const minTop = systemHeader ? systemHeader.offsetHeight : 0; 
            const minLeft = 0; 
            
            
            const maxLeft = window.innerWidth - targetWindow.offsetWidth;
            const maxTop = window.innerHeight - targetWindow.offsetHeight;

            
            if (newX < minLeft) newX = minLeft;
            if (newX > maxLeft) newX = maxLeft;
            if (newY < minTop) newY = minTop;
            if (newY > maxTop) newY = maxTop;

            
            targetWindow.style.left = `${newX}px`;
            targetWindow.style.top = `${newY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                body.classList.remove('dragging');
                targetWindow.style.transform = "scale(1)";
                targetWindow.style.transition = "transform 0.3s ease";
            }
        });
    }

    
    initWindowDragging('draggableWindow', 'windowHeader');
    initWindowDragging('settingsWindow', 'settingsWindowHeader');
    initWindowDragging('codeWindow', 'codeWindowHeader');
    initWindowDragging('pdfViewerWindow', 'pdfViewerWindowHeader');

    // Même comportement de focus pour toutes les fenêtres : un clic n'importe où
    // dans la fenêtre la ramène au premier plan, exactement comme les autres apps.
    const managedWindows = ['draggableWindow', 'settingsWindow', 'codeWindow', 'pdfViewerWindow']
        .map(id => document.getElementById(id))
        .filter(Boolean);
    let windowStackCounter = 1000;
    function focusManagedWindow(target) {
        if (!target) return;
        // Le focus doit être immédiat : la fenêtre ciblée passe devant toutes les autres
        // avant même le démarrage d'une éventuelle animation d'ouverture.
        windowStackCounter += 1;
        managedWindows.forEach(win => {
            if (win !== target && win.style.display !== 'none') {
                win.style.zIndex = String(Math.max(100, windowStackCounter - 1));
            }
        });
        target.style.zIndex = String(windowStackCounter);
        target.style.position = 'absolute';
    }
    managedWindows.forEach(win => {
        win.addEventListener('pointerdown', () => focusManagedWindow(win));
    });

    
    const tabs = document.querySelectorAll('.sidebar-nav .nav-tab:not(.locked)');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            const currentSidebar = tab.closest('.sidebar-nav');
            const currentViewport = tab.closest('.app-viewport');

            if (currentSidebar && currentViewport) {
                currentSidebar.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                currentViewport.querySelectorAll('.tab-content').forEach(content => {
                    if (content.id === targetId) {
                        content.classList.add('active');
                        setTimeout(() => {
                            content.style.opacity = '1';
                        }, 10);
                    } else {
                        content.style.opacity = '0';
                        content.classList.remove('active');
                    }
                });
            }
        });
    });
    
    const radarRings = document.querySelectorAll('.radar-ring');
    const tacticalCards = document.querySelectorAll('.tactical-card');

    
    if (tacticalCards.length > 0 && radarRings.length > 0) {
        tacticalCards.forEach(c => c.classList.remove('active'));
        radarRings.forEach(r => r.classList.remove('glow-active'));
        
        document.getElementById('step-but1').classList.add('active');
        document.querySelector('.ring-outer').classList.add('glow-active');
    }

    
    radarRings.forEach(ring => {
        ring.addEventListener('mouseenter', () => {
            const targetCardId = ring.getAttribute('data-aim');
            
            
            radarRings.forEach(r => r.classList.remove('glow-active'));
            tacticalCards.forEach(card => card.classList.remove('active'));
            
            
            ring.classList.add('glow-active');
            const matchedCard = document.getElementById(targetCardId);
            if (matchedCard) {
                matchedCard.classList.add('active');
            }
        });
    });
    const redBtn = document.querySelector('.light.red');
    const yellowBtn = document.querySelector('.light.yellow');
    const trafficLightsContainer = document.querySelector('.traffic-lights');
    const dockContainer = document.querySelector('.dock-container');
    let presentationStateSaved = null;
    let settingsStateSaved = null;
    let isAnimatingGenie = false;

    const svgNS = "http://www.w3.org/2000/svg";
    let genieSvg = document.getElementById('genie-svg-container');
    if (!genieSvg) {
        genieSvg = document.createElementNS(svgNS, "svg");
        genieSvg.id = 'genie-svg-container';
        genieSvg.style.position = 'absolute';
        genieSvg.style.width = '0';
        genieSvg.style.height = '0';
        genieSvg.style.pointerEvents = 'none';
        
        let clipPath = document.createElementNS(svgNS, "clipPath");
        clipPath.id = "genie-clip";
        clipPath.setAttribute("clipPathUnits", "userSpaceOnUse");
        
        let path = document.createElementNS(svgNS, "path");
        path.id = "genie-path";
        
        clipPath.appendChild(path);
        genieSvg.appendChild(clipPath);
        document.body.appendChild(genieSvg);
    }
    const geniePathEl = document.getElementById('genie-path');

    document.querySelectorAll('.traffic-lights').forEach(container => {
        container.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
    });

    function updateGeniePath(progress, winRect, dockRect) {
        const W = winRect.width;
        const H = winRect.height;

        const targetX = (dockRect.left + dockRect.width / 2) - winRect.left;
        const targetY = dockRect.top - winRect.top;

        const steps = 40; 
        let leftPoints = [];
        let rightPoints = [];

        for (let i = 0; i <= steps; i++) {
            const yFrac = i / steps;
            const layerProgress = Math.pow(progress, 3.5 - 2.5 * yFrac);

            let currentCenter = (W / 2) + (targetX - (W / 2)) * layerProgress;
            const waveBelly = Math.sin(yFrac * Math.PI) * (targetX - (W / 2)) * 0.48 * Math.sin(progress * Math.PI);
            currentCenter += waveBelly;

            const currentWidth = W * (1 - layerProgress);

            const xLeft = currentCenter - currentWidth / 2;
            const xRight = currentCenter + currentWidth / 2;
            const yCurrent = (yFrac * H) + (targetY - (yFrac * H)) * layerProgress;

            leftPoints.push({ x: xLeft, y: yCurrent });
            rightPoints.unshift({ x: xRight, y: yCurrent });
        }

        let pathStr = `M ${leftPoints[0].x} ${leftPoints[0].y}`;
        for (let p of leftPoints) pathStr += ` L ${p.x} ${p.y}`;
        for (let p of rightPoints) pathStr += ` L ${p.x} ${p.y}`;
        pathStr += " Z";

        geniePathEl.setAttribute('d', pathStr);
    }

    function runGenieAnimation(targetWin, isMinimizing, winRect, dockRect, callback) {
        const duration = 950; 
        const startTime = performance.now();
        const inner = targetWin.querySelector('.window-inner'); 
        targetWin.style.clipPath = "url(#genie-clip)";
        

        function animate(now) {
            let elapsed = now - startTime;
            let p = Math.min(elapsed / duration, 1);
            
            let easeProgress = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); 
            let currentProgress = isMinimizing ? easeProgress : (1 - easeProgress);

            updateGeniePath(currentProgress, winRect, dockRect);

            if (inner) {
                const W = winRect.width;
                const H = winRect.height;
                const targetX = (dockRect.left + dockRect.width / 2) - winRect.left;
                const targetY = dockRect.top - winRect.top;

                inner.style.transformOrigin = '50% 0%';

                if (currentProgress === 0) {
                    inner.style.transform = 'none';
                } else {
                    const tX = (targetX - (W / 2)) * Math.pow(currentProgress, 3.2);
                    const tY = targetY * Math.pow(currentProgress, 2.8);
                    
                    const contentArc = (targetX - (W / 2)) * 0.32 * Math.sin(currentProgress * Math.PI);
                    
                    const sX = 1 - Math.pow(currentProgress, 3);
                    const heightMask = H * (1 - currentProgress) + targetY * currentProgress - targetY * Math.pow(currentProgress, 3);
                    const sY = Math.max(0, heightMask / H);
                    
                    const skew = (targetX - (W / 2)) / H * currentProgress * 42;

                    inner.style.transform = `translate(${tX + contentArc}px, ${tY}px) scale(${sX}, ${sY}) skewX(${skew}deg)`;
                }
            }

            if (p < 1) {
                requestAnimationFrame(animate);
            } else {
                if (isMinimizing) {
                    targetWin.style.display = 'none';
                } else {
                    targetWin.style.clipPath = 'none'; 
                    if (inner) inner.style.transform = 'none'; 
                }
                isAnimatingGenie = false;
                if (callback) callback();
            }
        }
        requestAnimationFrame(animate);
    }

    
    const presWin = document.getElementById('draggableWindow');
    const presRedBtn = presWin ? presWin.querySelector('.light.red') : null;
    const presYellowBtn = presWin ? presWin.querySelector('.light.yellow') : null;

    if (presWin) {
        centerWindow(presWin);
    }

    function closeAndAddToDockPres(saveState) {
        if (!presWin || !dockContainer || isAnimatingGenie) return;

        if (saveState) {
            presentationStateSaved = {
                left: presWin.style.left,
                top: presWin.style.top,
                activeTab: presWin.querySelector('.sidebar-nav .nav-tab.active')?.getAttribute('data-target')
            };
        } else {
            presentationStateSaved = null;
            const cursusContent = document.getElementById('content-cursus');
            if (cursusContent) {
                cursusContent.scrollTop = 0;
            }
        }

        const existingApp = document.querySelector('.dock-app[data-title="Présentation"]');
        if (existingApp) {
            isAnimatingGenie = true;
            const winRect = presWin.getBoundingClientRect();
            const dockRect = existingApp.getBoundingClientRect();
            runGenieAnimation(presWin, true, winRect, dockRect, null);
            return;
        }

        isAnimatingGenie = true;
        const newDockApp = document.createElement('div');
        newDockApp.className = 'dock-app';
        newDockApp.setAttribute('data-title', 'Présentation');
        newDockApp.style.opacity = '0';
        newDockApp.style.transform = 'scale(0)';
        newDockApp.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

        const img = document.createElement('img');
        img.src = 'Presentation.png';
        img.alt = 'Présentation';
        img.className = 'dock-icon-img';

        newDockApp.appendChild(img);
        dockContainer.appendChild(newDockApp);

        const winRect = presWin.getBoundingClientRect();
        const dockRect = newDockApp.getBoundingClientRect();

        runGenieAnimation(presWin, true, winRect, dockRect, () => {
            newDockApp.style.opacity = '1';
            newDockApp.style.transform = 'scale(1)';
        });

        newDockApp.addEventListener('click', openPresentation);
    }

    function openPresentation() {
        if (!presWin || isAnimatingGenie) return;
        
        document.getElementById('draggableWindow').style.zIndex = "1000";
        const sw = document.getElementById('settingsWindow');
        if (sw) sw.style.zIndex = "100";

        if (presWin.style.display === 'block') return;

        presWin.style.display = 'block';
        focusManagedWindow(presWin);
        isAnimatingGenie = true;

        if (presentationStateSaved) {
            presWin.style.left = presentationStateSaved.left;
            presWin.style.top = presentationStateSaved.top;
            if (presentationStateSaved.activeTab) {
                const targetTab = presWin.querySelector(`.sidebar-nav .nav-tab[data-target="${presentationStateSaved.activeTab}"]`);
                if (targetTab) targetTab.click();
            }
        } else {
            centerWindow(presWin);
            const cursusContent = document.getElementById('content-cursus');
            if (cursusContent) {
                cursusContent.scrollTop = 0;
            }
            const defaultTab = presWin.querySelector('.sidebar-nav .nav-tab[data-target="content-identite"]');
            if (defaultTab) defaultTab.click();
        }

        const newWinRect = presWin.getBoundingClientRect();
        const dockApp = document.querySelector('.dock-app[data-title="Présentation"]');
        if (!dockApp) return;
        
        const currentDockRect = dockApp.getBoundingClientRect();

        
        dockApp.style.transform = 'scale(0)';
        dockApp.style.opacity = '0';
        setTimeout(() => { dockApp.remove(); }, 300);

        runGenieAnimation(presWin, false, newWinRect, currentDockRect, null);
    }

    if (presRedBtn) {
        presRedBtn.style.cursor = 'pointer';
        presRedBtn.addEventListener('click', () => closeAndAddToDockPres(false));
    }
    if (presYellowBtn) {
        presYellowBtn.style.cursor = 'pointer';
        presYellowBtn.addEventListener('click', () => closeAndAddToDockPres(true));
    }

    
    const settingsWin = document.getElementById('settingsWindow');
    const settingsDockApp = document.querySelector('.dock-app[data-title="Paramètres"]');
    const settingsRedBtn = settingsWin ? settingsWin.querySelector('.light.red') : null;
    const settingsYellowBtn = settingsWin ? settingsWin.querySelector('.light.yellow') : null;

    
    function closeAndAddToDockSettings(saveState) {
        if (!settingsWin || !settingsDockApp || isAnimatingGenie) return;

        if (saveState) {
            settingsStateSaved = {
                left: settingsWin.style.left,
                top: settingsWin.style.top
            };
        } else {
            settingsStateSaved = null;
        }

        
        settingsDockApp.style.display = ''; 
        settingsDockApp.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        settingsDockApp.style.transform = 'scale(0)';
        settingsDockApp.style.opacity = '0';

        isAnimatingGenie = true;
        const winRect = settingsWin.getBoundingClientRect();
        const dockRect = settingsDockApp.getBoundingClientRect();

        
        runGenieAnimation(settingsWin, true, winRect, dockRect, () => {
            settingsDockApp.style.transform = 'scale(1)';
            settingsDockApp.style.opacity = '1';
        });
    }

    
    function openSettings() {
        if (!settingsWin || !settingsDockApp || isAnimatingGenie) return;

        if (settingsWin.style.display === 'block') {
            document.getElementById('settingsWindow').style.zIndex = "1000";
            document.getElementById('draggableWindow').style.zIndex = "100";
            return;
        }

        settingsWin.style.display = 'block';
        focusManagedWindow(settingsWin);
        isAnimatingGenie = true;

        if (settingsStateSaved) {
            settingsWin.style.left = settingsStateSaved.left;
            settingsWin.style.top = settingsStateSaved.top;
        } else {
            centerWindow(settingsWin);
        }

        const newWinRect = settingsWin.getBoundingClientRect();
        const currentDockRect = settingsDockApp.getBoundingClientRect();

        
        settingsDockApp.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        settingsDockApp.style.transform = 'scale(0)';
        settingsDockApp.style.opacity = '0';
        setTimeout(() => { 
            if (settingsWin.style.display === 'block') {
                settingsDockApp.style.display = 'none'; 
            }
        }, 300);

        runGenieAnimation(settingsWin, false, newWinRect, currentDockRect, null);
    }
    if (settingsDockApp) {
        settingsDockApp.addEventListener('click', openSettings);
    }
    if (settingsRedBtn) {
        settingsRedBtn.style.cursor = 'pointer';
        settingsRedBtn.addEventListener('click', () => closeAndAddToDockSettings(false));
    }
    if (settingsYellowBtn) {
        settingsYellowBtn.style.cursor = 'pointer';
        settingsYellowBtn.addEventListener('click', () => closeAndAddToDockSettings(true));
    }

    


    // =====================================================
    // Code.app — faux VS Code interactif
    // =====================================================
    const codeWin = document.getElementById('codeWindow');
    const codeDockApp = document.getElementById('codeDockApp');
    const codeRedBtn = codeWin ? codeWin.querySelector('.light.red') : null;
    const codeYellowBtn = codeWin ? codeWin.querySelector('.light.yellow') : null;
    const codeTextarea = document.getElementById('code-textarea');
    const codeLineNumbers = document.getElementById('code-line-numbers');
    const codePreview = document.getElementById('code-preview');
    const codeConsole = document.getElementById('code-console-output');
    const codeTabTitle = document.getElementById('code-tab-title');
    const codeBreadcrumb = document.getElementById('code-breadcrumb-name');
    const codePreviewStatus = document.getElementById('code-preview-status');
    const codeRunBtn = document.getElementById('code-run-btn');
    const codeClearConsole = document.getElementById('code-clear-console');
    const codeFileButtons = document.querySelectorAll('.code-file');
    const codeOpenTabIcon = document.querySelector('.code-open-tab .code-file-icon');

    let codeStateSaved = null;
    let activeCodeFile = 'index.html';
    const codeFiles = {
        'index.html': `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mon projet</title>
</head>
<body>
  <main class="demo">
    <span class="eyebrow">Code.app</span>
    <h1>Bonjour</h1>
    <p>Écris ton HTML, CSS et JavaScript puis clique sur « Exécuter ».</p>
    <button onclick="saluer()">Tester le JavaScript</button>
  </main>
</body>
</html>`,
        'script.js': `function saluer() {
  console.log('JavaScript exécuté avec succès ✨');
  const title = document.querySelector('h1');
  if (title) title.textContent = 'Ça fonctionne !';
}`,
        'style.css': `.demo {
  font-family: Inter, system-ui, sans-serif;
  width: min(500px, 100%);
  max-width: 500px;
  margin: 0 auto;
  padding: 24px 26px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255,255,255,.92), rgba(229,233,239,.94));
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 20px 50px rgba(0,0,0,.07);
}
.eyebrow {
  color: #5f6875;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}
h1 {
  margin: 8px 0 7px;
  font-size: 34px;
  line-height: 1.05;
}
p {
  max-width: 420px;
  margin: 0 auto 16px;
  line-height: 1.45;
}
button {
  border: 0;
  border-radius: 12px;
  padding: 10px 14px;
  background: linear-gradient(180deg, #6f7680, #5d646e);
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(50,55,60,.16);
}`
    };

    function syncCodeLineNumbers() {
        if (!codeTextarea || !codeLineNumbers) return;
        const count = Math.max(1, codeTextarea.value.split('\n').length);
        codeLineNumbers.textContent = Array.from({length: count}, (_, i) => String(i + 1)).join('\n');
    }

    function syncCodeEditorScroll() {
        if (!codeTextarea || !codeLineNumbers) return;
        codeLineNumbers.scrollTop = codeTextarea.scrollTop;
    }

    function updateCodeTabVisuals() {
        const button = document.querySelector(`.code-file[data-file="${activeCodeFile}"]`);
        codeFileButtons.forEach(btn => btn.classList.toggle('active', btn === button));

        const iconMap = {
            'index.html': { cls: 'html', text: '</>' },
            'script.js': { cls: 'js', text: 'JS' },
            'style.css': { cls: 'css', text: '#' }
        };
        const icon = iconMap[activeCodeFile];
        if (codeOpenTabIcon && icon) {
            codeOpenTabIcon.className = `code-file-icon ${icon.cls}`;
            codeOpenTabIcon.textContent = icon.text;
        }
        if (codeTabTitle) codeTabTitle.textContent = activeCodeFile;
        if (codeBreadcrumb) codeBreadcrumb.textContent = activeCodeFile;
        if (codePreviewStatus) codePreviewStatus.textContent = activeCodeFile;
    }

    function loadCodeFile(fileName) {
        if (!codeTextarea || !codeFiles[fileName]) return;
        codeFiles[activeCodeFile] = codeTextarea.value;
        activeCodeFile = fileName;
        codeTextarea.value = codeFiles[activeCodeFile];
        updateCodeTabVisuals();
        syncCodeLineNumbers();
        codeTextarea.focus();
        codeTextarea.setSelectionRange(codeTextarea.value.length, codeTextarea.value.length);
    }

    function writeCodeConsole(message, type = 'log') {
        if (!codeConsole) return;
        const prefix = type === 'error' ? '✕ ' : '› ';
        const line = `${prefix}${message}`;
        codeConsole.textContent = codeConsole.textContent === 'Prêt à exécuter.'
            ? line
            : `${codeConsole.textContent}\n${line}`;
    }

    function renderCodePreview() {
        if (!codePreview) return;

        codeFiles[activeCodeFile] = codeTextarea ? codeTextarea.value : codeFiles[activeCodeFile];

        const html = codeFiles['index.html'];
        const cssText = codeFiles['style.css'];
        const jsText = codeFiles['script.js'];

        const previewChrome = `
<style id="portfolio-preview-chrome">
  :root { color-scheme: light; }
  html, body {
    width: 100% !important;
    height: 100% !important;
    min-height: 100% !important;
    margin: 0 !important;
    overflow: hidden !important;
    background: radial-gradient(circle at 50% 0%, rgba(255,255,255,.92) 0%, rgba(245,245,247,.96) 42%, rgba(225,232,241,.98) 100%) !important;
    color: #1d1d1f !important;
  }
  body {
    box-sizing: border-box !important;
    min-height: 100% !important;
    display: flex !important;
    align-items: flex-start !important;
    justify-content: center !important;
    padding: 18px 18px 12px !important;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif !important;
    text-align: center !important;
  }
  main, section, article { max-width: 100% !important; }
  *, *::before, *::after { box-sizing: border-box; }
  .demo {
    width: min(500px, 100%) !important;
    max-width: 500px !important;
    margin: 0 auto !important;
    padding: 24px 26px !important;
    border-radius: 22px !important;
    background: linear-gradient(145deg, rgba(255,255,255,.88), rgba(231,235,241,.90)) !important;
    border: 1px solid rgba(0,0,0,.07) !important;
    box-shadow: 0 16px 38px rgba(0,0,0,.07), inset 0 1px 0 rgba(255,255,255,.75) !important;
  }
  .demo h1 { margin: 8px 0 7px !important; font-size: 34px !important; line-height: 1.05 !important; }
  .demo p { margin: 0 auto 16px !important; max-width: 420px !important; font-size: 13px !important; line-height: 1.45 !important; }
  .demo button { margin-top: 4px !important; }
  button { background: linear-gradient(180deg, #6f7680, #5d646e) !important; color: #fff !important; box-shadow: 0 8px 18px rgba(50,55,60,.16) !important; }
</style>`;

        const bridgeScript = `
<script>
(() => {
  const originalLog = console.log;
  const originalError = console.error;
  function forward(type, args) {
    parent.postMessage({
      source: 'code-preview',
      type,
      message: args.map(value => {
        try { return typeof value === 'string' ? value : JSON.stringify(value); }
        catch { return String(value); }
      }).join(' ')
    }, '*');
  }
  console.log = (...args) => { originalLog(...args); forward('log', args); };
  console.error = (...args) => { originalError(...args); forward('error', args); };
})();
</script>`;

        const hasStyleTag = /<head[\s\S]*?<\/head>/i.test(html);
        const composedHtml = html
            .replace(/<\/head>/i, `<style>${cssText}</style>${previewChrome}${bridgeScript}</head>`)
            .replace(/<\/body>/i, `<script>${jsText}<\/script></body>`);

        codePreview.srcdoc = composedHtml;
        if (codeConsole) codeConsole.textContent = 'Aperçu rechargé.';
    }

    function runActiveCode() {
        if (!codeTextarea) return;
        codeFiles[activeCodeFile] = codeTextarea.value;

        if (activeCodeFile === 'style.css') {
            renderCodePreview();
            writeCodeConsole('CSS appliqué à l’aperçu.');
            return;
        }

        if (activeCodeFile === 'script.js') {
            renderCodePreview();
            writeCodeConsole('JavaScript rechargé dans l’aperçu.');
            return;
        }

        renderCodePreview();
    }

    codeFileButtons.forEach(button => {
        button.addEventListener('click', () => loadCodeFile(button.dataset.file));
    });

    if (codeTextarea) {
        codeTextarea.addEventListener('input', syncCodeLineNumbers);
        codeTextarea.addEventListener('scroll', syncCodeEditorScroll);
        codeTextarea.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                event.preventDefault();
                const start = codeTextarea.selectionStart;
                const end = codeTextarea.selectionEnd;
                codeTextarea.value =
                    codeTextarea.value.substring(0, start) +
                    '  ' +
                    codeTextarea.value.substring(end);
                codeTextarea.selectionStart = codeTextarea.selectionEnd = start + 2;
                syncCodeLineNumbers();
            }
        });
    }

    window.addEventListener('message', (event) => {
        if (!event.data || event.data.source !== 'code-preview') return;
        writeCodeConsole(event.data.message || '', event.data.type || 'log');
    });

    if (codeRunBtn) codeRunBtn.addEventListener('click', runActiveCode);
    if (codeClearConsole) {
        codeClearConsole.addEventListener('click', () => {
            if (codeConsole) codeConsole.textContent = 'Console effacée.';
        });
    }

    if (codeDockApp) {
        codeDockApp.addEventListener('click', openCodeWindow);
    }

    function closeAndAddToDockCode(saveState) {
        if (!codeWin || !codeDockApp || isAnimatingGenie) return;

        if (saveState) {
            codeStateSaved = {
                left: codeWin.style.left,
                top: codeWin.style.top,
                activeFile: activeCodeFile
            };
        } else {
            codeStateSaved = null;
        }

        codeDockApp.style.display = '';
        codeDockApp.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        codeDockApp.style.transform = 'scale(0)';
        codeDockApp.style.opacity = '0';

        isAnimatingGenie = true;
        const winRect = codeWin.getBoundingClientRect();
        const dockRect = codeDockApp.getBoundingClientRect();

        runGenieAnimation(codeWin, true, winRect, dockRect, () => {
            codeDockApp.style.transform = 'scale(1)';
            codeDockApp.style.opacity = '1';
            if (codeStateSaved && codeStateSaved.activeFile) {
                activeCodeFile = codeStateSaved.activeFile;
            }
        });
    }

    function openCodeWindow() {
        if (!codeWin || !codeDockApp || isAnimatingGenie) return;

        if (codeWin.style.display === 'block') {
            focusManagedWindow(codeWin);
            return;
        }

        // Affichage + focus dans la même frame : Code est immédiatement au premier plan.
        codeWin.style.display = 'block';
        focusManagedWindow(codeWin);
        isAnimatingGenie = true;

        if (codeStateSaved) {
            codeWin.style.left = codeStateSaved.left;
            codeWin.style.top = codeStateSaved.top;
            if (codeStateSaved.activeFile) loadCodeFile(codeStateSaved.activeFile);
        } else {
            centerWindow(codeWin);
            loadCodeFile('index.html');
        }

        const newWinRect = codeWin.getBoundingClientRect();
        const currentDockRect = codeDockApp.getBoundingClientRect();

        codeDockApp.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        codeDockApp.style.transform = 'scale(0)';
        codeDockApp.style.opacity = '0';
        setTimeout(() => {
            if (codeWin.style.display === 'block') codeDockApp.style.display = 'none';
        }, 300);

        runGenieAnimation(codeWin, false, newWinRect, currentDockRect, null);
    }

    if (codeRedBtn) {
        codeRedBtn.style.cursor = 'pointer';
        codeRedBtn.addEventListener('click', () => closeAndAddToDockCode(false));
    }

    if (codeYellowBtn) {
        codeYellowBtn.style.cursor = 'pointer';
        codeYellowBtn.addEventListener('click', () => closeAndAddToDockCode(true));
    }

    if (codeTextarea) {
        codeTextarea.value = codeFiles['index.html'];
        syncCodeLineNumbers();
        updateCodeTabVisuals();
        renderCodePreview();
    }


    // =====================================================
    // Faux lecteur PDF — lecteur local
    // =====================================================
    const cvDesktopFile = document.getElementById('cvDesktopFile');
    const pdfViewerWindow = document.getElementById('pdfViewerWindow');
    const pdfStatusText = document.getElementById('pdfStatusText');
    const pdfRedBtn = document.getElementById('pdfRedBtn');
    const pdfYellowBtn = document.getElementById('pdfYellowBtn');
    const pdfOpenNativeBtn = document.getElementById('pdfOpenNativeBtn');
    const pdfNativeFrame = document.getElementById('pdfNativeFrame');
    const pdfViewerMessage = document.getElementById('pdfViewerMessage');
    const pdfViewerMessageTitle = document.getElementById('pdfViewerMessageTitle');
    const pdfViewerMessageText = document.getElementById('pdfViewerMessageText');

    const PDF_FILE_URL = 'CV_ANGA_AYMANE.pdf';

    function setPdfStatus(message) {
        if (pdfStatusText) pdfStatusText.textContent = message;
    }

    function showPdfMessage(title, text) {
        if (!pdfViewerMessage) return;
        if (pdfViewerMessageTitle) pdfViewerMessageTitle.textContent = title;
        if (pdfViewerMessageText) pdfViewerMessageText.textContent = text || '';
        pdfViewerMessage.style.display = 'flex';
    }

    function hidePdfMessage() {
        if (pdfViewerMessage) pdfViewerMessage.style.display = 'none';
    }

    function showPdfViewer() {
        if (!pdfViewerWindow) return;

        pdfViewerWindow.style.display = 'block';
        focusManagedWindow(pdfViewerWindow);

        if (!pdfViewerWindow.dataset.hasBeenPositioned) {
            centerWindow(pdfViewerWindow);
            pdfViewerWindow.dataset.hasBeenPositioned = 'true';
        }

        hidePdfMessage();
        setPdfStatus('Document prêt');
    }

    function hidePdfViewer() {
        if (!pdfViewerWindow) return;
        pdfViewerWindow.style.display = 'none';
    }

    if (pdfNativeFrame) {
        pdfNativeFrame.addEventListener('load', () => {
            hidePdfMessage();
            setPdfStatus('Document prêt');
        });
        pdfNativeFrame.addEventListener('error', () => {
            showPdfMessage('Aperçu indisponible', 'Le fichier CV_ANGA_AYMANE.pdf doit se trouver dans le même dossier que portfolio.html.');
            setPdfStatus('Aperçu indisponible');
        });
    }

    if (cvDesktopFile) {
        cvDesktopFile.style.cursor = 'pointer';
        cvDesktopFile.addEventListener('click', showPdfViewer);
        cvDesktopFile.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                showPdfViewer();
            }
        });
    }

    if (pdfRedBtn) {
        pdfRedBtn.style.cursor = 'pointer';
        pdfRedBtn.addEventListener('click', hidePdfViewer);
    }

    if (pdfYellowBtn) {
        pdfYellowBtn.style.cursor = 'pointer';
        pdfYellowBtn.addEventListener('click', hidePdfViewer);
    }

    if (pdfOpenNativeBtn) {
        pdfOpenNativeBtn.addEventListener('click', () => {
            window.open(PDF_FILE_URL, '_blank', 'noopener,noreferrer');
        });
    }

    const colorOptions = document.querySelectorAll('.color-option-item');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedTheme = option.getAttribute('data-theme');
            
            colorOptions.forEach(opt => {
                const preview = opt.querySelector('.color-preview');
                const label = opt.querySelector('span');
                if (preview) preview.classList.remove('active');
                if (label) {
                    label.classList.remove('label-active');
                    label.style.fontWeight = '500';
                    label.style.color = 'var(--text-muted)';
                }
            });
            
            const currentPreview = option.querySelector('.color-preview');
            const currentLabel = option.querySelector('span');
            if (currentPreview) currentPreview.classList.add('active');
            if (currentLabel) {
                currentLabel.classList.add('label-active');
                currentLabel.style.fontWeight = '600';
                currentLabel.style.color = 'var(--text-main)';
            }
            
            if (ambientBg) {
                ambientBg.classList.remove('theme-red', 'theme-orange', 'theme-green', 'theme-blue');
                if (selectedTheme !== 'default') {
                    ambientBg.classList.add(`theme-${selectedTheme}`);
                }
            }
        });
    });


    
    const toggleLiquid = document.getElementById('toggle-liquid');
    if (toggleLiquid) {
        toggleLiquid.addEventListener('change', () => {
            if (toggleLiquid.checked) {
                if (ambientBg) ambientBg.classList.add('liquid-enabled');
            } else {
                if (ambientBg) ambientBg.classList.remove('liquid-enabled');
            }
        });
    }
    
    
});

