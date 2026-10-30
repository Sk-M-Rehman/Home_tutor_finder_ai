import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { FormField, controlClass } from './FormField';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; hint?: string }>(function Select(
  { label, error, hint, id, className, children, ...props }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FormField label={label} htmlFor={fid} error={error} hint={hint}>
      <select id={fid} ref={ref} aria-invalid={!!error} className={`${controlClass(error)} ${className ?? ''}`} {...props}>{children}</select>
    </FormField>
  );
});
