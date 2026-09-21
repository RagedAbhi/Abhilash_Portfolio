"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSiteStore } from "@/lib/store";
import type { SiteMeta, FunFact } from "@/lib/keystatic/content";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { DownloadIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import {
  CONTACT_LIMITS,
  WEB3FORMS_HCAPTCHA_SITEKEY,
  isContactFormConfigured,
  submitContact,
  validateContact,
  type ContactErrors,
  type ContactFields,
  type SubmitResult,
} from "@/lib/contact-form";
import { FunFactCards } from "./FunFactCards";
import { buildContactReveal } from "./Contact.animations";

type FormStatus = "idle" | "sending" | "sent" | "error";
type FailureReason = Extract<SubmitResult, { ok: false }>["reason"];

const EMPTY_FORM: ContactFields = { name: "", email: "", message: "" };
const FIELD_ORDER = ["name", "email", "message"] as const;

// After a successful send the button stays locked for this long — a cheap
// guard against double-submits and accidental re-sends.
const SENT_COOLDOWN_MS = 60_000;

const SUCCESS_MESSAGE = "Thanks — your message is on its way. I'll reply as soon as I can.";

const FAILURE_MESSAGES: Record<FailureReason, string> = {
  rate_limited: "Too many messages from your connection just now. Please try again in a while.",
  rejected: "The message couldn't be sent. Please try again in a moment.",
  network: "Couldn't reach the server. Check your connection and try again.",
  unconfigured: "The contact form isn't available right now.",
};

export function Contact({ site, funFacts }: { site: SiteMeta; funFacts: FunFact[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const submittingRef = useRef(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();
  const theme = useSiteStore((state) => state.theme);

  const [form, setForm] = useState<ContactFields>(EMPTY_FORM);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [notice, setNotice] = useState<string | null>(null);
  // hCaptcha is a third-party script, so its widget is only mounted once the
  // visitor actually starts using the form — most visitors never do.
  const [captchaActive, setCaptchaActive] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  useEffect(() => {
    const cooldown = cooldownRef;
    return () => {
      if (cooldown.current) clearTimeout(cooldown.current);
    };
  }, []);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !glowRef.current ||
        !headlineRef.current ||
        !pillsRef.current ||
        !dividerRef.current ||
        !fieldsRef.current
      ) {
        return;
      }
      return buildContactReveal(
        {
          section: sectionRef.current,
          glow: glowRef.current,
          headline: headlineRef.current,
          pills: Array.from(pillsRef.current.children) as HTMLElement[],
          divider: dividerRef.current,
          formFields: Array.from(fieldsRef.current.children) as HTMLElement[],
        },
        reducedMotion,
      );
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  const fieldRefs = { name: nameRef, email: emailRef, message: messageRef };

  const resetCaptcha = () => {
    captchaRef.current?.resetCaptcha();
    setCaptchaToken(null);
  };

  const showSuccess = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setStatus("sent");
    setNotice(SUCCESS_MESSAGE);
    resetCaptcha();
    if (cooldownRef.current) clearTimeout(cooldownRef.current);
    cooldownRef.current = setTimeout(() => {
      setStatus("idle");
      setNotice(null);
    }, SENT_COOLDOWN_MS);
  };

  const updateField =
    (field: keyof ContactFields) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      // Once a field is showing an error, re-check it live so the message
      // clears the moment the problem is fixed.
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: validateContact({ ...form, [field]: value })[field] }));
      }
    };

  // Empty fields are only flagged on submit — flagging them just for being
  // tabbed through would nag before the visitor has typed anything.
  const validateOnBlur = (field: keyof ContactFields) => () => {
    if (!form[field].trim()) return;
    setErrors((prev) => ({ ...prev, [field]: validateContact(form)[field] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current || status === "sending" || status === "sent") return;

    // Honeypot: a real visitor can't see or reach this checkbox. If it's
    // ticked, a bot filled the form — act like it worked and send nothing.
    if (honeypotRef.current?.checked) {
      showSuccess();
      return;
    }

    const found = validateContact(form);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) {
      setStatus("idle");
      setNotice(null);
      fieldRefs[firstInvalid].current?.focus();
      return;
    }

    if (isContactFormConfigured && !captchaToken) {
      setCaptchaActive(true);
      setCaptchaError("Please complete the captcha.");
      return;
    }
    setCaptchaError(null);

    submittingRef.current = true;
    setStatus("sending");
    setNotice(null);

    const result = await submitContact(form, captchaToken);
    submittingRef.current = false;

    if (result.ok) {
      showSuccess();
      return;
    }
    // A captcha token is single-use — whatever went wrong, a retry needs a fresh one.
    resetCaptcha();
    setStatus("error");
    setNotice(FAILURE_MESSAGES[result.reason]);
  };

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full rounded-md border bg-transparent px-4 py-3 text-sm text-fg outline-none transition-all duration-300 placeholder:text-fg-muted/50 focus:ring-2",
      hasError
        ? "border-danger focus:border-danger focus:ring-danger/20"
        : "border-fg/15 focus:border-accent focus:ring-accent/20",
    );

  // Sits under its field without taking layout space (it lives in the gap
  // between fields), so showing/hiding an error never shifts the section.
  const errorClass = "absolute left-0 top-full pt-1 text-xs text-danger";

  const pillClass =
    "group relative overflow-hidden rounded-full border border-fg/15 px-6 py-3 font-mono text-xs uppercase tracking-widest text-fg transition-colors duration-300 hover:border-accent hover:text-bg";

  return (
    <div
      ref={sectionRef}
      id="contact"
      className="relative flex min-h-screen flex-col overflow-hidden px-6 py-20 sm:px-10 md:flex-row md:items-center md:gap-16 md:py-24"
    >
      {/* The same soft radial-blur motif used behind Hero's and About's
          portrait, so the only color in this section reads as a continuation
          of the site's language — with a slow, ambient breathing drift. */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 h-[55vw] w-[55vw] max-h-[700px] max-w-[700px] rounded-full bg-accent/25 blur-[140px]"
      />

      <div className="relative flex flex-col justify-between gap-12 md:w-[42%]">
        <div>
          <span className="font-mono text-lg uppercase tracking-widest text-accent sm:text-2xl">
            05 — Contact
          </span>
          <h2
            ref={headlineRef}
            className="mt-6 max-w-md font-display text-5xl leading-[1.05] tracking-tight text-fg sm:text-7xl"
          >
            {site.contactHeadline}
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          <div ref={pillsRef} className="flex flex-wrap gap-3">
            <MagneticButton href={`mailto:${site.email}`} className={pillClass}>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-accent transition-transform duration-300 ease-out group-hover:translate-x-0" />
              <span className="relative">{site.email}</span>
            </MagneticButton>
            {site.socials.map((social) => (
              <MagneticButton
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={pillClass}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-accent transition-transform duration-300 ease-out group-hover:translate-x-0" />
                <span className="relative">{social.label}</span>
              </MagneticButton>
            ))}
          </div>
          {site.resumeUrl && (
            <a
              href={site.resumeUrl}
              download
              data-cursor="link"
              className="flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-fg-muted transition-colors hover:text-fg"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Download Resume
            </a>
          )}
        </div>
      </div>

      <div className="relative mt-16 pt-16 md:mt-0 md:flex-1 md:pl-16 md:pt-0">
        <div
          ref={dividerRef}
          aria-hidden
          className="absolute left-0 top-0 h-px w-full bg-accent/30 md:h-full md:w-px"
        />
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onFocus={() => setCaptchaActive(true)}
          noValidate
          className="flex w-full max-w-md flex-col gap-5"
        >
          {/* Each direct child of this wrapper is staggered in by
              buildContactReveal — keep the honeypot and status line outside it. */}
          <div ref={fieldsRef} className="flex flex-col gap-6">
            <label className="relative flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                Name
              </span>
              <input
                ref={nameRef}
                type="text"
                name="name"
                autoComplete="name"
                maxLength={CONTACT_LIMITS.nameMax}
                placeholder="Jane Doe"
                value={form.name}
                onChange={updateField("name")}
                onBlur={validateOnBlur("name")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                className={inputClass(Boolean(errors.name))}
              />
              {errors.name && (
                <p id="contact-name-error" className={errorClass}>
                  {errors.name}
                </p>
              )}
            </label>
            <label className="relative flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                Email
              </span>
              <input
                ref={emailRef}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                maxLength={CONTACT_LIMITS.emailMax}
                placeholder="jane@example.com"
                value={form.email}
                onChange={updateField("email")}
                onBlur={validateOnBlur("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                className={inputClass(Boolean(errors.email))}
              />
              {errors.email && (
                <p id="contact-email-error" className={errorClass}>
                  {errors.email}
                </p>
              )}
            </label>
            <label className="relative flex flex-col gap-1.5">
              <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                Message
                {form.message.length > 0 && (
                  <span aria-hidden className="text-fg-muted/60">
                    {form.message.length}/{CONTACT_LIMITS.messageMax}
                  </span>
                )}
              </span>
              <textarea
                ref={messageRef}
                name="message"
                rows={4}
                maxLength={CONTACT_LIMITS.messageMax}
                placeholder="What are you building?"
                value={form.message}
                onChange={updateField("message")}
                onBlur={validateOnBlur("message")}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "contact-message-error" : undefined}
                className={cn(inputClass(Boolean(errors.message)), "resize-none")}
              />
              {errors.message && (
                <p id="contact-message-error" className={errorClass}>
                  {errors.message}
                </p>
              )}
            </label>
            {isContactFormConfigured && (
              <div className="relative">
                {/* Fixed-size slot so the widget loading in never shifts the layout. */}
                <div
                  className={cn(
                    "flex h-[78px] w-full max-w-[303px] items-center justify-center overflow-hidden rounded-md",
                    !captchaActive &&
                      "border border-dashed border-fg/15 font-mono text-[10px] uppercase tracking-widest text-fg-muted/60",
                  )}
                >
                  {captchaActive ? (
                    <HCaptcha
                      ref={captchaRef}
                      sitekey={WEB3FORMS_HCAPTCHA_SITEKEY}
                      theme={theme}
                      reCaptchaCompat={false}
                      onVerify={(token) => {
                        setCaptchaToken(token);
                        setCaptchaError(null);
                      }}
                      onExpire={() => setCaptchaToken(null)}
                      onError={() => {
                        setCaptchaToken(null);
                        setCaptchaError("The captcha couldn't load. Please refresh the page and try again.");
                      }}
                    />
                  ) : (
                    "Spam check loads here"
                  )}
                </div>
                {captchaError && <p className={errorClass}>{captchaError}</p>}
              </div>
            )}
            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              aria-busy={status === "sending"}
              data-cursor="link"
              // Disabled state is shown through colour, not opacity: the reveal
              // animation leaves an inline opacity on this element that would
              // override any opacity class.
              className="mt-2 w-fit rounded-full bg-accent px-8 py-3 font-mono text-sm uppercase tracking-widest text-bg transition-all duration-300 enabled:hover:scale-[1.03] enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:bg-accent/60"
            >
              {status === "sending"
                ? "Sending…"
                : status === "sent"
                  ? "Sent — thank you"
                  : "Send Message"}
            </button>
          </div>

          {/* Honeypot — invisible and unreachable for real visitors; a bot that
              fills every field will tick it (see handleSubmit). */}
          <div aria-hidden className="sr-only">
            <label>
              Leave this box unchecked
              <input
                ref={honeypotRef}
                type="checkbox"
                name="botcheck"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          <div aria-live="polite" className="min-h-5 text-sm">
            {notice && (
              <p
                role={status === "error" ? "alert" : undefined}
                className={status === "sent" ? "text-accent" : "text-danger"}
              >
                {notice}
                {status === "error" && (
                  <>
                    {" "}
                    Or{" "}
                    <a
                      href={`mailto:${site.email}`}
                      data-cursor="link"
                      className="underline underline-offset-4 transition-opacity hover:opacity-80"
                    >
                      email me directly
                    </a>
                    .
                  </>
                )}
              </p>
            )}
          </div>
        </form>
      </div>

      {funFacts.length > 0 && (
        <div className="absolute bottom-6 right-6 z-10 sm:bottom-10 sm:right-10">
          <FunFactCards facts={funFacts} />
        </div>
      )}
    </div>
  );
}
