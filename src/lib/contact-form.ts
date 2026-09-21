// Validation + delivery for the Contact form, kept free of React so it can be
// reasoned about (and tested) on its own.
//
// Delivery goes straight from the browser to Web3Forms: on their free plan,
// server-side requests are rejected (403) — only browser calls are accepted —
// so there is deliberately no API-route proxy here. Consequences worth
// remembering: the access key below is public by design ("not a secret API
// key"), so anyone can post to Web3Forms with it and skip this file's checks.
// Everything here is therefore UX plus a cheap bot filter (the honeypot); the
// enforcement that actually matters (spam filtering, per-IP rate limiting)
// happens on Web3Forms' side. There is deliberately no captcha: if hCaptcha is
// ever enabled for the form in the Web3Forms dashboard, submissions without a
// token would be rejected, so it has to stay off unless a widget is added back.

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

// Must be referenced literally — Next only inlines `process.env.NEXT_PUBLIC_*`
// into the browser bundle when it can see the exact expression.
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  messageMin: 10,
  messageMax: 2000,
} as const;

const REQUEST_TIMEOUT_MS = 10_000;

export interface ContactFields {
  name: string;
  email: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

export type SubmitResult =
  | { ok: true }
  | { ok: false; reason: "rate_limited" | "rejected" | "network" | "unconfigured" };

// Collapses to a single line: control characters (incl. CR/LF) are dropped, and
// \s in the next step also folds the Unicode line/paragraph separators. Used
// for anything that ends up in the email subject or headers, so a crafted name
// can't inject extra lines there.
export function sanitizeSingleLine(value: string): string {
  return value
    .replace(/\p{Cc}+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Keeps line breaks and tabs, strips every other control character.
export function sanitizeMultiline(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/(?![\n\t])\p{Cc}/gu, "")
    .trim();
}

// The same character set the HTML spec's own <input type="email"> accepts,
// plus a few extra rules the spec's pattern lets through (leading/trailing/
// double dots in the local part, single-label domains, one-letter TLDs).
const EMAIL_PATTERN =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

function isValidEmail(email: string): boolean {
  if (email.length > CONTACT_LIMITS.emailMax || !EMAIL_PATTERN.test(email)) return false;
  const [local, domain] = email.split("@");
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  const tld = domain.slice(domain.lastIndexOf(".") + 1);
  return tld.length >= 2;
}

export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  const name = sanitizeSingleLine(fields.name);
  const email = fields.email.trim();
  const message = sanitizeMultiline(fields.message);

  if (!name) {
    errors.name = "Please tell me your name.";
  } else if (name.length < CONTACT_LIMITS.nameMin) {
    errors.name = "That looks too short — please enter your name.";
  } else if (name.length > CONTACT_LIMITS.nameMax) {
    errors.name = `Please keep your name under ${CONTACT_LIMITS.nameMax} characters.`;
  }

  if (!email) {
    errors.email = "Please enter your email so I can reply.";
  } else if (!isValidEmail(email)) {
    errors.email = "That doesn't look like a valid email address.";
  }

  if (!message) {
    errors.message = "Please write a message.";
  } else if (message.length < CONTACT_LIMITS.messageMin) {
    errors.message = `Please write a little more (at least ${CONTACT_LIMITS.messageMin} characters).`;
  } else if (message.length > CONTACT_LIMITS.messageMax) {
    errors.message = `Please keep your message under ${CONTACT_LIMITS.messageMax} characters.`;
  }

  return errors;
}

export async function submitContact(fields: ContactFields): Promise<SubmitResult> {
  if (!ACCESS_KEY) return { ok: false, reason: "unconfigured" };

  const name = sanitizeSingleLine(fields.name);
  const email = fields.email.trim();
  const message = sanitizeMultiline(fields.message);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      // JSON is required: sending this form-encoded via fetch runs into a
      // redirect that browsers block on CORS grounds.
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "omit",
      signal: controller.signal,
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `Portfolio message from ${name}`,
        from_name: "Portfolio Contact Form",
        name,
        email,
        replyto: email,
        message,
        botcheck: false,
      }),
    });

    if (response.status === 429) return { ok: false, reason: "rate_limited" };

    let data: { success?: boolean; message?: string } | null = null;
    try {
      data = await response.json();
    } catch {
      // Non-JSON body — treated as a failure below.
    }

    if (response.ok && data?.success === true) return { ok: true };

    // Web3Forms' own error text is for the console only (it never contains
    // the visitor's input); visitors get the mapped friendly message instead.
    console.warn("Web3Forms rejected the submission:", response.status, data?.message);
    return { ok: false, reason: "rejected" };
  } catch {
    // Offline, DNS/CORS failure, or our own 10s timeout abort.
    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timeout);
  }
}
