# Proyecto de Gestión de Reclamos

## 📋 Descripción
Este proyecto es una aplicación web moderna para la gestión de reclamos, diseñada para facilitar la interacción entre administradores, técnicos y usuarios. Utiliza tecnologías de vanguardia para proporcionar una experiencia fluida y eficiente en el manejo de reclamos y la comunicación con los clientes.

## 🚀 Características principales
- Panel de administración robusto
- Interfaz para técnicos
- Sistema de autenticación y autorización
- Gestión de reclamos en tiempo real
- Notificaciones push
- Integración con WhatsApp para comunicación con clientes
- Perfiles de usuario personalizables
- Estadísticas y paneles de control interactivos

## 🛠 Tecnologías utilizadas
- **Frontend**: React con TypeScript
- **Bundler**: Vite
- **Estilos**: CSS-in-JS y CSS modules
- **Backend**: Firebase (Autenticación y Base de datos en tiempo real)
- **Notificaciones**: OneSignal
- **Comunicación**: API de WhatsApp

## 🏗 Estructura del proyecto
```
src/
|-- api/
|-- components/
|   |-- Admin/
|   |-- Login/
|   |-- Protected/
|   |-- Signup/
|   |-- Technician/
|   `-- ui/
|-- functions/
|-- hooks/
|-- lib/
|-- pages/
|-- services/
|-- stores/
|-- styles/
`-- utils/
```

### Componentes principales
- **Admin**: Incluye todos los componentes necesarios para el panel de administración.
- **Technician**: Contiene la interfaz específica para los técnicos.
- **ui**: Biblioteca de componentes UI reutilizables.

### Características destacadas
- **ClaimForm**: Permite a los usuarios enviar reclamos de manera eficiente.
- **ClaimTable**: Muestra y gestiona los reclamos existentes.
- **DashboardCard**: Proporciona una visión general rápida de las estadísticas clave.
- **Notifications**: Sistema de notificaciones en tiempo real.

## 🔒 Seguridad
- Rutas protegidas para acceso autorizado
- Manejo seguro de autenticación con Firebase
- Validación de entrada de usuario

## 📱 Responsividad
La aplicación está diseñada para ser totalmente responsiva, garantizando una experiencia de usuario óptima en dispositivos móviles, tablets y desktops.

## 🔄 Estado global
Utiliza un sistema de gestión de estado (probablemente Redux o Context API) para manejar el estado de la aplicación de manera eficiente.

## 📨 Comunicación con clientes
Integración con WhatsApp para una comunicación rápida y efectiva con los clientes, mejorando la satisfacción y la resolución de problemas.

## 🚀 Cómo empezar
1. Clona el repositorio
2. Instala las dependencias con `npm install`
3. Configura las variables de entorno necesarias
4. Ejecuta el proyecto en modo desarrollo con `npm run dev`

## 🤝 Contribuciones
Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios mayores antes de crear un pull request.

## 📄 Licencia
Este software es propietario y está protegido por derechos de autor. Su uso, distribución y modificación están estrictamente limitados por los términos de nuestra licencia privativa.

---

Desarrollado con ❤️ por [René kuhm para/Cospec LTDA]