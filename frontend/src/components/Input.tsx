import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { FormField, controlClass } from './FormField';

type Common = { label: string; error?: string; hint?: string };

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & Common>(function Input(
  { label, error, hint, id, className, ...props }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FormField label={label} htmlFor={fid} error={error} hint={hint}>
      <input id={fid} ref={ref} aria-invalid={!!error} className={`${controlClass(error)} ${className ?? ''}`} {...props} />
    </FormField>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & Common>(function Textarea(
  { label, error, hint, id, className, ...props }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FormField label={label} htmlFor={fid} error={error} hint={hint}>
      <textarea id={fid} ref={ref} rows={4} aria-invalid={!!error} className={`${controlClass(error)} ${className ?? ''}`} {...props} />
    </FormField>
  );
});
