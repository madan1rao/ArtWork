import { site } from '@/config/site';

export interface Inquiry {
  name: string;
  email: string;
  phone: string;
  type: string;
  artwork: string;
  message: string;
}

export type InquiryResult = { via: 'endpoint' } | { via: 'email' };

const ENDPOINT = import.meta.env.VITE_INQUIRY_ENDPOINT as string | undefined;

/**
 * Sends an inquiry. With `VITE_INQUIRY_ENDPOINT` set (e.g. a Formspree URL or your own
 * API) it POSTs JSON there; otherwise it opens the visitor's mail app with the inquiry
 * pre-filled, addressed to `site.email`.
 */
export async function submitInquiry(inquiry: Inquiry): Promise<InquiryResult> {
  if (ENDPOINT) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(inquiry),
    });
    if (!res.ok) throw new Error(`Inquiry failed (${res.status})`);
    return { via: 'endpoint' };
  }

  const body = [
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : null,
    `Inquiry: ${inquiry.type}`,
    inquiry.artwork ? `Artwork: ${inquiry.artwork}` : null,
    '',
    inquiry.message,
  ]
    .filter((line) => line !== null)
    .join('\n');
  const subject = `${inquiry.type} — ${inquiry.name}`;
  window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { via: 'email' };
}
