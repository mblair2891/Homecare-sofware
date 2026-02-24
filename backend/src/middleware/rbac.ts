import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthRequest } from './auth';

// ─────────────────────────────────────────────────────────────────────────────
// Role hierarchy — higher number = more authority
// ─────────────────────────────────────────────────────────────────────────────
export const ROLE_LEVELS: Record<UserRole, number> = {
  Owner:         6,
  Administrator: 5,
  Coordinator:   4,
  Nurse:         3,
  Biller:        2,
  ReadOnly:      1,
};

// ─────────────────────────────────────────────────────────────────────────────
// Permission matrix — who can do what
// ─────────────────────────────────────────────────────────────────────────────
export const PERMISSIONS = {
  // Clients
  'clients:read':       ['Owner', 'Administrator', 'Coordinator', 'Nurse', 'Biller', 'ReadOnly'],
  'clients:write':      ['Owner', 'Administrator', 'Coordinator', 'Nurse'],
  'clients:delete':     ['Owner', 'Administrator'],

  // Caregivers
  'caregivers:read':    ['Owner', 'Administrator', 'Coordinator', 'Nurse', 'ReadOnly'],
  'caregivers:write':   ['Owner', 'Administrator', 'Coordinator'],

  // Scheduling
  'shifts:read':        ['Owner', 'Administrator', 'Coordinator', 'Nurse', 'ReadOnly'],
  'shifts:write':       ['Owner', 'Administrator', 'Coordinator'],
  'shifts:evv':         ['Owner', 'Administrator', 'Coordinator', 'Nurse'],

  // Billing
  'billing:read':       ['Owner', 'Administrator', 'Biller'],
  'billing:write':      ['Owner', 'Administrator', 'Biller'],

  // Users
  'users:read':         ['Owner', 'Administrator'],
  'users:write':        ['Owner', 'Administrator'],

  // Compliance / QA
  'compliance:read':    ['Owner', 'Administrator', 'Coordinator', 'Nurse', 'ReadOnly'],
  'compliance:write':   ['Owner', 'Administrator', 'Coordinator', 'Nurse'],
  'compliance:admin':   ['Owner', 'Administrator'],

  // Forms
  'forms:read':         ['Owner', 'Administrator', 'Coordinator', 'Nurse', 'ReadOnly'],
  'forms:write':        ['Owner', 'Administrator', 'Coordinator', 'Nurse'],

  // Agency settings
  'agency:settings':    ['Owner', 'Administrator'],
  'agency:admin':       ['Owner'],
} as const satisfies Record<string, readonly UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware factories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Require the authenticated user to hold at least one of the listed roles.
 * Must be placed *after* authenticate() in the middleware chain.
 */
export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
      return;
    }
    next();
  };
}

/**
 * Require the authenticated user to hold at least the specified minimum role level.
 */
export function authorizeLevel(minimumRole: UserRole) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const userLevel = ROLE_LEVELS[req.user.role as UserRole] ?? 0;
    if (userLevel < ROLE_LEVELS[minimumRole]) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: minimumRole,
        current: req.user.role,
      });
      return;
    }
    next();
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers for route handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a locationId scope for Prisma `where` clauses.
 * Owner / Administrator see the whole agency; all other roles are scoped
 * to the location they are assigned to (if any).
 */
export function locationFilter(req: AuthRequest): string | undefined {
  const adminRoles: UserRole[] = ['Owner', 'Administrator'];
  if (adminRoles.includes(req.user!.role as UserRole)) return undefined;
  return req.user!.locationId ?? undefined;
}

/** Inline permission check — useful for conditional field exposure. */
export function can(req: AuthRequest, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(req.user?.role ?? '');
}

/**
 * Convenience: build a Prisma `where` object scoped to the current user's
 * agency, and optionally also their location.
 */
export function agencyScope(req: AuthRequest, extra: Record<string, unknown> = {}): Record<string, unknown> {
  const where: Record<string, unknown> = { agencyId: req.user!.agencyId, ...extra };
  const locId = locationFilter(req);
  if (locId) where.locationId = locId;
  return where;
}
