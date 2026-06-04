document.addEventListener('DOMContentLoaded', () => {

    const ambientBg = document.getElementById('ambient-bg');


    const configTooltips = () => {
        document.querySelectorAll('.dock-app').forEach(app => {
            if (app.hasAttribute('title')) {
                app.setAttribute('data-title', app.getAttribute('title'));
                app.removeAttribute('title'); 
            }
        });
    };
    configTooltips();

    

    
    function updateClock() {
        const clock = document.getElementById('clock');
        if (clock) {
            clock.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    

    const waveDisplacement = document.getElementById('wave-displacement');

    let targetScale = 0; 
    let currentScale = 0; 
    let waveTime = 0; 

    document.addEventListener('mousemove', (e) => {

        if (!ambientBg || !ambientBg.classList.contains('liquid-enabled')) {
        if (ambientBg) ambientBg.style.background = ''; 
        return;
    }
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

    

    
    
    

    
    
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
        const shine = card.querySelector('.card-shine');
        const cardInner = card.querySelector('.card-inner');
        const viewProjectBtn = card.querySelector('.project-link');
        const backBtn = card.querySelector('.details-back-btn');

        
        
        if (viewProjectBtn && cardInner) {
            viewProjectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                
                const spatialContainer = document.querySelector('.spatial-container');
                
                
                card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                
                
                if (spatialContainer) {
                    spatialContainer.classList.add('landscape-mode');
                }
                
                
                cardInner.classList.add('show-details');
            });
        }

        
        if (backBtn && cardInner) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const spatialContainer = document.querySelector('.spatial-container');
                
                
                if (spatialContainer) {
                    spatialContainer.classList.remove('landscape-mode');
                }
                
                
                cardInner.classList.remove('show-details');
            });
        }
        
        
        card.addEventListener('mousemove', (e) => {
            
            if (cardInner && cardInner.classList.contains('show-details')) {
                if (shine) shine.style.opacity = '0';
                return;
            }
            if (shine) shine.style.opacity = '1';

            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            const maxTilt = 12; 
            const rotateX = (-y * maxTilt).toFixed(2);
            const rotateY = (x * maxTilt).toFixed(2);
            
            card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
if (shine) {
    
}

            const layers = card.querySelectorAll('.layer');
            layers.forEach(layer => {
                const depthMatch = layer.getAttribute('style')?.match(/--depth:\s*(\d+)px/);
                if (depthMatch) {
                    const zValue = depthMatch[1];
                    const moveX = (x * (zValue / 3)).toFixed(1);
                    const moveY = (y * (zValue / 3)).toFixed(1);
                    layer.style.transform = `translate3d(${moveX}px, ${moveY}px, ${zValue}px)`;
                }
            });
        });

        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            
            const layers = card.querySelectorAll('.layer');
            layers.forEach(layer => {
                const depthMatch = layer.getAttribute('style')?.match(/--depth:\s*(\d+)px/);
                const zValue = depthMatch ? depthMatch[1] : 0;
                layer.style.transform = `translate3d(0px, 0px, ${zValue}px)`;
            });
        });
    });

    
    
    const deckSlots = document.querySelectorAll('.deck-slot');
    const prevBtn = document.getElementById('deck-prev');
    const nextBtn = document.getElementById('deck-next');
    let currentActiveIndex = 0;

    function updateDeckState() {
        deckSlots.forEach((slot) => {
            const slotIndex = parseInt(slot.getAttribute('data-index'), 10);
            const diff = slotIndex - currentActiveIndex;
            
            slot.classList.remove('far-left', 'left', 'active', 'right', 'far-right');
            
            if (diff === 0) {
                slot.classList.add('active');
            } else if (diff === -1) {
                slot.classList.add('left');
            } else if (diff === 1) {
                slot.classList.add('right');
            } else if (diff < -1) {
                slot.classList.add('far-left');
            } else if (diff > 1) {
                slot.classList.add('far-right');
            }
        });

        
        if (prevBtn) {
            if (currentActiveIndex === 0) {
                prevBtn.style.opacity = '0';
                prevBtn.style.pointerEvents = 'none';
            } else {
                prevBtn.style.opacity = '1';
                prevBtn.style.pointerEvents = 'auto';
            }
        }

        if (nextBtn) {
            if (currentActiveIndex === deckSlots.length - 1) {
                nextBtn.style.opacity = '0';
                nextBtn.style.pointerEvents = 'none';
            } else {
                nextBtn.style.opacity = '1';
                nextBtn.style.pointerEvents = 'auto';
            }
        }
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentActiveIndex > 0) {
                currentActiveIndex--;
                updateDeckState();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentActiveIndex < deckSlots.length - 1) {
                currentActiveIndex++;
                updateDeckState();
            }
        });
    }

    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            if (currentActiveIndex > 0) {
                currentActiveIndex--;
                updateDeckState();
            }
        } else if (e.key === 'ArrowRight') {
            if (currentActiveIndex < deckSlots.length - 1) {
                currentActiveIndex++;
                updateDeckState();
            }
        }
    });

    deckSlots.forEach((slot) => {
        slot.addEventListener('click', function(e) {
            if (!this.classList.contains('active')) {
                e.preventDefault();
                currentActiveIndex = parseInt(this.getAttribute('data-index'), 10);
                updateDeckState();
            }
        });
    });

    
    updateDeckState();

    
const toggleDetails = (slot) => {
    const card = slot.querySelector('.project-card');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        
        card.classList.remove('flipped');
        
        card.classList.toggle('mobile-details-active');
    } else {
        
        card.classList.toggle('flipped');
    }
};


window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.project-card').forEach(card => {
            card.classList.remove('flipped');
        });
    }
});

    
    
});