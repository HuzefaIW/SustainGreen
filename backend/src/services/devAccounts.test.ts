import assert from 'assert';
import {
  authenticateDevAccount,
  DEV_ACCOUNTS,
  findDevAccountByEmail,
  getDevAccounts,
  hasPermission,
  validateSvvvEmail,
} from './devAccounts.js';
import { createSessionToken, verifySessionToken } from './auth.js';

console.log('Running Dev Accounts seed tests...');

assert(validateSvvvEmail('super.admin@svvv.in'), 'Accepts @svvv.in email');
assert(!validateSvvvEmail('super.admin@gmail.com'), 'Rejects non-SVVV email');

const roles = new Set(DEV_ACCOUNTS.map((account) => account.role));
assert(roles.has('SUPER_ADMIN'), 'Includes a super admin account');
assert(roles.has('MAIN_BLOCK_ADMIN'), 'Includes a Main Block admin account');
assert(roles.has('MECH_BLOCK_ADMIN'), 'Includes a Mechanical Block admin account');
assert(roles.has('MBA_BLOCK_ADMIN'), 'Includes an MBA Block admin account');
assert(roles.has('CANTEEN_ADMIN'), 'Includes a canteen admin account');

const nonSvvvAccounts = DEV_ACCOUNTS.filter((account) => !validateSvvvEmail(account.email));
assert.strictEqual(nonSvvvAccounts.length, 0, 'Every seeded account uses @svvv.in');

const blockAdmins = DEV_ACCOUNTS.filter((account) => account.role.endsWith('_BLOCK_ADMIN'));
assert(blockAdmins.length >= 3, 'Includes block-wise admins for campus blocks');
assert(
  blockAdmins.every((account) => account.assignedBlockIds.length > 0),
  'Every block admin has assigned block ids',
);

const canteenAdmin = findDevAccountByEmail('canteen.admin@svvv.in');
assert(canteenAdmin, 'Canteen account can be looked up by email');
assert.strictEqual(canteenAdmin?.assignedBlockIds[0], 'central-hostel-mess', 'Canteen account owns mess block');
assert(hasPermission(canteenAdmin!, 'food_audit.create'), 'Canteen can create food audits');
assert(!hasPermission(canteenAdmin!, 'energy.resolve_leak'), 'Canteen cannot resolve energy leaks');

const login = authenticateDevAccount('super.admin@svvv.in', 'Super@123');
assert(login, 'Known dev account can login with seeded password');
assert(!('password' in login!), 'Authenticated account record does not expose plaintext password');

const badLogin = authenticateDevAccount('super.admin@svvv.in', 'wrong-password');
assert.strictEqual(badLogin, null, 'Wrong password is rejected');

const listedAccounts = getDevAccounts();
assert(!('passwordHash' in listedAccounts[0]), 'Listed accounts do not expose password hashes');

const tokenSession = createSessionToken(listedAccounts[0]);
const verified = verifySessionToken(tokenSession.token);
assert(verified?.account.email === 'super.admin@svvv.in', 'Signed session token verifies back to account');

console.log('Dev Accounts seed tests passed.');

