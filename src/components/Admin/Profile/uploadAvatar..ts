import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "@/lib/firebase";

async function uploadAvatar(file: File): Promise<string | null> {
    if (!auth.currentUser) return null;

    const storage = getStorage();
    const storageRef = ref(storage);
    const avatarRef = ref(storageRef, `avatars/${auth.currentUser.uid}/avatar.jpg`);

    try {
        await uploadBytes(avatarRef, file);
        return await getDownloadURL(avatarRef);
    } catch (error) {
        console.error("Error uploading avatar:", error);
        return null;
    }
}

export default uploadAvatar;