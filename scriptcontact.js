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
    



    
    

    
    const monolith = document.getElementById('contactMonolith');

    if (monolith) {
        document.addEventListener('mousemove', (e) => {
            
            const hasActiveInput = monolith.contains(document.activeElement);
            if (hasActiveInput) {
                monolith.style.transform = `rotateX(0deg) rotateY(0deg)`;
                return;
            }

            const width = window.innerWidth;
            const height = window.innerHeight;

            
            const normX = (e.clientX / width) - 0.5;
            const normY = (e.clientY / height) - 0.5;

            
            const angleY = (normX * 13).toFixed(2);
            const angleX = (-normY * 13).toFixed(2);

            monolith.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;

            
            const rect = monolith.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const relativeY = e.clientY - rect.top;

            monolith.style.setProperty('--mono-x', `${relativeX}px`);
            monolith.style.setProperty('--mono-y', `${relativeY}px`);
        });

        
        document.addEventListener('mouseleave', () => {
            monolith.style.transform = `rotateX(0deg) rotateY(0deg) `;
        });
    }
    
    
    
    

    
    
    
});