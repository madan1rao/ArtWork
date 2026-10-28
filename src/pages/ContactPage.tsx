import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { photoService } from '@/services/photoService';
import { submitInquiry, type Inquiry } from '@/services/inquiryService';
import { useAsync } from '@/hooks/useAsync';
import { usePageTitle } from '@/hooks/usePageTitle';
import { site } from '@/config/site';
import { PageHeader } from '@/components/ui/PageHeader';
import { ArrowRight } from '@/components/ui/Icons';

const TYPES = ['Purchase an artwork', 'Commission a work', 'Private viewing / visit', 'Exhibition or partnership', 'Press', 'Other'];

type Errors = Partial<Record<keyof Inquiry | 'consent', string>>;

function validate(form: Inquiry, consent: boolean): Errors {
  const e: Errors = {};
  if (form.name.trim().length < 2) e.name = 'Please tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Please enter a valid email address.';
  if (form.phone && !/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())) e.phone = 'That phone number doesn’t look right.';
  if (!form.type) e.type = 'Please choose what your inquiry is about.';
  if (form.message.trim().length < 10) e.message = 'Please add a little more detail (at least 10 characters).';
  if (!consent) e.consent = 'Please agree so we can reply to you.';
  return e;
}

export default function ContactPage() {
  usePageTitle('Contact');
  const [params] = useSearchParams();
  const { hash } = useLocation();

  // This page loads lazily, so the router's own #hash scroll can miss the form.
  useEffect(() => {
    if (hash !== '#inquiry') return;
    const t = window.setTimeout(() => document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' }), 50);
    return () => window.clearTimeout(t);
  }, [hash]);
  const { data: works = [] } = useAsync(() => photoService.listPhotos(), []);
  const preselected = works.find((w) => w.id === params.get('artwork'));

  const [form, setForm] = useState<Inquiry>({ name: '', email: '', phone: '', type: '', artwork: '', message: '' });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent-endpoint' | 'sent-email' | 'error'>('idle');

  // An artwork chosen via "Inquire about this work" pre-fills the form once.
  const artwork = form.artwork || (preselected ? `${preselected.title} — ${preselected.author}` : '');
  const type = form.type || (preselected ? 'Purchase an artwork' : '');

  const set = <K extends keyof Inquiry>(key: K, value: Inquiry[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Honeypot: real people never fill this hidden field.
    if (new FormData(e.currentTarget).get('website')) return;
    const data = { ...form, artwork, type };
    const found = validate(data, consent);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`field-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      const res = await submitInquiry(data);
      setStatus(res.via === 'endpoint' ? 'sent-endpoint' : 'sent-email');
    } catch {
      setStatus('error');
    }
  };

  const sent = status === 'sent-endpoint' || status === 'sent-email';

  return (
    <>
      <PageHeader eyebrow="Contact" title={<>Get in <em>touch</em></>}>
        Questions about a work, a commission or a visit? We’d love to hear from you.
      </PageHeader>

      <div className="container-page grid gap-14 lg:grid-cols-[1fr_1.6fr]">
        <aside className="space-y-8">
          <ContactDetail label="Email">
            <a href={`mailto:${site.email}`} className="hover:text-accent">
              {site.email}
            </a>
          </ContactDetail>
          <ContactDetail label="Phone">{site.phone}</ContactDetail>
          <ContactDetail label="Visit">{site.address}</ContactDetail>
          <ContactDetail label="Opening hours">{site.hours}</ContactDetail>
        </aside>

        <section id="inquiry" aria-labelledby="inquiry-heading" className="scroll-mt-24 rounded-sm border border-line bg-paper-2 p-6 md:p-10">
          <p className="eyebrow">Inquiry / Contact Form</p>
          <h2 id="inquiry-heading" className="display mt-3 text-4xl md:text-5xl">
            Send an inquiry
          </h2>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-sm border border-line p-8"
                role="status"
              >
                <p className="display text-3xl">Thank you, {form.name.split(' ')[0]}.</p>
                <p className="mt-3 text-ink-soft">
                  {status === 'sent-endpoint'
                    ? 'Your inquiry has been sent. We’ll reply to ' + form.email + ' soon.'
                    : 'Your email app should have opened with your inquiry ready to send. If it didn’t, email us directly at ' + site.email + '.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setForm({ name: '', email: '', phone: '', type: '', artwork: '', message: '' });
                    setConsent(false);
                  }}
                  className="mt-6 text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
                >
                  Send another inquiry
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" noValidate onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2" exit={{ opacity: 0 }}>
                <Field id="name" label="Full name" required error={errors.name}>
                  <input id="field-name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} className={input(errors.name)} />
                </Field>
                <Field id="email" label="Email" required error={errors.email}>
                  <input id="field-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={input(errors.email)} />
                </Field>
                <Field id="phone" label="Phone" hint="Optional" error={errors.phone}>
                  <input id="field-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={input(errors.phone)} />
                </Field>
                <Field id="type" label="Inquiry about" required error={errors.type}>
                  <select id="field-type" value={type} onChange={(e) => set('type', e.target.value)} className={input(errors.type)}>
                    <option value="" disabled>
                      Choose one…
                    </option>
                    {TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field id="artwork" label="Artwork of interest" hint="Optional" wide>
                  <select id="field-artwork" value={artwork} onChange={(e) => set('artwork', e.target.value)} className={input()}>
                    <option value="">None in particular</option>
                    {works
                      .filter((w) => w.category !== 'photography')
                      .map((w) => (
                        <option key={w.id}>{`${w.title} — ${w.author}`}</option>
                      ))}
                  </select>
                </Field>
                <Field id="message" label="Message" required error={errors.message} wide>
                  <textarea
                    id="field-message"
                    rows={6}
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    className={`${input(errors.message)} h-auto resize-y py-3`}
                  />
                </Field>

                {/* Honeypot */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

                <div className="sm:col-span-2">
                  <label className="flex items-start gap-3 text-sm text-ink-soft">
                    <input
                      id="field-consent"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked);
                        setErrors((x) => ({ ...x, consent: undefined }));
                      }}
                      className="mt-0.5 size-4 accent-[var(--color-accent)]"
                    />
                    I agree to {site.name} using these details to reply to my inquiry.
                  </label>
                  {errors.consent && <p className="mt-2 text-xs text-[#f97362]">{errors.consent}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
                  >
                    {status === 'sending' ? 'Sending…' : 'Send inquiry'}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                  {status === 'error' && (
                    <p className="text-sm text-[#f97362]" role="alert">
                      Something went wrong. Please try again, or email {site.email}.
                    </p>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </section>
      </div>
    </>
  );
}

const input = (error?: string) =>
  `h-12 w-full rounded-sm border bg-paper px-4 text-sm text-ink placeholder:text-ink-mute focus:outline-none ${
    error ? 'border-[#f97362]' : 'border-line focus:border-ink'
  }`;

function Field({
  id,
  label,
  required,
  hint,
  error,
  wide,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <label htmlFor={`field-${id}`} className="mb-2 flex items-baseline justify-between text-xs text-ink-soft">
        <span>
          {label}
          {required && <span className="text-accent"> *</span>}
        </span>
        {hint && <span className="text-ink-mute">{hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-[#f97362]">{error}</p>}
    </div>
  );
}

function ContactDetail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-line pt-5">
      <p className="eyebrow">{label}</p>
      <p className="display mt-2 text-2xl md:text-3xl">{children}</p>
    </div>
  );
}
