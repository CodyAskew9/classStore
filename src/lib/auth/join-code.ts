const JOIN_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeJoinCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function generateJoinCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += JOIN_CODE_CHARS[Math.floor(Math.random() * JOIN_CODE_CHARS.length)];
  }
  return code;
}

export function isValidJoinCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{4,12}$/.test(code);
}
