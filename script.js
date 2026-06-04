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
            
            
            document.getElementById('draggableWindow').style.zIndex = "100";
            const sw = document.getElementById('settingsWindow');
            if (sw) sw.style.zIndex = "100";
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

        isAnimatingGenie = true;
        presWin.style.display = 'block';

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

        isAnimatingGenie = true;
        settingsWin.style.display = 'block';

        document.getElementById('settingsWindow').style.zIndex = "1000";
        document.getElementById('draggableWindow').style.zIndex = "100";

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