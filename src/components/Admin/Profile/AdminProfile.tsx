import React, { useState, useEffect } from 'react';
import { LogOut, Camera, User, Mail, Loader2, Check } from 'lucide-react';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import uploadAvatar from '@/components/Admin/Profile/uploadAvatar.';
import { db, auth, storage } from '@/config/firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

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
    const [isOpen, setIsOpen] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
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
            toast.error('Error al cargar los datos del usuario');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            const user = auth.currentUser;
            if (!user) {
                throw new Error("Usuario no autenticado");
            }

            let avatarUrl = formData.avatar as string;

            if (formData.avatar instanceof File) {
                avatarUrl = await uploadAvatar(formData.avatar) || avatarUrl;
            }

            const userDocRef = doc(collection(db, 'users'), user.uid);
            await updateDoc(userDocRef, {
                fullName: formData.fullName,
                email: formData.email
            });

            await onUpdateProfile({
                ...formData,
                avatar: avatarUrl
            });

            setFormData(prevData => ({
                ...prevData,
                avatar: avatarUrl
            }));
            setAvatarPreview(avatarUrl);
            setIsOpen(false);
            toast.success('Perfil actualizado exitosamente');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar el perfil');
        } finally {
            setIsUpdating(false);
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

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando...</span>
            </div>
        );
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="h-10 w-10 rounded-full"
                    role="button"
                    aria-label="Menu de usuario"
                >
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarPreview} alt={formData.fullName} />
                        <AvatarFallback>
                            {formData.fullName?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="end">
                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={avatarPreview} alt={formData.fullName} />
                                    <AvatarFallback>
                                        {formData.fullName?.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <Label
                                    htmlFor="avatar-input"
                                    className={cn(
                                        "absolute bottom-0 right-0 p-1 rounded-full",
                                        "bg-primary hover:bg-primary/90 cursor-pointer",
                                        "text-primary-foreground transition-colors"
                                    )}
                                >
                                    <Camera className="h-4 w-4" />
                                </Label>
                                <Input
                                    id="avatar-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <div>
                                <CardTitle>{formData.fullName}</CardTitle>
                                <CardDescription>{formData.email}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">
                                    <User className="h-4 w-4 inline mr-2" />
                                    Nombre
                                </Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        fullName: e.target.value
                                    })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    <Mail className="h-4 w-4 inline mr-2" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        email: e.target.value
                                    })}
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <Separator />

                    <CardFooter className="p-4">
                        <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={onLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </Button>
                    </CardFooter>
                </Card>
            </PopoverContent>
        </Popover>
    );
};

export default AdminProfile;