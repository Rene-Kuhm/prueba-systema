// componentes para el contenedor de la página de administración

export const AdminContainer = ({ children }: { children: React.ReactNode }) => (
    <main className='min-h-screen bg-gray-100 dark:bg-gray-900'>
        {children}
    </main>
)

export const AdminContent = ({ children }: { children: React.ReactNode }) => (
    <div className='px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        {children}
    </div>
)

export const LoadingState = () => (
    <div className='text-center'>Cargando datos...</div>
)

export const ErrorState = ({ message }: { message: string }) => (
    <div className='text-center text-red-500'>Error: {message}</div>
)