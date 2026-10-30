import { z } from 'zod';

const phone = z.string().trim().regex(/^[+]?[0-9 \-]{10,15}$/, 'Enter a valid phone number');
const password = z
  .string()
  .min(8, 'At least 8 characters')
  .max(72, 'At most 72 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one digit');
const mode = z.enum(['HOME', 'ONLINE', 'BOTH'], { errorMap: () => ({ message: 'Select an option' }) });
const num = (label: string) =>
  z.number({ required_error: `${label} is required`, invalid_type_error: `Enter a valid ${label.toLowerCase()}` });
const years = num('Experience').int('Whole years only').min(0, 'Cannot be negative').max(60, 'At most 60 years');
const fee = num('Fee').min(1, 'Fee must be at least ₹1').max(20000, 'Fee must be at most ₹20,000');
const text = (label: string, max = 80) => z.string().trim().min(1, `${label} is required`).max(max, `At most ${max} characters`);

export const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    role: z.enum(['STUDENT', 'TUTOR']),
    fullName: text('Full name', 100),
    email: z.string().trim().email('Enter a valid email address').max(190),
    phone,
    password,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    city: text('City'),
    locality: z.string().trim().max(80).optional(),
    educationLevel: z.string().trim().max(80).optional(),
    preferredLearningMode: mode.optional(),
    subjectsNeeded: z.string().trim().max(500).optional(),
    qualification: z.string().trim().max(255).optional(),
    experienceYears: years.optional(),
    teachingMode: mode.optional(),
    hourlyFee: fee.optional(),
    subjectIds: z.array(z.number()).optional(),
    acceptTerms: z.boolean().refine((v) => v === true, 'You must accept the terms and conditions'),
  })
  .superRefine((d, ctx) => {
    const add = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
    if (d.password !== d.confirmPassword) add('confirmPassword', 'Passwords do not match');
    if (d.role === 'STUDENT') {
      if (!d.educationLevel) add('educationLevel', 'Class or education level is required');
      if (!d.preferredLearningMode) add('preferredLearningMode', 'Select a learning mode');
    } else {
      if (!d.qualification) add('qualification', 'Qualification is required');
      if (d.experienceYears === undefined) add('experienceYears', 'Experience is required');
      if (!d.teachingMode) add('teachingMode', 'Select a teaching mode');
      if (d.hourlyFee === undefined) add('hourlyFee', 'Fee is required');
      if (!d.subjectIds || d.subjectIds.length === 0) add('subjectIds', 'Select at least one subject');
    }
  });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const studentProfileSchema = z.object({
  fullName: text('Full name', 100),
  phone,
  city: text('City'),
  locality: z.string().trim().max(80).optional(),
  educationLevel: text('Education level'),
  preferredLearningMode: mode,
  subjectsNeeded: z.string().trim().max(500).optional(),
});
export type StudentProfileValues = z.infer<typeof studentProfileSchema>;

export const tutorProfileSchema = z.object({
  fullName: text('Full name', 100),
  phone,
  bio: z.string().trim().max(2000, 'At most 2000 characters').optional(),
  city: text('City'),
  locality: z.string().trim().max(80).optional(),
  qualification: text('Qualification', 255),
  experienceYears: years,
  hourlyFee: fee,
  teachingMode: mode,
  subjectIds: z.array(z.number()).min(1, 'Select at least one subject'),
});
export type TutorProfileValues = z.infer<typeof tutorProfileSchema>;

export const availabilitySchema = z
  .object({
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
  })
  .refine((d) => !d.startTime || !d.endTime || d.startTime < d.endTime, { path: ['endTime'], message: 'End time must be after start time' });
export type AvailabilityValues = z.infer<typeof availabilitySchema>;

export const requestSchema = z.object({
  subjectId: num('Subject'),
  requestedDate: z.string().min(1, 'Preferred date is required'),
  requestedTime: z.string().min(1, 'Preferred time is required'),
  message: z.string().trim().min(1, 'Message is required').max(1000, 'At most 1000 characters'),
});
export type RequestValues = z.infer<typeof requestSchema>;

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, 'Required'), newPassword: password, confirmNewPassword: z.string().min(1, 'Required') })
  .refine((d) => d.newPassword === d.confirmNewPassword, { path: ['confirmNewPassword'], message: 'Passwords do not match' });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
