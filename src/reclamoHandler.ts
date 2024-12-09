import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: applicationDefault(),
  projectId: 'VITE_FIREBASE_PROJECT_ID',
});

interface Reclamo {
  id: string;
  description: string;
  technicianId: string;
  // ...otras propiedades...
}

export async function handleReclamo(reclamo: Reclamo) {
  // Lógica para cargar el reclamo
  // Obtener el token del dispositivo del usuario desde Firebase
  const userToken = await getUserDeviceToken(reclamo.technicianId);

  if (!userToken) {
    console.log('No se encontró el token del dispositivo para el técnico:', reclamo.technicianId);
    return;
  }

  // Enviar notificación
  const message = {
    notification: {
      title: 'Nuevo Reclamo',
      body: `Se ha cargado un nuevo reclamo: ${reclamo.description}`,
    },
    token: userToken, // Reemplaza con el token del dispositivo del usuario
  };

  getMessaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}
async function getUserDeviceToken(technicianId: string): Promise<string | null> {
  const db = getFirestore();
  const technicianDoc = await db.collection('technicians').doc(technicianId).get();

  if (!technicianDoc.exists) {
    console.log('No se encontró el técnico con ID:', technicianId);
    return null;
  }

  const technicianData = technicianDoc.data();
  return technicianData?.deviceToken || null;
}

