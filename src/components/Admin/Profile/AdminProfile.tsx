import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { collection, doc, getDoc } from 'firebase/firestore';
import uploadAvatar from '@/components/Admin/Profile/uploadAvatar.';
import { db, auth, storage } from '@/lib/firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import '@/components/Admin/Profile/AdminProfile.css';

export interface AdminProfileProps {
    fullName: string;
    email: string;
    avatar: string;
    onLogout: () => void;
    onUpdateProfile: (data: UpdateProfileData) => Promise<void>;
}

interface UpdateProfileData {
    fullName: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
    avatar?: File | string;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({
    onLogout,
    onUpdateProfile,
}) => {
    const [formData, setFormData] = useState<UpdateProfileData>({
        fullName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        avatar: ''
    });
    const [showDropdown, setShowDropdown] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string>('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDocRef = doc(collection(db, 'users'), user.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const avatarRef = ref(storage, `avatars/${user.uid}/avatar.jpg`);
                        const avatarUrl = await getDownloadURL(avatarRef);
                        setFormData({
                            fullName: userData.fullName,
                            email: userData.email,
                            currentPassword: '',
                            newPassword: '',
                            avatar: avatarUrl
                        });
                        setAvatarPreview(avatarUrl);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }

            let avatarUrl = formData.avatar as string;

            if (formData.avatar instanceof File) {
                avatarUrl = await uploadAvatar(formData.avatar) || avatarUrl;
            }

            await onUpdateProfile({
                ...formData,
                avatar: avatarUrl
            });

            setFormData(prevData => ({
                ...prevData,
                avatar: avatarUrl
            }));
            setAvatarPreview(avatarUrl);
            setShowDropdown(false);

            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFormData(prevData => ({
                ...prevData,
                avatar: file
            }));
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleLogout = () => {
        onLogout();
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    return (
        <div className="admin-profile-container">
            <button
                className="profile-trigger"
                onClick={toggleDropdown}
            >
                <img
                    src={avatarPreview || '/default-avatar.png'}
                    alt="Profile"
                    className="profile-avatar"
                />
                <span className="profile-name">{formData.fullName}</span>
            </button>

            {showDropdown && (
                <div className="profile-dropdown">
                    <div className="profile-info">
                        <div className="profile-header">
                            <img
                                src={avatarPreview || '/default-avatar.png'}
                                alt="Profile"
                                className="profile-avatar-large"
                            />
                            <div className="profile-details">
                                <h3 className="profile-name-large">{formData.fullName}</h3>
                                <p className="profile-email">{formData.email}</p>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <label htmlFor="avatar-input" className="cursor-pointer edit-profile-btn">
                                Update Avatar
                            </label>
                            <input
                                id="avatar-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <button
                                className="edit-profile-btn"
                                onClick={handleSubmit}
                            >
                                Save Changes
                            </button>
                            <button
                                className="logout-btn"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfile;