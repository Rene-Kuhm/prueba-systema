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
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateProfileData>({
        fullName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        avatar: ''
    });
    const [showDropdown, setShowDropdown] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [createdAt, setCreatedAt] = useState<string>('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDocRef = doc(collection(db, 'users'), user.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const avatarRef = ref(storage, userData.avatar);
                        const avatarUrl = await getDownloadURL(avatarRef);
                        setFormData({
                            fullName: userData.fullName,
                            email: userData.email,
                            currentPassword: '',
                            newPassword: '',
                            avatar: avatarUrl
                        });
                        setAvatarPreview(avatarUrl);
                        setRole(userData.role);
                        setCreatedAt(userData.createdAt);
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
            setIsEditing(false);

            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLogout = () => {
        onLogout();
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
                    {!isEditing ? (
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
                                    <p className="profile-role">Role: {role}</p>
                                    <p className="profile-created">Joined: {new Date(createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <button
                                    className="edit-profile-btn"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
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
                    ) : (
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-group">
                                <label className="form-label">
                                    Fullname
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        fullName: e.target.value
                                    })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        email: e.target.value
                                    })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Avatar
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="form-input"
                                />
                                {avatarPreview && (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar Preview"
                                        className="avatar-preview"
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={formData.currentPassword || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        currentPassword: e.target.value
                                    })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={formData.newPassword || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        newPassword: e.target.value
                                    })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="save-btn"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminProfile;