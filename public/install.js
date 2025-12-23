// Simple PWA Install Prompt
let installPrompt = null;

// Listen for install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  
  // Show install button after 10 seconds
  setTimeout(showInstallButton, 10000);
});

// Create install button
function showInstallButton() {
  if (!installPrompt) return;
  
  const installBtn = document.createElement('button');
  installBtn.textContent = 'Install App';
  installBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1a73e8;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    font-weight: bold;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  
  installBtn.onclick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      installBtn.remove();
    }
    installPrompt = null;
  };
  
  document.body.appendChild(installBtn);
  
  // Auto-remove after 30 seconds
  setTimeout(() => installBtn.remove(), 30000);
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(err => console.log('Service Worker failed:', err));
  });
}

// Check if running as PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('PWA installed and running');
  document.documentElement.classList.add('pwa-installed');
}
