// componentes para los campos de entrada de formulario

import { Link } from "react-router-dom";

interface FormInputProps {
    id: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    id,
    type,
    value,
    onChange,
    label,
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
            className="form-input"
        />
    </div>
);

interface RoleSelectProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({ value, onChange }) => (
    <div>
        <label htmlFor="role" className="form-label">
            Rol
        </label>
        <select
            id="role"
            value={value}
            onChange={onChange}
            className="form-input"
        >
            <option value="technician">Técnico</option>
            <option value="admin">Administrador</option>
        </select>
    </div>
);

interface SubmitButtonProps {
    isSubmitting: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting }) => (
    <button
        type="submit"
        disabled={isSubmitting}
        className="submit-button"
    >
        {isSubmitting ? 'Registrando...' : 'Registrarse'}
    </button>
);

// src/components/Signup/SuccessMessage.tsx
interface SuccessMessageProps {
    onBackToLogin: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = () => (
    <div className="success-container" aria-live="polite">
        <h2 className="success-title">¡Registro Exitoso!</h2>
        <p className="success-message">
            Tu cuenta ha sido creada y está pendiente de aprobación por un
            administrador. Te notificaremos por email cuando tu cuenta sea
            activada.
        </p>
        <Link
            to="/"
            className="submit-button"
            aria-label="Volver al Login"
        >
            Volver al Login
        </Link>
    </div>
);