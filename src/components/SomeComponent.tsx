import { FC, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleReclamo } from '@/reclamoHandler';

const SomeComponent: FC = () => {
    const [technicians, setTechnicians] = useState<Array<{ id: string, name: string, phone: string }>>([]);

    useEffect(() => {
        const fetchTechnicians = async () => {
            const techSnapshot = await getDocs(collection(db, 'technicians'));
            const techList = techSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as { id: string, name: string, phone: string }));
            setTechnicians(techList);
        };
        fetchTechnicians();
    }, []);

    const cargarReclamo = () => {
        const nuevoReclamo = {
            id: '1',
            description: 'Descripción del reclamo',
            technicianId: technicians[0]?.id,
            technicians
        };
        handleReclamo(nuevoReclamo);
    };

    return (
        <div>
            <select className="form-select mb-4">
                {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                        {tech.name} - {tech.phone}
                    </option>
                ))}
            </select>
            <button onClick={cargarReclamo}>Cargar Reclamo</button>
        </div>
    );
};

export default SomeComponent;