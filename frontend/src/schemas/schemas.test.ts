import { describe, expect, it } from 'vitest';
import { signInSchema, signUpSchema, availabilitySchema } from './index';

const base = {
  fullName: 'Asha Rao', email: 'asha@example.com', phone: '9876543210', password: 'Passw0rd1', confirmPassword: 'Passw0rd1',
  city: 'Vijayawada', acceptTerms: true,
};

describe('signInSchema', () => {
  it('rejects invalid email', () => expect(signInSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false));
  it('accepts valid credentials', () => expect(signInSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true));
});

describe('signUpSchema', () => {
  it('accepts a valid student', () => {
    expect(signUpSchema.safeParse({ ...base, role: 'STUDENT', educationLevel: 'Class 10', preferredLearningMode: 'BOTH' }).success).toBe(true);
  });
  it('rejects mismatched passwords', () => {
    expect(signUpSchema.safeParse({ ...base, confirmPassword: 'other', role: 'STUDENT', educationLevel: 'x', preferredLearningMode: 'HOME' }).success).toBe(false);
  });
  it('requires tutor-specific fields', () => {
    expect(signUpSchema.safeParse({ ...base, role: 'TUTOR' }).success).toBe(false);
  });
  it('accepts a valid tutor and rejects absurd fee', () => {
    const tutor = { ...base, role: 'TUTOR', qualification: 'M.Sc', experienceYears: 4, teachingMode: 'HOME', hourlyFee: 400, subjectIds: [1] };
    expect(signUpSchema.safeParse(tutor).success).toBe(true);
    expect(signUpSchema.safeParse({ ...tutor, hourlyFee: 999999 }).success).toBe(false);
  });
  it('requires accepting terms', () => {
    expect(signUpSchema.safeParse({ ...base, acceptTerms: false, role: 'STUDENT', educationLevel: 'x', preferredLearningMode: 'HOME' }).success).toBe(false);
  });
});

describe('availabilitySchema', () => {
  it('requires end after start', () => {
    expect(availabilitySchema.safeParse({ dayOfWeek: 'MONDAY', startTime: '10:00', endTime: '09:00' }).success).toBe(false);
    expect(availabilitySchema.safeParse({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00' }).success).toBe(true);
  });
});
