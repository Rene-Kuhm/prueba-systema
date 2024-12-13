import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Claim, Technician } from '@/lib/types/admin';

interface ClaimDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    claim: Claim | null;
    technicians?: Technician[];
}

export default function ClaimDetailsModal({
    isOpen,
    onClose,
    claim,
    technicians = []
}: ClaimDetailsModalProps) {
    // Función para obtener el nombre del técnico
    const getTechnicianName = () => {
        if (!claim?.technicianId) return 'No asignado';
        const technician = technicians.find(tech => tech.id === claim.technicianId);
        return technician ? technician.name : 'Técnico no encontrado';
    };

    // Función para obtener el estado en español
    const getStatusText = (status?: string) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'assigned': return 'Asignado';
            case 'in_progress': return 'En progreso';
            case 'completed': return 'Completado';
            default: return 'Desconocido';
        }
    };

    return (
        <Transition.Root show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-lg px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div>
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                                        >
                                            Detalles del Reclamo
                                        </Dialog.Title>
                                        <div className="mt-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                        Cliente
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={claim?.name || 'No especificado'}
                                                        readOnly
                                                        className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                        Teléfono
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={claim?.phone || 'No especificado'}
                                                        readOnly
                                                        className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                        Dirección
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={claim?.address || 'No especificada'}
                                                        readOnly
                                                        className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                        Estado
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={getStatusText(claim?.status)}
                                                        readOnly
                                                        className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                        Técnico Asignado
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={getTechnicianName()}
                                                        readOnly
                                                        className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                        Motivo del Reclamo
                                                    </label>
                                                    <textarea
                                                        value={claim?.reason || 'No especificado'}
                                                        readOnly
                                                        className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                                        rows={3}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                        Resolución
                                                    </label>
                                                    <textarea
                                                        value={claim?.resolution || 'No resuelto'}
                                                        readOnly
                                                        className="block w-full mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm dark:bg-blue-500 dark:hover:bg-blue-600"
                                        onClick={onClose}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}