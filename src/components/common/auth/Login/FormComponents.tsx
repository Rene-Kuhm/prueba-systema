import React from 'react'
import { requestNotificationPermission } from '@/lib/utils/notifications'

interface FormInputProps {
  id: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  label: string
  required?: boolean
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  type,
  value,
  onChange,
  placeholder,
  label,
  required = false,
}) => (
  <div>
    <label htmlFor={id} className='form-label'>
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      className='form-input'
      placeholder={placeholder}
    />
  </div>
)

interface RoleButtonProps {
  role: 'admin' | 'technician'
  selectedRole: 'admin' | 'technician'
  onClick: () => void
  label: string
}

export const RoleButton: React.FC<RoleButtonProps> = ({
  role,
  selectedRole,
  onClick,
  label,
}) => (
  <button
    type='button'
    onClick={onClick}
    className={`role-button ${
      selectedRole === role ? 'role-button-active' : 'role-button-inactive'
    }`}
    aria-pressed={selectedRole === role}
    aria-label={`Seleccionar ${label}`}
  >
    {label}
  </button>
)

interface SubmitButtonProps {
  isSubmitting: boolean
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting }) => (
  <button type='submit' disabled={isSubmitting} className='submit-button'>
    Iniciar Sesión
  </button>
)

interface LoginCredentials {
  email: string
  password: string
  role: 'admin' | 'technician'
}

export function Login() {
  const [formData, setFormData] = React.useState<LoginCredentials>({
    email: '',
    password: '',
    role: 'admin',
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }))
  }

  const handleRoleChange = (role: 'admin' | 'technician') => {
    setFormData((prevState) => ({
      ...prevState,
      role,
    }))
  }

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsSubmitting(true)
    try {
      // Aquí deberías implementar tu lógica de inicio de sesión
      'Intentando iniciar sesión con:', credentials

      // Simulamos un inicio de sesión exitoso
      const loginSuccessful = true

      if (loginSuccessful) {
        requestNotificationPermission()
        // Otras acciones post-login...
        ;('Inicio de sesión exitoso')
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleLogin(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        id='email'
        type='email'
        value={formData.email}
        onChange={handleInputChange}
        placeholder='correo@ejemplo.com'
        label='Correo Electrónico'
        required
      />
      <FormInput
        id='password'
        type='password'
        value={formData.password}
        onChange={handleInputChange}
        placeholder='Contraseña'
        label='Contraseña'
        required
      />
      <div>
        <RoleButton
          role='admin'
          selectedRole={formData.role}
          onClick={() => handleRoleChange('admin')}
          label='Administrador'
        />
        <RoleButton
          role='technician'
          selectedRole={formData.role}
          onClick={() => handleRoleChange('technician')}
          label='Técnico'
        />
      </div>
      <SubmitButton isSubmitting={isSubmitting} />
    </form>
  )
}
