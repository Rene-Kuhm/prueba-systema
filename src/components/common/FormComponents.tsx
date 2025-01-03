import React from 'react';

interface InputFieldProps {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  type,
  name,
  label,
  placeholder,
  value,
  onChange,
  disabled,
  required
}) => (
  <div>
    <label htmlFor={id} className="block mb-1 text-sm font-medium text-gray-300">
      {label}
    </label>
    <input
      id={id}
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="w-full px-3 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
    />
  </div>
);

interface SubmitButtonProps {
  isSubmitting: boolean;
  text: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting, text }) => (
  <button
    type="submit"
    disabled={isSubmitting}
    className="w-full px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isSubmitting ? (
      <div className="flex items-center justify-center">
        <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
        Procesando...
      </div>
    ) : text}
  </button>
);

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="p-3 mt-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">
    {message}
  </div>
);
