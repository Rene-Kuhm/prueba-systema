// componente para los campos de entrada de formulario

interface FormInputProps {
    id: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    label: string;
    required?: boolean;
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
        <label htmlFor={id} className="form-label">
            {label}
        </label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className="form-input"
            placeholder={placeholder}
        />
    </div>
);

interface RoleButtonProps {
    role: 'admin' | 'technician';
    selectedRole: 'admin' | 'technician';
    onClick: () => void;
    label: string;
}

export const RoleButton: React.FC<RoleButtonProps> = ({
    role,
    selectedRole,
    onClick,
    label,
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`role-button ${selectedRole === role ? 'role-button-active' : 'role-button-inactive'
            }`}
        aria-pressed={selectedRole === role}
        aria-label={`Seleccionar ${label}`}
    >
        {label}
    </button>
);

interface SubmitButtonProps {
    isSubmitting: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting }) => (
    <button type="submit" disabled={isSubmitting} className="submit-button">
        Iniciar Sesión
    </button>
);