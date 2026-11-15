import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Request } from 'express';
import type {
  AuthSessionResponse,
  AuthUserPublic,
  PatientVaultPayload,
  UserRole,
} from './types.ts';

interface StoredUserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bound_patient_id: string;
  password_salt: string;
  password_hash: string;
  created_at: string;
}

interface StoredSessionRecord {
  token: string;
  user_id: string;
  active_patient_id: string;
  created_at: string;
  expires_at: string;
}

interface EncryptedBlob {
  iv: string;
  tag: string;
  ciphertext: string;
}

interface PersistedPortalStore {
  version: 1;
  encryption_salt: string;
  users: StoredUserRecord[];
  sessions: StoredSessionRecord[];
  vaults: Record<string, EncryptedBlob>;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function sanitizePatientId(id: string): string {
  return String(id || 'MX-SYN-T02').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64) || 'MX-SYN-T02';
}

function hashPassword(password: string, saltHex: string): string {
  return crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64).toString('hex');
}

function verifyPassword(password: string, saltHex: string, expectedHex: string): boolean {
  try {
    const computed = Buffer.from(hashPassword(password, saltHex), 'hex');
    const expected = Buffer.from(expectedHex, 'hex');
    if (computed.length !== expected.length) return false;
    return crypto.timingSafeEqual(computed, expected);
  } catch {
    return false;
  }
}

export class PortalAuthAndVaultStore {
  private storePath: string;
  private data: PersistedPortalStore;
  private aesKey: Buffer;
  private persistToDisk: boolean;

  constructor(options?: { storePath?: string; persistToDisk?: boolean }) {
    this.persistToDisk = options?.persistToDisk ?? process.env.NODE_ENV !== 'test';
    this.storePath =
      options?.storePath ||
      path.resolve(process.cwd(), 'data', 'portal-auth-vault.json');

    this.data = this.loadOrInit();
    const secretSeed =
      process.env.MUTANEX_VAULT_SECRET ||
      process.env.GEMINI_API_KEY?.slice(0, 24) ||
      'mutanex-local-biometric-vault-v1';
    this.aesKey = crypto.scryptSync(
      secretSeed,
      Buffer.from(this.data.encryption_salt, 'hex'),
      32
    );

    this.ensureSeedAccounts();
  }

  private loadOrInit(): PersistedPortalStore {
    if (this.persistToDisk && fs.existsSync(this.storePath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(this.storePath, 'utf8'));
        if (parsed && parsed.version === 1 && Array.isArray(parsed.users)) {
          return parsed as PersistedPortalStore;
        }
      } catch {
        // Re-init cleanly if corrupted
      }
    }
    return {
      version: 1,
      encryption_salt: crypto.randomBytes(16).toString('hex'),
      users: [],
      sessions: [],
      vaults: {},
    };
  }

  private save(): void {
    if (!this.persistToDisk) return;
    try {
      const dir = path.dirname(this.storePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.warn('[PortalAuthAndVaultStore] Could not persist store:', err);
    }
  }

  private ensureSeedAccounts(): void {
    let changed = false;
    const seedUsers: Array<{
      email: string;
      name: string;
      password: string;
      role: UserRole;
      bound_patient_id: string;
    }> = [
      {
        email: 'admin@mutanex.ai',
        name: 'Mutanex Clinical Admin',
        password: 'MutanexAdmin!2026',
        role: 'admin',
        bound_patient_id: 'MX-SYN-T02',
      },
      {
        email: 'anika@mutanex.ai',
        name: 'Anika Sharma',
        password: 'AnikaTwin!2026',
        role: 'member',
        bound_patient_id: 'MX-SYN-T02',
      },
    ];

    for (const seed of seedUsers) {
      const exists = this.data.users.some(
        (u) => u.email.toLowerCase() === seed.email.toLowerCase()
      );
      if (!exists) {
        const salt = crypto.randomBytes(16).toString('hex');
        this.data.users.push({
          id: `usr_${crypto.randomBytes(8).toString('hex')}`,
          email: seed.email.toLowerCase(),
          name: seed.name,
          role: seed.role,
          bound_patient_id: seed.bound_patient_id,
          password_salt: salt,
          password_hash: hashPassword(seed.password, salt),
          created_at: new Date().toISOString(),
        });
        changed = true;
      }
    }
    if (changed) {
      this.save();
    }
  }

  private toPublicUser(user: StoredUserRecord): AuthUserPublic {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      bound_patient_id: user.bound_patient_id,
      created_at: user.created_at,
    };
  }

  private issueSession(user: StoredUserRecord, activePatientId?: string): AuthSessionResponse {
    const now = Date.now();
    // Prune expired sessions
    this.data.sessions = this.data.sessions.filter(
      (s) => new Date(s.expires_at).getTime() > now
    );

    const token = `mxs_${crypto.randomBytes(24).toString('hex')}`;
    const patientId = sanitizePatientId(activePatientId || user.bound_patient_id);
    this.data.sessions.push({
      token,
      user_id: user.id,
      active_patient_id: patientId,
      created_at: new Date(now).toISOString(),
      expires_at: new Date(now + SESSION_TTL_MS).toISOString(),
    });
    this.save();
    return {
      token,
      user: {
        ...this.toPublicUser(user),
        bound_patient_id: user.role === 'admin' ? patientId : user.bound_patient_id,
      },
    };
  }

  public signUp(params: {
    name: string;
    email: string;
    password: string;
    bound_patient_id?: string;
  }): AuthSessionResponse {
    const cleanEmail = String(params.email || '').trim().toLowerCase();
    const cleanName = String(params.name || '').trim();
    const password = String(params.password || '');

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Please enter your full name (at least 2 characters).');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    if (this.data.users.some((u) => u.email === cleanEmail)) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const boundId = params.bound_patient_id
      ? sanitizePatientId(params.bound_patient_id)
      : `MX-MEM-${String(Date.now()).slice(-6)}`;

    const newUser: StoredUserRecord = {
      id: `usr_${crypto.randomBytes(8).toString('hex')}`,
      email: cleanEmail,
      name: cleanName,
      role: 'member',
      bound_patient_id: boundId,
      password_salt: salt,
      password_hash: hashPassword(password, salt),
      created_at: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();

    return this.issueSession(newUser, boundId);
  }

  public signIn(params: { email: string; password: string }): AuthSessionResponse {
    const cleanEmail = String(params.email || '').trim().toLowerCase();
    const password = String(params.password || '');
    const user = this.data.users.find((u) => u.email === cleanEmail);
    if (!user || !verifyPassword(password, user.password_salt, user.password_hash)) {
      throw new Error('Invalid email or password.');
    }
    return this.issueSession(user);
  }

  public signInAdminDemo(preferredPatientId?: string): AuthSessionResponse {
    const adminUser = this.data.users.find((u) => u.role === 'admin');
    if (!adminUser) {
      throw new Error('Admin account not initialized');
    }
    return this.issueSession(adminUser, preferredPatientId || adminUser.bound_patient_id);
  }

  public bindMemberPatient(token: string, newPatientId: string): AuthUserPublic | null {
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return null;
    const user = this.data.users.find((u) => u.id === session.user_id);
    if (!user) return null;
    const cleanPid = sanitizePatientId(newPatientId);
    session.active_patient_id = cleanPid;
    if (user.role === 'member') {
      user.bound_patient_id = cleanPid;
    }
    this.save();
    return {
      ...this.toPublicUser(user),
      bound_patient_id: user.role === 'admin' ? cleanPid : user.bound_patient_id,
    };
  }

  public extractTokenFromRequest(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice('Bearer '.length).trim();
    }
    const cookieHeader = req.headers.cookie || '';
    for (const part of cookieHeader.split(';')) {
      const [k, v] = part.trim().split('=');
      if (k === 'mx_session' && v) {
        return decodeURIComponent(v);
      }
    }
    return null;
  }

  public getSessionUser(token: string | null): {
    user: AuthUserPublic;
    active_patient_id: string;
  } | null {
    if (!token) return null;
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return null;
    if (new Date(session.expires_at).getTime() <= Date.now()) {
      this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
      this.save();
      return null;
    }
    const user = this.data.users.find((u) => u.id === session.user_id);
    if (!user) return null;
    return {
      user: this.toPublicUser(user),
      active_patient_id: session.active_patient_id,
    };
  }

  public signOut(token: string | null): void {
    if (!token) return;
    const before = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    if (this.data.sessions.length !== before) {
      this.save();
    }
  }

  public canAccessPatient(token: string | null, targetPatientId: string): boolean {
    const resolved = this.getSessionUser(token);
    if (!resolved) {
      // Allow local unauthenticated preview access to read/write isolated demo keys if no session header sent,
      // while enforcing strict isolation when authenticated as a non-admin member.
      return true;
    }
    if (resolved.user.role === 'admin') {
      return true;
    }
    return sanitizePatientId(targetPatientId) === sanitizePatientId(resolved.user.bound_patient_id);
  }

  private encryptPayload(payload: PatientVaultPayload): EncryptedBlob {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.aesKey, iv);
    const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      ciphertext: encrypted.toString('base64'),
    };
  }

  private decryptPayload(blob: EncryptedBlob): PatientVaultPayload | null {
    try {
      const iv = Buffer.from(blob.iv, 'base64');
      const tag = Buffer.from(blob.tag, 'base64');
      const ciphertext = Buffer.from(blob.ciphertext, 'base64');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.aesKey, iv);
      decipher.setAuthTag(tag);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return JSON.parse(decrypted.toString('utf8')) as PatientVaultPayload;
    } catch {
      return null;
    }
  }

  public getPatientVault(patientId: string): PatientVaultPayload {
    const pid = sanitizePatientId(patientId);
    const encrypted = this.data.vaults[pid];
    if (encrypted) {
      const decoded = this.decryptPayload(encrypted);
      if (decoded) return decoded;
    }
    return {
      patient_id: pid,
      updated_at: new Date().toISOString(),
      face_profile: null,
      portrait_photos: [],
      voice_consent: null,
      voice_profile: null,
      voice_clips: [],
      identity_memories: [],
      preserved_turns: [],
      feed_entries: [],
      preferences: [],
    };
  }

  public updatePatientVault(
    patientId: string,
    patch: Partial<PatientVaultPayload>
  ): PatientVaultPayload {
    const pid = sanitizePatientId(patientId);
    const current = this.getPatientVault(pid);
    const merged: PatientVaultPayload = {
      ...current,
      ...patch,
      patient_id: pid,
      updated_at: new Date().toISOString(),
    };
    if (merged.voice_profile) {
      merged.voice_profile = {
        ...merged.voice_profile,
        encrypted_at_rest: true,
      };
    }
    this.data.vaults[pid] = this.encryptPayload(merged);
    this.save();
    return merged;
  }

  public purgePatientVoiceAndIdentity(
    patientId: string,
    scope: 'voice' | 'appearance' | 'all' = 'all'
  ): PatientVaultPayload {
    const pid = sanitizePatientId(patientId);
    const current = this.getPatientVault(pid);
    const now = new Date().toISOString();
    let updated: PatientVaultPayload;

    if (scope === 'voice') {
      updated = {
        ...current,
        updated_at: now,
        voice_consent: {
          granted: false,
          granted_at: null,
          allow_conversation_refinement: false,
          consent_statement: 'Revoked by user — all voice recordings and models purged.',
          revoked_at: now,
        },
        voice_profile: null,
        voice_clips: [],
      };
    } else if (scope === 'appearance') {
      updated = {
        ...current,
        updated_at: now,
        face_profile: null,
        portrait_photos: [],
      };
    } else {
      updated = {
        patient_id: pid,
        updated_at: now,
        face_profile: null,
        portrait_photos: [],
        voice_consent: {
          granted: false,
          granted_at: null,
          allow_conversation_refinement: false,
          consent_statement: 'Revoked by user — full digital preservation vault purged.',
          revoked_at: now,
        },
        voice_profile: null,
        voice_clips: [],
        identity_memories: [],
        preserved_turns: [],
        feed_entries: current.feed_entries || [],
        preferences: [],
      };
    }

    this.data.vaults[pid] = this.encryptPayload(updated);
    this.save();
    return updated;
  }
}
