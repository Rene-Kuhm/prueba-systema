// Componente para mostrar a los usuarios pendientes de aprobación

interface PendingUser {
    id: string
    email: string
    fullName: string
    role: string
    createdAt: string
}

interface PendingUsersProps {
    users: PendingUser[]
    onApprove: (userId: string) => void
}

export const PendingUsers = ({ users, onApprove }: PendingUsersProps) => {
    return (
        <div className='p-6 mb-8 bg-white rounded-lg shadow-sm dark:bg-gray-800'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Usuarios Pendientes
            </h2>
            {users.length === 0 ? (
                <p>No hay usuarios pendientes de aprobación.</p>
            ) : (
                <ul className='mt-4 space-y-4'>
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className='flex justify-between p-4 bg-gray-100 rounded-md dark:bg-gray-700'
                        >
                            <span>
                                {user.fullName} ({user.email})
                            </span>
                            <button
                                onClick={() => onApprove(user.id)}
                                className='px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700'
                            >
                                Aprobar
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
