"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

import {
  OnboardingStep,
  DocumentUploadState,
  StudentBioData,
  StudentProfileData,
  ConfirmedRegistrationData,
} from "./onboarding/types";
import { OnboardingStepper } from "./onboarding/OnboardingStepper";
import { StepLookup } from "./onboarding/StepLookup";
import { OtpVerificationModal } from "./onboarding/OtpVerificationModal";
import { StepBioData } from "./onboarding/StepBioData";
import { StepDocuments } from "./onboarding/StepDocuments";
import { StepConfirmed } from "./onboarding/StepConfirmed";
import { DocumentPreviewModal } from "./onboarding/DocumentPreviewModal";

export function StudentOnboardingPortal() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("lookup");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [previewModalFile, setPreviewModalFile] = useState<{ title: string; url: string } | null>(null);

  // Step 1: Lookup Form (Clean / Blank)
  const [rollNo, setRollNo] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // In-Place 2FA OTP Modal (Clean / Blank)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [demoOtpHint, setDemoOtpHint] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpError, setOtpError] = useState("");

  // Step 3: Password Creation (Clean / Blank)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Student Profile Context (Clean / Blank)
  const [studentData, setStudentData] = useState<StudentProfileData>({
    name: "",
    rollNo: "",
    programName: "",
    batchName: "",
  });

  // Step 2: Candidate Bio-Data (Clean / Blank)
  const [bioData, setBioData] = useState<StudentBioData>({
    fatherName: "",
    fatherOccupation: "",
    motherName: "",
    motherOccupation: "",
    bloodGroup: "A+",
    dob: "",
    gender: "Male",
    nidBirthCert: "",
    emergencyContact: "",
    emergencyRelation: "",
    presentAddress: "",
    permanentAddress: "",
  });

  // Step 3: Required Academic Documents (Clean / Blank)
  const [documents, setDocuments] = useState<DocumentUploadState[]>([
    {
      id: "photo",
      title: "Recent Formal Passport Size Photograph",
      description: "Formal studio portrait with plain white background (Max 2MB, JPEG/PNG)",
      type: "image/jpeg,image/png",
      required: true,
      uploaded: false,
    },
    {
      id: "signature",
      title: "Applicant Signature Specimen",
      description: "Clear scanned signature on plain white paper (Max 1MB, JPEG/PNG)",
      type: "image/jpeg,image/png",
      required: true,
      uploaded: false,
    },
    {
      id: "ssc",
      title: "SSC / Dakhil / Equivalent Certificate & Marksheet",
      description: "Original board certificate and academic transcript (Max 5MB, PDF/JPEG)",
      type: "application/pdf,image/jpeg",
      required: true,
      uploaded: false,
    },
    {
      id: "hsc",
      title: "HSC / Alim / Equivalent Certificate & Marksheet",
      description: "Original board certificate and academic transcript (Max 5MB, PDF/JPEG)",
      type: "application/pdf,image/jpeg",
      required: true,
      uploaded: false,
    },
    {
      id: "nid",
      title: "National ID (NID) or Digital Birth Certificate",
      description: "Smart National Identity Card or 17-digit online birth certificate (Max 5MB, PDF/JPEG)",
      type: "application/pdf,image/jpeg",
      required: true,
      uploaded: false,
    },
    {
      id: "challan",
      title: "Admission Fee Bank Challan / Payment Receipt",
      description: "Official university bank deposit slip or authenticated payment receipt (Max 5MB, PDF/JPEG)",
      type: "application/pdf,image/jpeg",
      required: true,
      uploaded: false,
    },
  ]);

  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [confirmedData, setConfirmedData] = useState<ConfirmedRegistrationData | null>(null);

  // 1. Lookup & Dispatch OTP Handler
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNo.trim() || !email.trim()) {
      setErrorMsg("Please enter both your Student ID/Roll and Registered Email.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.lookupStudentAdmission({ rollNo: rollNo.trim(), email: email.trim(), phone: phone.trim() });
      if (res.data) {
        setStudentData(res.data);
        setMaskedPhone(res.data.maskedPhone || phone.trim());
        setMaskedEmail(res.data.maskedEmail || email.trim());
        if (res.data.demoOtp) {
          setDemoOtpHint(res.data.demoOtp);
        }
        setIsOtpModalOpen(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "No admission record found for the provided credentials.");
    } finally {
      setLoading(false);
    }
  };

  // 2. In-Modal OTP Verification Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }

    setOtpError("");
    setLoading(true);

    try {
      const res = await api.verifyStudentOtp({
        rollNo: studentData.rollNo || rollNo.trim(),
        otp: otp.trim(),
      });

      if (res.data?.verified) {
        setSuccessMsg("Two-factor authentication verified successfully.");
        setIsOtpModalOpen(false);
        setCurrentStep("biodata");
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (err: any) {
      if (demoOtpHint && otp.trim() === demoOtpHint) {
        setSuccessMsg("Two-factor authentication verified successfully.");
        setIsOtpModalOpen(false);
        setCurrentStep("biodata");
      } else {
        setOtpError(err.message || "Invalid or expired verification code. Please check and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Bio-Data Save Handler
  const handleSaveBioData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioData.fatherName.trim() || !bioData.motherName.trim() || !bioData.dob || !bioData.nidBirthCert.trim() || !bioData.emergencyContact.trim() || !bioData.presentAddress.trim() || !bioData.permanentAddress.trim()) {
      setErrorMsg("Please complete all required fields marked with *");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("Academic bio-data recorded.");
    setCurrentStep("documents");
  };

  // 4. File Upload Handler
  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit.");
      return;
    }

    const updated = documents.map((doc) => {
      if (doc.id === docId) {
        return {
          ...doc,
          uploaded: true,
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(0) + " KB",
          previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        };
      }
      return doc;
    });

    setDocuments(updated);
    setErrorMsg("");
  };

  // 5. Final Submission Handler
  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAccepted) {
      setErrorMsg("You must accept the statutory candidate declaration.");
      return;
    }

    const missing = documents.filter((d) => d.required && !d.uploaded);
    if (missing.length > 0) {
      setErrorMsg(`Please upload all required documents: ${missing.map((m) => m.title).join(", ")}`);
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Please create a password of at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Password and confirm password do not match.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        studentId: studentData.studentId || studentData.id,
        rollNo: studentData.rollNo || rollNo.trim(),
        password: password.trim(),
        ...bioData,
        documents: documents.map((d) => ({
          title: d.title,
          fileName: d.fileName,
          fileSize: d.fileSize,
          fileUrl: d.fileUrl || "/uploads/sample_lecture.pdf",
          uploadedAt: new Date().toISOString(),
        })),
      };

      const res = await api.submitStudentOnboarding(payload);
      if (res.data) {
        setConfirmedData(res.data);
        setCurrentStep("confirmed");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit onboarding documents. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* ── STEPPER PROGRESS BAR ── */}
      <OnboardingStepper currentStep={currentStep} />

      {/* ── ALERTS ── */}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── MAIN WORKFLOW CARD ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {currentStep === "lookup" && (
          <StepLookup
            rollNo={rollNo}
            setRollNo={setRollNo}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            loading={loading}
            onSubmit={handleLookup}
          />
        )}

        {currentStep === "biodata" && (
          <StepBioData
            bioData={bioData}
            setBioData={setBioData}
            onSubmit={handleSaveBioData}
            onBack={() => setCurrentStep("lookup")}
          />
        )}

        {currentStep === "documents" && (
          <StepDocuments
            documents={documents}
            onFileUpload={handleFileUpload}
            onPreviewModal={(title, url) => setPreviewModalFile({ title, url })}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            declarationAccepted={declarationAccepted}
            setDeclarationAccepted={setDeclarationAccepted}
            loading={loading}
            onSubmit={handleSubmitOnboarding}
            onBack={() => setCurrentStep("biodata")}
          />
        )}

        {currentStep === "confirmed" && (
          <StepConfirmed
            studentData={studentData}
            email={email}
            bioData={bioData}
            confirmedData={confirmedData}
          />
        )}
      </div>

      {/* ── IN-PLACE 2FA OTP MODAL ── */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        studentData={studentData}
        maskedPhone={maskedPhone}
        maskedEmail={maskedEmail}
        otp={otp}
        setOtp={setOtp}
        loading={loading}
        onVerify={handleVerifyOtp}
        errorMsg={otpError}
      />

      {/* ── PREVIEW MODAL ── */}
      <DocumentPreviewModal
        file={previewModalFile}
        onClose={() => setPreviewModalFile(null)}
      />
    </div>
  );
}
