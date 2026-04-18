"use client";

import { useEffect, useState } from "react";
import { AuthBar } from "@/components/auth/AuthBar";
import { WorkspaceShell } from "@/components/navigation";
import { PageSection } from "@/components/workspace";
import { type AuthUser, updateUserProfile } from "@/lib/auth-session";
import { useSessionUser } from "@/lib/use-session-user";

type ProfileForm = {
  name: string;
  email: string;
  location: string;
  phoneNumber: string;
  businessName: string;
  businessLocation: string;
  businessRegistrationNumber: string;
};

const EMPTY_FORM: ProfileForm = {
  name: "",
  email: "",
  location: "",
  phoneNumber: "",
  businessName: "",
  businessLocation: "",
  businessRegistrationNumber: "",
};

function toProfileForm(user: AuthUser | null): ProfileForm {
  if (!user) {
    return EMPTY_FORM;
  }

  return {
    name: user.name || "",
    email: user.email || "",
    location: user.location || "",
    phoneNumber: user.phoneNumber || "",
    businessName: user.businessName || "",
    businessLocation: user.businessLocation || "",
    businessRegistrationNumber: user.businessRegistrationNumber || "",
  };
}

function validate(form: ProfileForm) {
  if (form.name.trim().length < 2) {
    return "Name must be at least 2 characters long.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return "Enter a valid email address.";
  }

  if (form.location.trim().length < 2) {
    return "Location is required.";
  }

  if (form.phoneNumber.trim().length < 7) {
    return "Phone number must be at least 7 characters.";
  }

  if (form.businessName.trim().length < 2) {
    return "Business name is required.";
  }

  if (form.businessLocation.trim().length < 2) {
    return "Business location is required.";
  }

  if (form.businessRegistrationNumber.trim().length < 3) {
    return "Business registration number is required.";
  }

  return null;
}

export default function SettingsPage() {
  const sessionUser = useSessionUser();
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setForm(toProfileForm(sessionUser));
  }, [
    sessionUser?.name,
    sessionUser?.email,
    sessionUser?.location,
    sessionUser?.phoneNumber,
    sessionUser?.businessName,
    sessionUser?.businessLocation,
    sessionUser?.businessRegistrationNumber,
  ]);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError(null);
    }
    if (success) {
      setSuccess(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) {
      return;
    }

    setError(null);
    setSuccess(null);

    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);
    const result = updateUserProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      location: form.location.trim(),
      phoneNumber: form.phoneNumber.trim(),
      businessName: form.businessName.trim(),
      businessLocation: form.businessLocation.trim(),
      businessRegistrationNumber: form.businessRegistrationNumber.trim(),
    });

    if (!result.success) {
      setError(result.message);
      setPending(false);
      return;
    }

    setSuccess("Profile updated successfully.");
    setPending(false);
  }

  return (
    <WorkspaceShell
      eyebrow="Settings"
      title="Edit Your Profile"
      description="Keep your personal and business details updated across contracts and workflows."
    >
      <AuthBar />

      <PageSection
        title="Profile Details"
        description="These values are reused across your workspace, including contract generation defaults."
        tone="cream"
        eyebrow="Editable"
      >
        <form onSubmit={handleSubmit} className="space-y-6 border-4 border-black bg-white p-5 neo-shadow-md sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">Full name</span>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="neo-input"
                placeholder="Shubham Gupta"
                autoComplete="name"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="neo-input"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">Location</span>
              <input
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="neo-input"
                placeholder="Mumbai, India"
                autoComplete="address-level2"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">Phone number</span>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => updateField("phoneNumber", e.target.value)}
                className="neo-input"
                placeholder="+91 84220 51436"
                autoComplete="tel"
                required
              />
            </label>
          </div>

          <div className="border-t-4 border-black pt-5">
            <p className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">Business Details</p>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">Business name</span>
                <input
                  value={form.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  className="neo-input"
                  placeholder="Pixels Studio"
                  autoComplete="organization"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">Business location</span>
                <input
                  value={form.businessLocation}
                  onChange={(e) => updateField("businessLocation", e.target.value)}
                  className="neo-input"
                  placeholder="Mumbai, India"
                  autoComplete="street-address"
                  required
                />
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-black">Registration number</span>
                <input
                  value={form.businessRegistrationNumber}
                  onChange={(e) => updateField("businessRegistrationNumber", e.target.value)}
                  className="neo-input"
                  placeholder="REG-2026-001"
                  required
                />
              </label>
            </div>
          </div>

          {error ? (
            <p className="border-[3px] border-black bg-[#ff6b6b] px-4 py-3 text-sm font-bold text-black">⚠ {error}</p>
          ) : null}

          {success ? (
            <p className="border-[3px] border-black bg-[#ffd93d] px-4 py-3 text-sm font-bold text-black">✓ {success}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="neo-btn neo-btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save Profile →"}
          </button>
        </form>
      </PageSection>
    </WorkspaceShell>
  );
}
