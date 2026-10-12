import crypto from 'crypto';

export type DevAccountRole = 'SUPER_ADMIN' | 'MAIN_BLOCK_ADMIN' | 'MECH_BLOCK_ADMIN' | 'MBA_BLOCK_ADMIN' | 'CANTEEN_ADMIN';

export type Permission =
  | 'campus.read'
  | 'campus.manage'
  | 'users.read'
  | 'users.manage'
  | 'blocks.read'
  | 'blocks.read_all'
  | 'energy.read'
  | 'energy.resolve_leak'
  | 'energy.demo_trigger'
  | 'food_audit.create'
  | 'food_audit.read'
  | 'food_audit.read_all'
  | 'mess_forecast.create'
  | 'mess_forecast.read'
  | 'mess_forecast.read_all'
  | 'mess_actuals.record'
  | 'leaderboard.read'
  | 'activity.read'
  | 'activity.read_all';

export interface DevAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: DevAccountRole;
  department: string;
  assignedBlockIds: string[];
  permissions: Permission[];
  status: 'ACTIVE' | 'DISABLED';
}

export interface SafeAccount {
  id: string;
  name: string;
  email: string;
  role: DevAccountRole;
  department: string;
  assignedBlockIds: string[];
  permissions: Permission[];
  status: 'ACTIVE' | 'DISABLED';
}

const SVVV_EMAIL_RE = /^[a-z0-9._%+-]+@svvv\.in$/i;

export const ROLE_PERMISSION_MATRIX: Record<DevAccountRole, Permission[]> = {
  SUPER_ADMIN: [
    'campus.read',
    'campus.manage',
    'users.read',
    'users.manage',
    'blocks.read',
    'blocks.read_all',
    'energy.read',
    'energy.resolve_leak',
    'energy.demo_trigger',
    'food_audit.create',
    'food_audit.read',
    'food_audit.read_all',
    'mess_forecast.create',
    'mess_forecast.read',
    'mess_forecast.read_all',
    'mess_actuals.record',
    'leaderboard.read',
    'activity.read',
    'activity.read_all',
  ],
  MAIN_BLOCK_ADMIN: ['campus.read', 'blocks.read', 'energy.read', 'energy.resolve_leak', 'leaderboard.read', 'activity.read'],
  MECH_BLOCK_ADMIN: ['campus.read', 'blocks.read', 'energy.read', 'energy.resolve_leak', 'leaderboard.read', 'activity.read'],
  MBA_BLOCK_ADMIN: ['campus.read', 'blocks.read', 'energy.read', 'energy.resolve_leak', 'leaderboard.read', 'activity.read'],
  CANTEEN_ADMIN: [
    'food_audit.create',
    'food_audit.read',
    'mess_forecast.create',
    'mess_forecast.read',
    'mess_actuals.record',
    'leaderboard.read',
    'activity.read',
  ],
};

export const DEV_ACCOUNTS: DevAccount[] = [
  {
    id: 'acct-super-admin',
    name: 'EcoPulse Super Admin',
    email: 'super.admin@svvv.in',
    passwordHash: 'scrypt:6F5NpFD5tSSGJweKJE7-6w:_rPf_HoWpvChJTtF5XgR0W7LM9rK5_Z9HNyjD04OlbU',
    role: 'SUPER_ADMIN',
    department: 'Campus Sustainability Office',
    assignedBlockIds: ['*'],
    permissions: ROLE_PERMISSION_MATRIX.SUPER_ADMIN,
    status: 'ACTIVE',
  },
  {
    id: 'acct-main-block-admin',
    name: 'Main Block Admin',
    email: 'main.block.admin@svvv.in',
    passwordHash: 'scrypt:tNO9iblfQe7PSbY2YvskwQ:TZsxuj4GzdEKgA6KaiCiqnsLqOZsyd7ANE9nqYWim5c',
    role: 'MAIN_BLOCK_ADMIN',
    department: 'Computer Science & Information Technology',
    assignedBlockIds: ['main-blk-fl2-r204', 'main-blk-fl1-r108', 'main-blk-fl3-r315'],
    permissions: ROLE_PERMISSION_MATRIX.MAIN_BLOCK_ADMIN,
    status: 'ACTIVE',
  },
  {
    id: 'acct-mech-block-admin',
    name: 'Mechanical Block Admin',
    email: 'mech.block.admin@svvv.in',
    passwordHash: 'scrypt:WRfpvhlGyqOMpHP5Beog_Q:6RtzwjikaAlpJZrKw1R5KHzT7_7qe-S8F-QACCLGpA8',
    role: 'MECH_BLOCK_ADMIN',
    department: 'Mechanical Engineering',
    assignedBlockIds: ['mech-blk-fl1-r112', 'mech-blk-fl2-r218'],
    permissions: ROLE_PERMISSION_MATRIX.MECH_BLOCK_ADMIN,
    status: 'ACTIVE',
  },
  {
    id: 'acct-mba-block-admin',
    name: 'MBA Block Admin',
    email: 'mba.block.admin@svvv.in',
    passwordHash: 'scrypt:Brzme_jy9IWd7O3hjlrf7Q:zqt4FN2Gix7p6nERjxxyDsj7mwCfadALD2BFoBzvEW8',
    role: 'MBA_BLOCK_ADMIN',
    department: 'Management Studies',
    assignedBlockIds: ['mba-blk-fl3-r305', 'mba-blk-fl1-r102'],
    permissions: ROLE_PERMISSION_MATRIX.MBA_BLOCK_ADMIN,
    status: 'ACTIVE',
  },
  {
    id: 'acct-canteen-admin',
    name: 'Central Canteen Admin',
    email: 'canteen.admin@svvv.in',
    passwordHash: 'scrypt:OIFUtAsyhtXP2Piaw5gRJQ:mJU8CsRBECgeOMDaP_JCCE-LWeP0QM0o4pF5uKia0NI',
    role: 'CANTEEN_ADMIN',
    department: 'Central Hostel Dining Council',
    assignedBlockIds: ['central-hostel-mess'],
    permissions: ROLE_PERMISSION_MATRIX.CANTEEN_ADMIN,
    status: 'ACTIVE',
  },
];

export function validateSvvvEmail(email: string): boolean {
  return SVVV_EMAIL_RE.test(email);
}

export function sanitizeAccount(account: DevAccount): SafeAccount {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    department: account.department,
    assignedBlockIds: [...account.assignedBlockIds],
    permissions: [...account.permissions],
    status: account.status,
  };
}

export function getDevAccounts(): SafeAccount[] {
  return DEV_ACCOUNTS.map(sanitizeAccount);
}

export function findDevAccountByEmail(email: string): DevAccount | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  return DEV_ACCOUNTS.find((account) => account.email.toLowerCase() === normalizedEmail);
}

export function findDevAccountById(id: string): DevAccount | undefined {
  return DEV_ACCOUNTS.find((account) => account.id === id);
}

export function verifyPassword(password: string, encodedHash: string): boolean {
  const [scheme, salt, expectedHash] = encodedHash.split(':');
  if (scheme !== 'scrypt' || !salt || !expectedHash) {
    return false;
  }

  const actualHash = crypto.scryptSync(password, salt, 32);
  const expectedBuffer = Buffer.from(expectedHash, 'base64url');
  return actualHash.length === expectedBuffer.length && crypto.timingSafeEqual(actualHash, expectedBuffer);
}

export function authenticateDevAccount(email: string, password: string): DevAccount | null {
  const account = findDevAccountByEmail(email);
  if (!account || account.status !== 'ACTIVE' || !verifyPassword(password, account.passwordHash)) {
    return null;
  }
  return account;
}

export function hasPermission(account: SafeAccount | DevAccount, permission: Permission): boolean {
  return account.permissions.includes(permission);
}

export function canAccessBlock(account: SafeAccount | DevAccount, blockId: string): boolean {
  return account.assignedBlockIds.includes('*') || account.assignedBlockIds.includes(blockId);
}

export function isDevelopmentAuthEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_DEV_AUTH !== 'true';
}

