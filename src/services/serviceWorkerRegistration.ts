export const registerServiceWorker = async () => {
  // Solo registrar en producción a menos que se fuerce explícitamente
  if (process.env.NODE_ENV !== 'production' && !import.meta.env.VITE_FORCE_SW) {
    ;('Service Worker disabled in development')
    return
  }

  try {
    if ('serviceWorker' in navigator) {
      // Desregistrar SWs existentes
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations.map((registration) => registration.unregister()),
      )

      // Registrar nuevo SW
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        {
          scope: '/',
          type: 'classic',
        },
      )

      'Service Worker registered:', window.location.origin, registration.scope
    }
  } catch (error) {
    console.error('Service Worker registration failed:', error)
  }
}
