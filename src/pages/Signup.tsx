// src/pages/Signup.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/AuthLayout'
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { FormInput, RoleSelect, SubmitButton, SuccessMessage } from '@/components/Signup/FormComponents'
import '@/styles/signup.css'

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'technician' as 'admin' | 'technician'
  })
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!formData.email || !formData.password || !formData.fullName || !formData.role) {
        throw new Error('Todos los campos son requeridos')
      }

      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      )
      
      await updateProfile(userCredential.user, { displayName: formData.fullName })

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        approved: false,
        createdAt: new Date().toISOString(),
      })

      setSuccess(true)
      navigate('/')
    } catch (err) {
      console.error('Error en el proceso de registro:', err)
      setError(err instanceof Error ? err.message : 'Error en el registro')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <AuthLayout title='COSPEC'>
        <SuccessMessage onBackToLogin={() => navigate('/')} />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title='Registro'>
      <form onSubmit={handleSubmit} className="form-container">
        <FormInput
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          label="Correo Electrónico"
        />
        <FormInput
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          label="Contraseña"
        />
        <FormInput
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          label="Nombre Completo"
        />
        <RoleSelect
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'technician'})}
        />
        <SubmitButton isSubmitting={isSubmitting} />
        {error && <div className="error-message">{error}</div>}
      </form>
    </AuthLayout>
  )
}