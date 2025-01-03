import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';

let cachedTechnicians: Technician[] | null = null;

export interface Technician {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    active: boolean;
    approved: boolean;
    availableForAssignment: boolean;
    completedAssignments: number;
    currentAssignments: number;
    totalAssignments: number;
    rating: number;
    ratingCount: number;
    role: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    lastLogin: string;
}

export const fetchTechnicians = async (): Promise<Technician[]> => {
  if (cachedTechnicians) {
    return cachedTechnicians;
  }

  try {
    const techniciansRef = collection(db, 'technicians');
    const snapshot = await getDocs(techniciansRef);
    
    if (snapshot.empty) {
      return [];
    }

    cachedTechnicians = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Technician));

    return cachedTechnicians;
  } catch (error) {
    throw new Error(`Failed to fetch technicians: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
