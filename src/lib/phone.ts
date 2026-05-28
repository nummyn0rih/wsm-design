// Phone storage: E.164 RU only — /^\+7\d{10}$/.

const E164_RU = /^\+7\d{10}$/;

export function normalizePhoneRu(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = '7' + digits.slice(1);
  if (digits.length === 10) digits = '7' + digits;
  if (digits.length !== 11 || !digits.startsWith('7')) return null;
  return '+' + digits;
}

export function formatPhoneRu(e164: string): string {
  if (!E164_RU.test(e164)) return e164;
  // +7XXXXXXXXXX → +7 (XXX) XXX-XX-XX
  const d = e164.slice(2);
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
}

export function phoneTelUri(e164: string): string {
  return `tel:${e164}`;
}
