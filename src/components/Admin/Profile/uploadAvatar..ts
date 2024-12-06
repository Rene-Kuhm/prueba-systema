import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '@/lib/firebase'; // Adjust the import based on your project structure

export const uploadAvatar = async (file: File): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, `avatars/${auth.currentUser?.uid}/${file.name}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
};