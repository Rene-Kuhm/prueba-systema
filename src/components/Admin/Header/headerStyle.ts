// styles/headerStyles.ts

export const headerStyles = {
    // Contenedor principal
    container: "p-6 mb-6 slate-800 rounded-lg shadow-md",
    
    // Contenedor del contenido
    content: "flex items-center justify-between p-4 bg-gradient-to-r from-slate-800 to-slate-600 rounded-lg",
    
    // Título
    title: "text-2xl font-bold text-white",
    
    // Contenedor de botones
    buttonContainer: "flex gap-3",
    
    // Estilos base para botones
    buttonBase: "flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow " +
                "transition-all duration-300 ease-in-out " +
                "hover:scale-105 hover:shadow-lg " +
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
    
    // Estilos específicos para el botón de exportar
    exportButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    
    // Estilos específicos para el botón de cerrar sesión
    signOutButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    
    // Estilos para los íconos SVG
    icon: "w-5 h-5"
};