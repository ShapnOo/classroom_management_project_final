export type OnboardingStep = "lookup" | "biodata" | "documents" | "confirmed";

export interface DocumentUploadState {
  id: string;
  title: string;
  description: string;
  type: string;
  required: boolean;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploaded: boolean;
  previewUrl?: string;
}

export interface StudentBioData {
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  bloodGroup: string;
  dob: string;
  gender: string;
  nidBirthCert: string;
  emergencyContact: string;
  emergencyRelation: string;
  presentAddress: string;
  permanentAddress: string;
}

export interface StudentProfileData {
  id?: string;
  studentId?: string;
  name: string;
  rollNo: string;
  email?: string;
  phone?: string;
  programName?: string;
  batchName?: string;
  maskedPhone?: string;
  maskedEmail?: string;
  demoOtp?: string;
}

export interface ConfirmedRegistrationData {
  trackingNumber: string;
  verificationStatus: string;
  onboardedAt: string;
}
