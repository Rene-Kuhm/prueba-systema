import React, { useState, useEffect } from 'react';
import { doc, updateDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { db, storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Trash2, UserPlus, Upload, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface UserData {
  name: string;
  email: string;
  password: string;
  avatar: File | null;
}

const initialUserData: UserData = {
  name: '',
  email: '',
  password: '',
  avatar: null,
};

const UserCard: React.FC<{
  user: User;
  role: 'admin' | 'technician';
  onUpdate: (data: any) => void;
  onDelete: () => void;
  isDeleting: boolean;
}> = ({ user, role, onUpdate, onDelete, isDeleting }) => (
  <Card className="mb-4 bg-slate-600 rounded-xl">
    <CardContent className="pt-6">
      <div className="flex items-start space-x-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Nombre</label>
            <Input
              defaultValue={user.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Email</label>
            <Input
              type="email"
              defaultValue={user.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-[1fr,1fr,auto] gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Nueva Contraseña</label>
              <Input
                type="password"
                placeholder="Nueva contraseña"
                onChange={(e) => onUpdate({ password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Avatar</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => onUpdate({ avatar: e.target.files?.[0] })}
              />
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="mt-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente el usuario.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive">
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Eliminar'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NewUserForm: React.FC<{
  userData: UserData;
  setUserData: (data: UserData) => void;
  onSubmit: () => void;
  role: 'admin' | 'technician';
}> = ({ userData, setUserData, onSubmit, role }) => (
  <Card className='bg-slate-600 rounded-xl mb-8'>
    <CardHeader className=' text-white'>
      <CardTitle>Nuevo {role === 'admin' ? 'Administrador' : 'Técnico'}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Nombre</label>
        <Input
          value={userData.name}
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
          placeholder="Nombre completo"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Email</label>
        <Input
          type="email"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          placeholder="correo@ejemplo.com"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Contraseña</label>
          <Input
            type="password"
            value={userData.password}
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
            placeholder="********"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Avatar</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setUserData({ ...userData, avatar: e.target.files?.[0] || null })}
          />
        </div>
      </div>
      <Button 
        onClick={onSubmit}
        className="w-full"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Agregar {role === 'admin' ? 'Administrador' : 'Técnico'}
      </Button>
    </CardContent>
  </Card>
);

export const Settings: React.FC = () => {
  const [newAdminData, setNewAdminData] = useState<UserData>(initialUserData);
  const [newTechnicianData, setNewTechnicianData] = useState<UserData>(initialUserData);
  const [admins, setAdmins] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: { id: string; name: string; email: string; avatar: string; role: string }[] = [];
      
      usersSnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.role === 'admin' || user.role === 'technician') {
          usersData.push({
            id: doc.id,
            name: user.fullName,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
          });
        }
      });

      setAdmins(usersData.filter((user) => user.role === 'admin'));
      setTechnicians(usersData.filter((user) => user.role === 'technician'));
      setError(null);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File, userId: string, role: string) => {
    const storageRef = ref(storage, `avatars/${role}s/${userId}/avatar.jpg`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleAddUser = async (role: 'admin' | 'technician') => {
    const userData = role === 'admin' ? newAdminData : newTechnicianData;
    
    if (!userData.name || !userData.email || !userData.password) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const avatarUrl = userData.avatar 
        ? await uploadAvatar(userData.avatar, userCredential.user.uid, role)
        : '';

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: userData.name,
        email: userData.email,
        role,
        avatar: avatarUrl,
      });

      const newUser = {
        id: userCredential.user.uid,
        name: userData.name,
        email: userData.email,
        avatar: avatarUrl,
      };

      if (role === 'admin') {
        setAdmins([...admins, newUser]);
        setNewAdminData(initialUserData);
      } else {
        setTechnicians([...technicians, newUser]);
        setNewTechnicianData(initialUserData);
      }

      toast.success(`${role === 'admin' ? 'Administrador' : 'Técnico'} agregado exitosamente`);
    } catch (error) {
      toast.error(`Error al agregar ${role}: ${error}`);
    }
  };

  const handleUpdateUser = async (
    id: string,
    newData: { name?: string; email?: string; password?: string; avatar?: File | null },
    role: 'admin' | 'technician'
  ) => {
    try {
      const updates: any = {};

      if (newData.name) updates.fullName = newData.name;
      if (newData.email) updates.email = newData.email;

      if (newData.avatar) {
        updates.avatar = await uploadAvatar(newData.avatar, id, role);
      }

      await updateDoc(doc(db, 'users', id), updates);

      if (newData.password) {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user && user.uid === id) {
          await updatePassword(user, newData.password);
        }
      }

      const updateUserList = (users: User[]) =>
        users.map(user =>
          user.id === id
            ? { ...user, name: newData.name || user.name, email: newData.email || user.email, avatar: updates.avatar || user.avatar }
            : user
        );

      if (role === 'admin') {
        setAdmins(updateUserList(admins));
      } else {
        setTechnicians(updateUserList(technicians));
      }

      toast.success('Usuario actualizado exitosamente');
    } catch (error) {
      toast.error(`Error al actualizar usuario: ${error}`);
    }
  };

  const handleDeleteUser = async (id: string, role: 'admin' | 'technician') => {
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'users', id));
      
      if (role === 'admin') {
        setAdmins(admins.filter(admin => admin.id !== id));
      } else {
        setTechnicians(technicians.filter(tech => tech.id !== id));
      }
      
      toast.success(`${role === 'admin' ? 'Administrador' : 'Técnico'} eliminado exitosamente`);
    } catch (error) {
      toast.error(`Error al eliminar usuario: ${error}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 ">
      <Card className='bg-slate-700 rounded-xl mb-8'>
        <CardHeader>
          <CardTitle className='text-green-400'>Configuración</CardTitle>
          <CardDescription className='text-white'>
            Administre usuarios del sistema, tanto administradores como técnicos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="admins">
            <TabsList className="grid w-full grid-cols-2 bg-slate-600 text-white">
              <TabsTrigger value="admins">Administradores</TabsTrigger>
              <TabsTrigger value="technicians">Técnicos</TabsTrigger>
            </TabsList>

            <TabsContent value="admins" className="space-y-4">
              <NewUserForm
                userData={newAdminData}
                setUserData={setNewAdminData}
                onSubmit={() => handleAddUser('admin')}
                role="admin"
              />
              <div className="space-y-4 ">
                {admins.map((admin) => (
                  <UserCard
                    key={admin.id}
                    user={admin}
                    role="admin"
                    onUpdate={(data) => handleUpdateUser(admin.id, data, 'admin')}
                    onDelete={() => handleDeleteUser(admin.id, 'admin')}
                    isDeleting={deleting === admin.id}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="technicians" className="space-y-4 ">
              <NewUserForm
                userData={newTechnicianData}
                setUserData={setNewTechnicianData}
                onSubmit={() => handleAddUser('technician')}
                role="technician"
              />
              <div className="space-y-4">
              {technicians.map((technician) => (
                  <UserCard
                    key={technician.id}
                    user={technician}
                    role="technician"
                    onUpdate={(data) => handleUpdateUser(technician.id, data, 'technician')}
                    onDelete={() => handleDeleteUser(technician.id, 'technician')}
                    isDeleting={deleting === technician.id}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;