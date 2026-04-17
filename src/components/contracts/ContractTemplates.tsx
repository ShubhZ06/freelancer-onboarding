"use client";

import { ContractInput } from "@/lib/contract-engine";

export type TemplateType = 
  | "Basic"
  | "Influencer" 
  | "Corporate" 
  | "Professional" 
  | "Legal";

interface TemplateProps {
  data: ContractInput;
  contractText: string;
}

// 1. BASIC / STANDARD TEMPLATE (Plain & Professional)
export const BasicTemplate: React.FC<TemplateProps> = ({ data, contractText }) => {
  const currentDate = new Date().toLocaleDateString();
  
  return (
    <>
      <div className="contract-document-wrapper bg-white p-12 text-slate-900 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 border-b border-slate-300 pb-8">
          <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">
            FREELANCE SERVICES AGREEMENT
          </h1>
          <div className="flex justify-center gap-8 text-xs uppercase tracking-widest text-slate-600">
            <span>Status: FINAL</span>
            <span>•</span>
            <span>ID: [DOCUMENT_ID]</span>
            <span>•</span>
            <span>Date: {currentDate}</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="mb-8 text-sm leading-relaxed text-slate-800">
          <p className="mb-4">
            This agreement (&quot;Agreement&quot;) is made effective as of <strong>{data.effective_date}</strong> (the &quot;Effective Date&quot;) by and between:
          </p>
        </div>

        {/* Parties */}
        <div className="mb-8 space-y-2 text-sm">
          <div className="flex gap-4">
            <span className="w-32 font-bold uppercase tracking-wider">CLIENT:</span>
            <span>{data.client_name}, located at {data.client_location}</span>
          </div>
          <div className="flex gap-4">
            <span className="w-32 font-bold uppercase tracking-wider">CONTRACTOR:</span>
            <span>{data.freelancer_name}, located at {data.freelancer_location}</span>
          </div>
        </div>

        {/* Contract Content */}
        <div className="space-y-6 text-sm leading-[1.8]">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-[1.8] text-slate-800">
            {contractText}
          </pre>
        </div>

        {/* Signature Section */}
        <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="mb-8 h-1 border-b border-slate-400"></p>
            <p className="font-semibold uppercase tracking-wider">Client Signature</p>
            <p className="text-xs text-slate-600 mt-1">Date: _______________</p>
          </div>
          <div>
            <p className="mb-8 h-1 border-b border-slate-400"></p>
            <p className="font-semibold uppercase tracking-wider">Contractor Signature</p>
            <p className="text-xs text-slate-600 mt-1">Date: _______________</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-300 text-center text-xs text-slate-500 uppercase tracking-widest">
          © 2026 Freelancer Services. Governed by laws of {data.jurisdiction}.
        </div>
      </div>
    </>
  );
};

// 2. INFLUENCER / CREATIVE TEMPLATE (Pink & Vibrant)
export const InfluencerTemplate: React.FC<TemplateProps> = ({ data, contractText }) => {
  return (
    <>
      <div className="contract-document-wrapper bg-gradient-to-br from-pink-50 via-white to-purple-50 p-12 text-slate-900 max-w-4xl mx-auto">
        {/* Header with Gradient */}
        <div className="mb-12 pb-8 border-b-2 border-pink-200">
          <div className="inline-block mb-4 px-4 py-1 bg-pink-200 text-pink-900 text-xs font-bold rounded-full uppercase tracking-widest">
            BRAND COLLABORATION
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Freelance Services Agreement
          </h1>
          <p className="text-slate-600 text-sm">
            Dear <strong>{data.client_name}</strong>,
          </p>
        </div>

        {/* Friendly Introduction */}
        <div className="mb-8 text-slate-700 leading-relaxed">
          <p className="mb-4">
            We&apos;re thrilled to have the opportunity to collaborate! This agreement outlines the scope, deliverables, timeline, and compensation for our partnership.
          </p>
        </div>

        {/* Key Details in Card Style */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div className="bg-white border-2 border-pink-200 rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-pink-600 font-bold mb-1">Effective Date</p>
            <p className="font-semibold text-lg text-slate-900">{data.effective_date}</p>
          </div>
          <div className="bg-white border-2 border-purple-200 rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-purple-600 font-bold mb-1">Compensation</p>
            <p className="font-semibold text-lg text-slate-900">{data.budget}</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6 mb-8">
          <div className="bg-white rounded-xl border-l-4 border-pink-500 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">SCOPE OF WORK</h2>
            <p className="text-slate-700">{data.scope_of_work}</p>
          </div>

          <div className="bg-white rounded-xl border-l-4 border-purple-500 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">COMPENSATION</h2>
            <div className="text-slate-700 space-y-2">
              <p><strong>Total Budget:</strong> {data.budget}</p>
              <p><strong>Payment Terms:</strong> {data.payment_terms}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border-l-4 border-pink-500 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">TIMELINE</h2>
            <p className="text-slate-700">{data.timeline}</p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <p className="mb-6 h-1 border-b-2 border-pink-300"></p>
            <p className="font-bold text-slate-900">Client Signature</p>
            <p className="text-xs text-slate-600">Date: _______________</p>
          </div>
          <div>
            <p className="mb-6 h-1 border-b-2 border-purple-300"></p>
            <p className="font-bold text-slate-900">Contractor Signature</p>
            <p className="text-xs text-slate-600">Date: _______________</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-600 italic pt-4 border-t border-pink-200">
          Thank you for the opportunity to collaborate! We look forward to creating something amazing together.
        </div>
      </div>
    </>
  );
};

// 3. CORPORATE TEMPLATE (Dark Green & Professional)
export const CorporateTemplate: React.FC<TemplateProps> = ({ data, contractText }) => {
  return (
    <>
      <div className="contract-document-wrapper bg-white text-slate-900 max-w-4xl mx-auto">
        {/* Dark Header */}
        <div className="bg-slate-900 text-white px-12 py-8 mb-12">
          <h1 className="text-3xl font-black uppercase tracking-widest">Professional Services Agreement</h1>
          <div className="flex gap-6 mt-3 text-xs uppercase tracking-widest text-slate-400">
            <span>Verified Document</span>
            <span>•</span>
            <span>ID: [DOCUMENT_ID]</span>
            <span>•</span>
            <span>Status: FINAL</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-12 pb-12">
          {/* Parties Table */}
          <div className="mb-8 border border-slate-300 rounded-lg overflow-hidden">
            <div className="bg-slate-100 border-b border-slate-300 px-6 py-4">
              <p className="font-bold uppercase tracking-widest text-sm text-slate-900">Parties Involved</p>
            </div>
            <div className="divide-y divide-slate-300">
              <div className="px-6 py-4 flex gap-8">
                <span className="w-32 font-bold text-sm uppercase tracking-wider text-slate-700">CLIENT</span>
                <span className="flex-1 text-slate-800">{data.client_name}, {data.client_location}</span>
              </div>
              <div className="px-6 py-4 flex gap-8">
                <span className="w-32 font-bold text-sm uppercase tracking-wider text-slate-700">CONTRACTOR</span>
                <span className="flex-1 text-slate-800">{data.freelancer_name}, {data.freelancer_location}</span>
              </div>
            </div>
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="border-l-4 border-slate-900 pl-4 py-2">
              <p className="text-xs uppercase tracking-widest text-slate-600 font-bold">Effective Date</p>
              <p className="font-semibold text-slate-900">{data.effective_date}</p>
            </div>
            <div className="border-l-4 border-slate-900 pl-4 py-2">
              <p className="text-xs uppercase tracking-widest text-slate-600 font-bold">Budget</p>
              <p className="font-semibold text-slate-900">{data.budget}</p>
            </div>
          </div>

          {/* Scope Section */}
          <div className="mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-slate-900 pb-2">Scope of Work</h2>
            <p className="text-slate-800 leading-relaxed">{data.scope_of_work}</p>
          </div>

          {/* Compensation Section */}
          <div className="mb-8 bg-slate-50 border border-slate-300 rounded-lg p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-3">Compensation</h2>
            <div className="space-y-2 text-slate-800">
              <div className="flex gap-4">
                <span className="font-bold w-40">Total Amount:</span>
                <span>{data.budget}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-bold w-40">Payment Terms:</span>
                <span>{data.payment_terms}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-bold w-40">Timeline:</span>
                <span>{data.timeline}</span>
              </div>
            </div>
          </div>

          {/* Full Contract */}
          <div className="mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-slate-900 pb-2">Terms & Conditions</h2>
            <pre className="whitespace-pre-wrap font-sans text-xs leading-[1.7] text-slate-800">
              {contractText}
            </pre>
          </div>

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t-2 border-slate-900">
            <div>
              <p className="mb-6 h-1 border-b border-slate-900"></p>
              <p className="font-bold text-slate-900 uppercase tracking-wider text-sm">Client</p>
              <p className="text-xs text-slate-600 mt-1">Date: _______________</p>
            </div>
            <div>
              <p className="mb-6 h-1 border-b border-slate-900"></p>
              <p className="font-bold text-slate-900 uppercase tracking-wider text-sm">Contractor</p>
              <p className="text-xs text-slate-600 mt-1">Date: _______________</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 uppercase">
            © 2026 Professional Services | Governed by Laws of {data.jurisdiction}
          </div>
        </div>
      </div>
    </>
  );
};

// 4. PROFESSIONAL AGREEMENT TEMPLATE (Blue & Modern)
export const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, contractText }) => {
  return (
    <>
      <div className="contract-document-wrapper bg-white text-slate-900 max-w-4xl mx-auto">
        {/* Blue Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-12 py-12 rounded-t-2xl mb-0">
          <h1 className="text-4xl font-bold mb-2">CONTRACT AND AGREEMENT</h1>
          <p className="text-blue-100">Professional Services Engagement</p>
        </div>

        <div className="px-12 py-12">
          {/* Parties Section */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">Parties Involved</h2>
            <div className="grid grid-cols-2 gap-8 bg-blue-50 p-6 rounded-lg">
              <div>
                <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">Client</p>
                <p className="font-semibold text-slate-900">{data.client_name}</p>
                <p className="text-sm text-slate-600">{data.client_location}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">Service Provider</p>
                <p className="font-semibold text-slate-900">{data.freelancer_name}</p>
                <p className="text-sm text-slate-600">{data.freelancer_location}</p>
              </div>
            </div>
          </div>

          {/* Purpose Section */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">Purpose of Agreement</h2>
            <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-blue-600">
              <p className="text-slate-800 leading-relaxed">
                This agreement formalizes the engagement between the Client and Service Provider for the provision of professional services as detailed below. The terms, conditions, and deliverables are outlined to ensure mutual understanding and successful project completion.
              </p>
            </div>
          </div>

          {/* Scope of Work */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">Scope of Work</h2>
            <div className="space-y-3">
              <div className="bg-white border-l-4 border-blue-600 pl-4 py-3">
                <p className="text-slate-800">{data.scope_of_work}</p>
              </div>
            </div>
          </div>

          {/* Key Terms */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">Compensation</p>
              <p className="text-lg font-bold text-slate-900 truncate">{data.budget}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">Timeline</p>
              <p className="text-sm font-semibold text-slate-900">{data.timeline}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">Jurisdiction</p>
              <p className="text-sm font-semibold text-slate-900">{data.jurisdiction}</p>
            </div>
          </div>

          {/* Full Contract */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">Terms & Conditions</h2>
            <div className="bg-slate-50 p-6 rounded-lg">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-[1.6] text-slate-800">
                {contractText}
              </pre>
            </div>
          </div>

          {/* Signature */}
          <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t-2 border-blue-600">
            <div>
              <p className="mb-8 h-1 border-b-2 border-blue-300"></p>
              <p className="font-bold text-slate-900">Client Signature</p>
              <p className="text-xs text-slate-600 mt-2">Date: _______________</p>
            </div>
            <div>
              <p className="mb-8 h-1 border-b-2 border-blue-300"></p>
              <p className="font-bold text-slate-900">Service Provider Signature</p>
              <p className="text-xs text-slate-600 mt-2">Date: _______________</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// 5. MINIMAL LEGAL TEMPLATE (Offer Letter Style)
export const LegalTemplate: React.FC<TemplateProps> = ({ data, contractText }) => {
  return (
    <>
      <div className="contract-document-wrapper bg-white text-slate-800 max-w-4xl mx-auto p-12 font-serif">
        {/* Minimal Header */}
        <div className="text-center mb-12" style={{ borderTop: "3px solid #000", paddingTop: "1.5rem" }}>
          <h1 className="text-2xl font-bold tracking-wide mb-1">FREELANCE SERVICES AGREEMENT</h1>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-600">CONTRACT</p>
        </div>

        {/* Letterhead-style info */}
        <div className="grid grid-cols-2 gap-8 mb-12 text-xs">
          <div>
            <p><strong>Client:</strong> {data.client_name}</p>
            <p><strong>Address:</strong> {data.client_location}</p>
          </div>
          <div className="text-right">
            <p><strong>Status:</strong> FINAL</p>
            <p><strong>ID:</strong> [DOCUMENT_ID]</p>
          </div>
        </div>

        {/* Opening */}
        <div className="mb-8 leading-[1.8] text-sm">
          <p className="mb-4">Dear {data.client_name},</p>
          <p className="mb-4">
            This agreement (&quot;Agreement&quot;) is made effective as of <strong>{data.effective_date}</strong> between {data.client_name} (&quot;Client&quot;) and {data.freelancer_name} (&quot;Contractor&quot;).
          </p>
        </div>

        {/* Structured Sections in Table Style */}
        <div className="mb-8 space-y-4 text-sm">
          <table className="w-full border-collapse text-xs" style={{ borderCollapse: "collapse" }}>
            <tbody>
              <tr style={{ borderTop: "1px solid #000", borderBottom: "1px solid #000" }}>
                <td className="p-3 font-bold w-1/3 align-top">Scope of Services:</td>
                <td className="p-3">{data.scope_of_work}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <td className="p-3 font-bold w-1/3 align-top">Compensation:</td>
                <td className="p-3">{data.budget}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <td className="p-3 font-bold w-1/3 align-top">Payment Terms:</td>
                <td className="p-3">{data.payment_terms}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <td className="p-3 font-bold w-1/3 align-top">Expected Timeline:</td>
                <td className="p-3">{data.timeline}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #000" }}>
                <td className="p-3 font-bold w-1/3 align-top">Jurisdiction:</td>
                <td className="p-3">{data.jurisdiction}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Full Agreement */}
        <div className="mb-8 text-xs leading-[1.8]">
          <pre className="whitespace-pre-wrap font-serif">
            {contractText}
          </pre>
        </div>

        {/* Signature Section */}
        <div className="mt-12 space-y-8 text-xs">
          <div>
            <p className="mb-2">In witness whereof, the parties execute this Agreement:</p>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p style={{ borderTop: "1px solid #000", marginBottom: "0.5rem", height: "2rem" }}></p>
              <p className="font-semibold">{data.client_name} (Client)</p>
              <p className="text-slate-600">Signature / Date</p>
            </div>
            <div>
              <p style={{ borderTop: "1px solid #000", marginBottom: "0.5rem", height: "2rem" }}></p>
              <p className="font-semibold">{data.freelancer_name} (Contractor)</p>
              <p className="text-slate-600">Signature / Date</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid #000" }}>
          <p className="text-center text-xs text-slate-600">
            This agreement is governed by the laws of {data.jurisdiction}.
            <br />
            © 2026. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

// Template Registry
export const TEMPLATES: Record<TemplateType, React.FC<TemplateProps>> = {
  Basic: BasicTemplate,
  Influencer: InfluencerTemplate,
  Corporate: CorporateTemplate,
  Professional: ProfessionalTemplate,
  Legal: LegalTemplate,
};

export const TEMPLATE_INFO: Record<TemplateType, { title: string; description: string; color: string }> = {
  Basic: {
    title: "Basic",
    description: "Simple and professional",
    color: "slate",
  },
  Influencer: {
    title: "Creative",
    description: "Vibrant and modern",
    color: "pink",
  },
  Corporate: {
    title: "Corporate",
    description: "Formal and structured",
    color: "slate",
  },
  Professional: {
    title: "Professional",
    description: "Modern and clear",
    color: "blue",
  },
  Legal: {
    title: "Legal",
    description: "Traditional and formal",
    color: "slate",
  },
};
