export const registerServiceWorker = async () => {
    if (process.env.NODE_ENV !== 'production' && !import.meta.env.VITE_ENABLE_SW) {
        console.log('Service Worker disabled in development');
        return;
    }

    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(registration => registration.unregister()));

            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/',
                type: 'classic'
            });

            if (registration.active) {
                console.log('Service Worker already active');
            } else {
                registration.addEventListener('activate', () => {
                    console.log('Service Worker activated');
                });
            }
        }
    } catch (error) {
        console.error('Service Worker registration failed:', error);
    }
};