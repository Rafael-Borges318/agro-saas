export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calc = (mod: number) =>
    digits.slice(0, mod).split('').reduce((acc, d, i) => acc + Number(d) * (mod + 1 - i), 0);

  const r1 = (calc(9) * 10) % 11;
  const r2 = (calc(10) * 10) % 11;

  return (r1 >= 10 ? 0 : r1) === Number(digits[9]) &&
         (r2 >= 10 ? 0 : r2) === Number(digits[10]);
}

export function isValidPhone(phone: string): boolean {
  return /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(phone.trim());
}
