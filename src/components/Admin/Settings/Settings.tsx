import React, { useState, useEffect } from 'react';
import { doc, updateDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '@/components/Admin/Settings/Settings.css';

export const Settings: React.FC = () => {
    const [newAdminName, setNewAdminName] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [newAdminAvatar, setNewAdminAvatar] = useState<File | null>(null);
    const [newTechnicianName, setNewTechnicianName] = useState('');
    const [newTechnicianEmail, setNewTechnicianEmail] = useState('');
    const [newTechnicianPassword, setNewTechnicianPassword] = useState('');
    const [newTechnicianAvatar, setNewTechnicianAvatar] = useState<File | null>(null);
    const [admins, setAdmins] = useState<{ id: string; name: string; email: string; avatar: string }[]>([]);
    const [technicians, setTechnicians] = useState<{ id: string; name: string; email: string; avatar: string }[]>([]);

    useEffect(() => {
        const fetchAdminsAndTechnicians = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const adminsAndTechnicians: { id: string; name: string; email: string; avatar: string; role: string }[] = [];
                usersSnapshot.forEach((doc) => {
                    const user = doc.data();
                    if (user.role === 'admin' || user.role === 'technician') {
                        adminsAndTechnicians.push({
                            id: doc.id,
                            name: user.fullName,
                            email: user.email,
                            avatar: user.avatar,
                            role: user.role,
                        });
                    }
                });
                setAdmins(adminsAndTechnicians.filter((user) => user.role === 'admin'));
                setTechnicians(adminsAndTechnicians.filter((user) => user.role === 'technician'));
            } catch (error) {
                console.error('Error fetching admins and technicians:', error);
            }
        };
        fetchAdminsAndTechnicians();
    }, []);

    const handleAddAdmin = async () => {
        if (newAdminName.trim() !== '' && newAdminEmail.trim() !== '' && newAdminPassword.trim() !== '') {
            try {
                const auth = getAuth();
                const userCredential = await createUserWithEmailAndPassword(auth, newAdminEmail, newAdminPassword);
                const avatarUrl = newAdminAvatar ? await uploadAdminAvatar(newAdminAvatar, userCredential.user.uid) : '';
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    fullName: newAdminName,
                    email: newAdminEmail,
                    role: 'admin',
                    avatar: avatarUrl,
                });
                setAdmins([...admins, { id: userCredential.user.uid, name: newAdminName, email: newAdminEmail, avatar: avatarUrl }]);
                setNewAdminName('');
                setNewAdminEmail('');
                setNewAdminPassword('');
                setNewAdminAvatar(null);
            } catch (error) {
                console.error('Error adding admin:', error);
            }
        }
    };

    const handleAddTechnician = async () => {
        if (newTechnicianName.trim() !== '' && newTechnicianEmail.trim() !== '' && newTechnicianPassword.trim() !== '') {
            try {
                const auth = getAuth();
                const userCredential = await createUserWithEmailAndPassword(auth, newTechnicianEmail, newTechnicianPassword);
                const avatarUrl = newTechnicianAvatar ? await uploadTechnicianAvatar(newTechnicianAvatar, userCredential.user.uid) : '';
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    fullName: newTechnicianName,
                    email: newTechnicianEmail,
                    role: 'technician',
                    avatar: avatarUrl,
                });
                setTechnicians([...technicians, { id: userCredential.user.uid, name: newTechnicianName, email: newTechnicianEmail, avatar: avatarUrl }]);
                setNewTechnicianName('');
                setNewTechnicianEmail('');
                setNewTechnicianPassword('');
                setNewTechnicianAvatar(null);
            } catch (error) {
                console.error('Error adding technician:', error);
            }
        }
    };

    const handleUpdateAdmin = async (id: string, newName: string, newEmail: string, newPassword: string, newAvatar: File | null) => {
        try {
            let avatarUrl = '';
            if (newAvatar) {
                avatarUrl = await uploadAdminAvatar(newAvatar, id);
            } else {
                avatarUrl = admins.find((admin) => admin.id === id)?.avatar || '';
            }
            await updateDoc(doc(db, 'users', id), {
                fullName: newName,
                email: newEmail,
                avatar: avatarUrl,
            });
            if (newPassword.trim() !== '') {
                const auth = getAuth();
                const user = auth.currentUser;
                if (user && user.uid === id) {
                    await updatePassword(user, newPassword);
                }
            }
            setAdmins(
                admins.map((admin) =>
                    admin.id === id ? { id, name: newName, email: newEmail, avatar: avatarUrl } : admin
                )
            );
        } catch (error) {
            console.error('Error updating admin:', error);
        }
    };

    const handleUpdateTechnician = async (id: string, newName: string, newEmail: string, newPassword: string, newAvatar: File | null) => {
        try {
            let avatarUrl = '';
            if (newAvatar) {
                avatarUrl = await uploadTechnicianAvatar(newAvatar, id);
            } else {
                avatarUrl = technicians.find((technician) => technician.id === id)?.avatar || '';
            }
            await updateDoc(doc(db, 'users', id), {
                fullName: newName,
                email: newEmail,
                avatar: avatarUrl,
            });
            if (newPassword.trim() !== '') {
                const auth = getAuth();
                const user = auth.currentUser;
                if (user && user.uid === id) {
                    await updatePassword(user, newPassword);
                }
            }
            setTechnicians(
                technicians.map((technician) =>
                    technician.id === id ? { id, name: newName, email: newEmail, avatar: avatarUrl } : technician
                )
            );
        } catch (error) {
            console.error('Error updating technician:', error);
        }
    };

    const handleDeleteAdmin = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'users', id));
            setAdmins(admins.filter((admin) => admin.id !== id));
        } catch (error) {
            console.error('Error deleting admin:', error);
        }
    };

    const handleDeleteTechnician = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'users', id));
            setTechnicians(technicians.filter((technician) => technician.id !== id));
        } catch (error) {
            console.error('Error deleting technician:', error);
        }
    };

    const uploadAdminAvatar = async (file: File, userId: string) => {
        const storageRef = ref(storage, `avatars/admins/${userId}/avatar.jpg`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const uploadTechnicianAvatar = async (file: File, userId: string) => {
        const storageRef = ref(storage, `avatars/technicians/${userId}/avatar.jpg`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    return (
        <div className="admin-settings-container">
            <h2 className="settings-title">Settings</h2>
            <div className="settings-content">
                <div className="admins-section">
                    <h3>Admins</h3>
                    <div className="admin-list">
                        {admins.map((admin) => (
                            <div key={admin.id} className="admin-item">
                                <input
                                    type="text"
                                    value={admin.name}
                                    onChange={(e) => handleUpdateAdmin(admin.id, e.target.value, admin.email, '', null)}
                                />
                                <input
                                    type="email"
                                    value={admin.email}
                                    onChange={(e) => handleUpdateAdmin(admin.id, admin.name, e.target.value, '', null)}
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    onChange={(e) => handleUpdateAdmin(admin.id, admin.name, admin.email, e.target.value, null)}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleUpdateAdmin(admin.id, admin.name, admin.email, '', e.target.files?.[0] || null)}
                                />
                                <button onClick={() => handleDeleteAdmin(admin.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                    <div className="admin-add">
                        <input
                            type="text"
                            placeholder="Admin Name"
                            value={newAdminName}
                            onChange={(e) => setNewAdminName(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Admin Email"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Admin Password"
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewAdminAvatar(e.target.files?.[0] || null)}
                        />
                        <button onClick={handleAddAdmin}>Add Admin</button>
                    </div>
                </div>
                <div className="technicians-section">
                    <h3>Technicians</h3>
                    <div className="technician-list">
                        {technicians.map((technician) => (
                            <div key={technician.id} className="technician-item">
                                <input
                                    type="text"
                                    value={technician.name}
                                    onChange={(e) => handleUpdateTechnician(technician.id, e.target.value, technician.email, '', null)}
                                />
                                <input
                                    type="email"
                                    value={technician.email}
                                    onChange={(e) => handleUpdateTechnician(technician.id, technician.name, e.target.value, '', null)}
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    onChange={(e) => handleUpdateTechnician(technician.id, technician.name, technician.email, e.target.value, null)}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleUpdateTechnician(technician.id, technician.name, technician.email, '', e.target.files?.[0] || null)}
                                />
                                <button onClick={() => handleDeleteTechnician(technician.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                    <div className="technician-add">
                        <input
                            type="text"
                            placeholder="Technician Name"
                            value={newTechnicianName}
                            onChange={(e) => setNewTechnicianName(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Technician Email"
                            value={newTechnicianEmail}
                            onChange={(e) => setNewTechnicianEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Technician Password"
                            value={newTechnicianPassword}
                            onChange={(e) => setNewTechnicianPassword(e.target.value)}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewTechnicianAvatar(e.target.files?.[0] || null)}
                        />
                        <button onClick={handleAddTechnician}>Add Technician</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;