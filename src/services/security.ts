export function sanitizePath(inputPath: string): string {
  // Normalize and reject attempts to traverse outside
  const cleaned = inputPath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (cleaned.includes('../') || cleaned === '..') {
    throw new Error('Path traversal sequence (..) is disallowed.');
  }
  return cleaned;
}

export function validateSafeCommand(cmd: string): { safe: boolean; warning?: string } {
  const dangerousPatterns = [
    { pattern: /rm\s+-rf\s+\/($|\s)/i, reason: 'Root deletion command rejected' },
    { pattern: /mkfs/i, reason: 'Filesystem format command rejected' },
    { pattern: /dd\s+if=/i, reason: 'Raw disk write command rejected' },
    { pattern: />\s*\/dev\/[s|h]d/i, reason: 'Device redirection command rejected' },
    { pattern: /:(){ :|:& };:/, reason: 'Fork bomb rejected' },
    { pattern: /shutdown/i, reason: 'System shutdown command rejected' },
    { pattern: /reboot/i, reason: 'System reboot command rejected' }
  ];

  for (const item of dangerousPatterns) {
    if (item.pattern.test(cmd)) {
      return { safe: false, warning: item.reason };
    }
  }

  return { safe: true };
}

export function redactSecrets(text: string): string {
  if (!text) return '';
  // Redact Gemini API keys (AIza...)
  let redacted = text.replace(/AIza[0-9A-Za-z_-]{28,45}/g, 'AIza•••••••••••••••••••••••••••••••••••');
  // Redact Groq keys (gsk_...)
  redacted = redacted.replace(/gsk_[0-9A-Za-z]{48,}/g, 'gsk_••••••••••••••••••••••••••••••••••••');
  // Redact GitHub PATs (ghp_..., github_pat_...)
  redacted = redacted.replace(/ghp_[0-9A-Za-z]{36}/g, 'ghp_••••••••••••••••••••••••••••••••');
  redacted = redacted.replace(/github_pat_[0-9A-Za-z_]{60,}/g, 'github_pat_••••••••••••••••••••••••••••••••');
  // Redact PocketForge agent tokens (pf_sec_...)
  redacted = redacted.replace(/pf_sec_[0-9a-f]{32}/g, 'pf_sec_••••••••••••••••••••••••••••••••');

  return redacted;
}
