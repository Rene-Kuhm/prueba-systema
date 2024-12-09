import  { FC } from 'react';
import { handleReclamo } from '@/reclamoHandler';

const SomeComponent: FC = () => {
    const cargarReclamo = () => {
        const nuevoReclamo = {
            id: '1',
            description: 'Descripción del reclamo',
            // ...otras propiedades...
        };
        handleReclamo(nuevoReclamo);
    };

    return (
        <div>
            <button onClick={cargarReclamo}>Cargar Reclamo</button>
        </div>
    );
};

export default SomeComponent;
