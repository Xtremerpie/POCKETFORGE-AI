import { describe, it, expect } from 'vitest';
import { TEMPLATES, createProjectFromTemplate } from '../src/services/templates';
import { sanitizePath, validateSafeCommand, redactSecrets } from '../src/services/security';
import { DEFAULT_AI_SETTINGS } from '../src/services/aiProviders';
import { exportProjectZip, exportLinuxMintBundle } from '../src/services/zipService';

describe('Project Creation & Templates Suite', () => {
  it('should provide all 8 initial template architectures', () => {
    expect(TEMPLATES.length).toBe(8);
    const templateIds = TEMPLATES.map(t => t.id);
    expect(templateIds).toContain('html-js');
    expect(templateIds).toContain('react');
    expect(templateIds).toContain('nextjs');
    expect(templateIds).toContain('node-api');
    expect(templateIds).toContain('python-app');
    expect(templateIds).toContain('flask-api');
    expect(templateIds).toContain('portfolio');
    expect(templateIds).toContain('discord-bot');
  });

  it('should create a valid project with files from a template', () => {
    const proj = createProjectFromTemplate('react', 'My React Test Project');
    expect(proj.name).toBe('My React Test Project');
    expect(proj.template).toBe('react');
    expect(proj.files.length).toBeGreaterThan(0);

    const hasApp = proj.files.some(f => f.path.includes('App'));
    expect(hasApp).toBe(true);

    const hasPkg = proj.files.some(f => f.path === 'package.json');
    expect(hasPkg).toBe(true);
  });
});

describe('Security & Sanitization Suite', () => {
  it('should sanitize paths and prevent directory traversal', () => {
    expect(sanitizePath('src/components/Header.tsx')).toBe('src/components/Header.tsx');
    expect(sanitizePath('\\src\\app.js')).toBe('src/app.js');

    expect(() => sanitizePath('../../etc/passwd')).toThrow(/disallowed/);
    expect(() => sanitizePath('..')).toThrow(/disallowed/);
  });

  it('should detect dangerous shell commands', () => {
    expect(validateSafeCommand('npm run dev').safe).toBe(true);
    expect(validateSafeCommand('python main.py').safe).toBe(true);
    expect(validateSafeCommand('git status').safe).toBe(true);

    expect(validateSafeCommand('rm -rf /').safe).toBe(false);
    expect(validateSafeCommand('mkfs.ext4 /dev/sda1').safe).toBe(false);
    expect(validateSafeCommand(':(){ :|:& };:').safe).toBe(false);
  });

  it('should redact sensitive tokens and keys in logs', () => {
    const textWithGemini = 'Calling with key AIzaSyD92hfksjdhfksdjfhskdjfhskdjfh';
    expect(redactSecrets(textWithGemini)).toContain('AIza•••••••••••••••••••••••••••••••••••');

    const textWithGroq = 'Groq auth: gsk_1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    expect(redactSecrets(textWithGroq)).toContain('gsk_••••••••••••••••••••••••••••••••••••');

    const textWithAgent = 'Local agent token: pf_sec_e8b420f17a94c1e0f3162781a7b03df1';
    expect(redactSecrets(textWithAgent)).toContain('pf_sec_••••••••••••••••••••••••••••••••');
  });
});

describe('AI Provider Configuration Suite', () => {
  it('should provide default configurations for Gemini, Groq, and OpenRouter', () => {
    expect(DEFAULT_AI_SETTINGS.providers.gemini).toBeDefined();
    expect(DEFAULT_AI_SETTINGS.providers.groq).toBeDefined();
    expect(DEFAULT_AI_SETTINGS.providers.openrouter).toBeDefined();
    expect(DEFAULT_AI_SETTINGS.enableFallback).toBe(true);
    expect(DEFAULT_AI_SETTINGS.primaryProvider).toBe('gemini');
  });
});

describe('ZIP & Linux Mint Export Suite', () => {
  it('should export project files to a compressed ZIP blob', async () => {
    const proj = createProjectFromTemplate('html-js', 'Export Test App');
    const blob = await exportProjectZip(proj);
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(100);
  });

  it('should export Linux Mint bundle with run-linux.sh and LINUX_MINT_README.md', async () => {
    const proj = createProjectFromTemplate('python-app', 'Python Mint App');
    const blob = await exportLinuxMintBundle(proj);
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(200);
  });
});
