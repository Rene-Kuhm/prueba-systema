import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-toastify'
import {
  CheckCircle,
  AlertCircle,
  UserCheck,
  Mail,
  Calendar,
} from 'lucide-react'

interface PendingUser {
  id: string
  email: string
  fullName: string
  role: string
  createdAt: string
}

export const PendingUsers = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingUser, setProcessingUser] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      setLoading(true)
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('approved', '==', false))
      const querySnapshot = await getDocs(q)
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PendingUser[]
      setPendingUsers(users)
      setError(null)
    } catch (error) {
      console.error('Error al obtener usuarios pendientes:', error)
      setError('Error al cargar los usuarios pendientes')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      setProcessingUser(userId)
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        approved: true,
        approvedAt: new Date().toISOString(),
      })
      setPendingUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userId),
      )
      toast.success('Usuario aprobado exitosamente')
    } catch (error) {
      console.error('Error al aprobar usuario:', error)
      toast.error('Error al aprobar el usuario')
    } finally {
      setProcessingUser(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className='h-6 w-[200px]' />
          </CardTitle>
          <CardDescription>
            <Skeleton className='h-4 w-[300px]' />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center space-x-4 mb-4'>
              <Skeleton className='h-12 w-12 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-[250px]' />
                <Skeleton className='h-4 w-[200px]' />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className='bg-slate-600 rounded-xl mb-8'>
      <CardHeader>
        <div className='flex justify-between items-center '>
          <div>
            <CardTitle className='text-green-400'>
              Usuarios Pendientes
            </CardTitle>
            <CardDescription className='text-white'>
              Gestiona las solicitudes de nuevos usuarios que requieren
              aprobación
            </CardDescription>
          </div>
          <Badge variant='secondary' className='h-8 px-3'>
            {pendingUsers.length} pendientes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <Alert>
            <CheckCircle className='h-4 w-4' />
            <AlertTitle>¡Todo al día!</AlertTitle>
            <AlertDescription>
              No hay usuarios pendientes de aprobación en este momento.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de Solicitud</TableHead>
                <TableHead className='text-right'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>{user.fullName}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-muted-foreground' />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-muted-foreground' />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      onClick={() => handleApprove(user.id)}
                      disabled={processingUser === user.id}
                      className='gap-2'
                    >
                      <UserCheck className='h-4 w-4' />
                      {processingUser === user.id ? 'Aprobando...' : 'Aprobar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default PendingUsers
