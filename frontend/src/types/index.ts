export type Role = 'STUDENT' | 'TUTOR';
export type TeachingMode = 'HOME' | 'ONLINE' | 'BOTH';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID';

export interface User { id: number; fullName: string; email: string; phone: string; role: Role }
export interface Subject { id: number; name: string; description?: string }
export interface Tutor {
  id: number; fullName: string; bio: string | null; city: string; locality: string | null; qualification: string;
  experienceYears: number; hourlyFee: number; teachingMode: TeachingMode; averageRating: number | null; subjects: Subject[];
}
export interface Availability { id: number; dayOfWeek: string; startTime: string; endTime: string; available: boolean }
export interface StudentProfile {
  id: number; fullName: string; email: string; phone: string; city: string; locality: string | null;
  educationLevel: string | null; preferredLearningMode: TeachingMode | null; subjectsNeeded: string | null;
}
export interface TutoringRequest {
  id: number; tutorId: number; tutorName: string; studentId: number; studentName: string; subjectId: number;
  subjectName: string; message: string; requestedDate: string; requestedTime: string; status: RequestStatus;
  paymentAmount: number; paymentStatus: PaymentStatus | null; createdAt: string; contactPhone: string | null;
}
export interface PaymentOrder {
  keyId: string; orderId: string; amount: number; currency: string; name: string; description: string;
}
export interface PaymentVerification {
  razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string;
}
export interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number }
