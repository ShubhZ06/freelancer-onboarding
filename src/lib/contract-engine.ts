export type FreelancerType =
  | "Software Development"
  | "Design"
  | "Digital Marketing"
  | "Video Editing"
  | "Writing"
  | "Consulting"
  | "General Freelancing";

export interface ContractInput {
  client_name?: string;
  client_email?: string;
  client_location?: string;
  freelancer_name?: string;
  freelancer_location?: string;
  freelancer_email?: string;
  freelancer_phone?: string;
  freelancer_business_name?: string;
  freelancer_business_location?: string;
  freelancer_business_registration_number?: string;
  jurisdiction?: string;
  project_type?: string;
  scope_of_work?: string;
  budget?: string;
  payment_model?: "Fixed" | "Hourly";
  hourly_rate?: string;
  payment_terms?: string;
  timeline?: string;
  freelancer_type?: FreelancerType;
  effective_date?: string;
}

export interface ContractResult {
  summary: string;
  contract: string;
  isDraft: boolean;
  detectedType: FreelancerType;
  selectedTemplate: "Free" | "Premium" | "Modern Corporate";
}

const DEFAULT_VALUE = "To be confirmed";

export function detectFreelancerType(input: ContractInput): FreelancerType {
  if (input.freelancer_type) return input.freelancer_type;

  const text = `${input.project_type || ""} ${input.scope_of_work || ""}`.toLowerCase();

  if (/app|website|web|software|backend|frontend|ai|automation|code|develop|api|database/.test(text)) {
    return "Software Development";
  }
  if (/design|ui|ux|branding|logo|graphic|illustration|figma|adobe/.test(text)) {
    return "Design";
  }
  if (/seo|ads|marketing|funnel|social media|traffic|campaign/.test(text)) {
    return "Digital Marketing";
  }
  if (/video|edit|reel|youtube|post-production|motion|film/.test(text)) {
    return "Video Editing";
  }
  if (/write|blog|copy|script|content|article|plagiarism/.test(text)) {
    return "Writing";
  }
  if (/consult|strategy|advisor|business|coaching/.test(text)) {
    return "Consulting";
  }

  return "General Freelancing";
}

export function generateContract(input: ContractInput): ContractResult {
  const isDraft = Object.entries(input).length < 8;
  const type = detectFreelancerType(input);

  const data = {
    client_name: input.client_name || DEFAULT_VALUE,
    client_email: input.client_email || DEFAULT_VALUE,
    client_location: input.client_location || DEFAULT_VALUE,
    freelancer_name: input.freelancer_name || DEFAULT_VALUE,
    freelancer_location: input.freelancer_location || DEFAULT_VALUE,
    freelancer_email: input.freelancer_email || DEFAULT_VALUE,
    freelancer_phone: input.freelancer_phone || DEFAULT_VALUE,
    freelancer_business_name: input.freelancer_business_name || DEFAULT_VALUE,
    freelancer_business_location: input.freelancer_business_location || DEFAULT_VALUE,
    freelancer_business_registration_number: input.freelancer_business_registration_number || DEFAULT_VALUE,
    jurisdiction: input.jurisdiction || DEFAULT_VALUE,
    project_type: input.project_type || DEFAULT_VALUE,
    scope_of_work: input.scope_of_work || DEFAULT_VALUE,
    budget: input.budget || DEFAULT_VALUE,
    payment_model: input.payment_model || "Fixed",
    hourly_rate: input.hourly_rate || "",
    payment_terms: input.payment_terms || DEFAULT_VALUE,
    timeline: input.timeline || DEFAULT_VALUE,
    effective_date: input.effective_date || new Date().toLocaleDateString(),
  };

  // 1. PLAIN ENGLISH SUMMARY
  let summary = `1. PLAIN ENGLISH SUMMARY\n\n`;
  summary += `• Work Description: ${data.project_type}\n`;
  summary += `• Client Contact Email: ${data.client_email}\n`;
  summary += `• Total Projected Cost: ${data.payment_model === "Hourly" ? data.hourly_rate + "/hr" : data.budget}\n`;
  summary += `• Expected Timeline: ${data.timeline}\n`;
  summary += `• Payment Terms: ${data.payment_terms}\n`;
  summary += `• Freelancer Contact: ${data.freelancer_email} · ${data.freelancer_phone}\n`;
  summary += `• Freelancer Entity: ${data.freelancer_business_name} (${data.freelancer_business_registration_number})\n`;
  summary += `• Revision Limit: ${type === "Design" ? "3 rounds" : "Standard (2 rounds)"}\n\n`;
  summary += `IMPORTANT: You must respond to the freelancer within 48 hours. If you don't response, the current milestone or work will be automatically approved to keep the project moving.\n`;

  // 2. FULL LEGAL CONTRACT
  let contract = `FREELANCE SERVICES AGREEMENT\n`;
  contract += `Rev. 133EE8E - Standard Multi-Type Protocol\n\n`;
  contract += `State of ${data.jurisdiction}\n\n`;
  contract += `This agreement ("Agreement") is made effective as of ${data.effective_date} (the "Effective Date") by and between:\n\n`;
  contract += `CLIENT: ${data.client_name}, located at ${data.client_location}\n`;
  contract += `CLIENT EMAIL: ${data.client_email}\n`;
  contract += `INDEPENDENT CONTRACTOR: ${data.freelancer_name}, located at ${data.freelancer_location}\n\n`;
  contract += `CONTRACTOR EMAIL: ${data.freelancer_email}\n`;
  contract += `CONTRACTOR PHONE: ${data.freelancer_phone}\n`;
  contract += `CONTRACTOR BUSINESS: ${data.freelancer_business_name}\n`;
  contract += `CONTRACTOR BUSINESS LOCATION: ${data.freelancer_business_location}\n`;
  contract += `CONTRACTOR REGISTRATION NO: ${data.freelancer_business_registration_number}\n\n`;

  if (isDraft) {
    contract += `[DRAFT MODE ACTIVE]: This agreement becomes fully binding once all missing details are confirmed.\n\n`;
  }

  contract += `1. SERVICES\nIndependent Contractor shall provide the following services to Client: ${data.scope_of_work}. Any changes to the scope require a new agreement or additional payment authorization.\n\n`;

  contract += `2. COMPENSATION\n`;
  if (data.payment_model === "Hourly") {
    contract += `Client shall pay Independent Contractor $${data.hourly_rate} per hour. Payments will be made on a weekly basis upon receipt of a valid and detailed invoice.\n\n`;
  } else {
    contract += `Client shall pay Independent Contractor a total set fee of ${data.budget}. ${data.payment_terms}.\n\n`;
  }

  contract += `3. TIMELINE & DELIVERABLES\nThe project is expected to be completed by ${data.timeline}.\n\n`;

  // Type-specific rules
  if (type === "Software Development") {
    contract += `4. MILESTONES & BUGS\nDelivery occurs in phases: [Phase 1: Kickoff, Phase 2: Core Development, Final Delivery]. Critical bug fixes are included for 14 days post-delivery. New feature requests are out-of-scope.\n\n`;
  } else if (type === "Design") {
    contract += `4. REVISIONS & ASSETS\nIncludes up to 3 rounds of minor revisions. Final design files transfer to Client only after full payment is received.\n\n`;
  } else if (type === "Digital Marketing") {
    contract += `4. RESULTS DISCLAIMER\nFreelancer provides professional expertise; however, no specific guarantee of traffic, sales, or conversion results is provided.\n\n`;
  } else if (type === "Video Editing") {
    contract += `4. RAW FOOTAGE & DELAYS\nClient must provide all raw assets on schedule. Any delay in asset delivery will automatically shift the final deadline by the same duration.\n\n`;
  } else if (type === "Writing") {
    contract += `4. PLAGIARISM & TONE\nAll work will be 100% original. Client must approve the initial tone and style direction before full draft production.\n\n`;
  } else if (type === "Consulting") {
    contract += `4. ADVICE-ONLY BASIS\nRecommendations are based on professional experience. Final business implementation and results are the sole responsibility of the Client.\n\n`;
  }

  // System-Injected Rules
  contract += `5. CLIENT RESPONSIBILITIES (AUTO-APPROVAL)\nClient must respond to Communications inside 48 hours. If no response is received, the work is deemed auto-approved. Freelancer is not responsible for delays caused by Client non-response.\n\n`;
  contract += `6. INTELLECTUAL PROPERTY\nAll IP rights are transferred to Client ONLY after full and final payment has been settled.\n\n`;
  contract += `7. TERMINATION & LATE PAYMENTS\nEither party may terminate with 7 days' notice. Late payments will incur a 5% monthly penalty fee.\n\n`;
  contract += `8. GOVERNING LAW\nThis agreement is governed by the laws of the State of ${data.jurisdiction}.\n\n`;

  contract += `SIGNATURES\n\n`;
  contract += `Client: ____________________  Date: __________\n`;
  contract += `Contractor: ________________ Date: __________\n`;

  return {
    summary,
    contract,
    isDraft,
    detectedType: type,
    selectedTemplate: "Free",
  };
}
