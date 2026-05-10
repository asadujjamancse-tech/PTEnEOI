const jsonHeaders = { "Content-Type": "application/json" };

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { ...jsonHeaders, ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed: ${path}`);
  return data;
}

export const apiClient = {
  essayFeedback: (essay) => request("/api/openai/essay-feedback", {
    method: "POST",
    body: JSON.stringify({ essay }),
  }),
  tutorChat: (messages) => request("/api/openai/tutor-chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  }),
  billingCheckout: (planId) => request("/api/billing/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({ planId }),
  }),
  billingPortal: () => request("/api/billing/portal", { method: "POST" }),
  supabaseConfig: () => request("/api/supabase/config"),
};

export function isPremiumEnabled(profile = {}) {
  return profile.subscriptionStatus === "active" || profile.plan === "premium";
}
