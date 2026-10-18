'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export type PermissionKey = string | string[];

export function canWithUser(isStaff: boolean, permissions: string[], perm: PermissionKey): boolean {
  if (isStaff) return true;
  const list = Array.isArray(perm) ? perm : [perm];
  return list.every((p) => permissions.includes(p));
}

export function canAnyWithUser(isStaff: boolean, permissions: string[], perms: string[]): boolean {
  if (isStaff) return true;
  return perms.some((p) => permissions.includes(p));
}

/**
 * Reactive hook: returns a checker that respects the current user's permissions.
 * `is_staff === true` grants access to everything.
 */
export function useCan() {
  const isStaff = useAppStore((s) => s.isStaff);
  const permissions = useAppStore((s) => s.permissions);

  return useCallback(
    (perm: PermissionKey) => canWithUser(isStaff, permissions, perm),
    [isStaff, permissions]
  );
}

export function useCanAny() {
  const isStaff = useAppStore((s) => s.isStaff);
  const permissions = useAppStore((s) => s.permissions);

  return useCallback(
    (perms: string[]) => canAnyWithUser(isStaff, permissions, perms),
    [isStaff, permissions]
  );
}

/**
 * Non-reactive checker (safe to use inside effects/fetchers).
 */
export function can(perm: PermissionKey): boolean {
  const { isStaff, permissions } = useAppStore.getState();
  return canWithUser(isStaff, permissions, perm);
}

/**
 * Page-level guard. Returns whether the current user may view the screen.
 * When access is denied (after auth hydration), shows a toast and redirects home.
 */
export function usePageAccess(perm?: PermissionKey): boolean {
  const isAuthReady = useAppStore((s) => s.isAuthReady);
  const token = useAppStore((s) => s.token);
  const addToast = useAppStore((s) => s.addToast);
  const check = useCan();
  const router = useRouter();

  const allowed = !perm || check(perm);

  useEffect(() => {
    if (!isAuthReady || !token || allowed) return;
    addToast({ type: 'error', message: 'ليس لديك صلاحية للوصول إلى هذه الشاشة' });
    router.replace('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, token, allowed, router]);

  return allowed;
}

// ===== Permission constants =====
export const PERM = {
  person: { view: 'person.view_person', add: 'person.add_person', change: 'person.change_person', delete: 'person.delete_person' },
  wife: { view: 'person.view_wife', add: 'person.add_wife', change: 'person.change_wife', delete: 'person.delete_wife' },
  source: { view: 'person.view_source', add: 'person.add_source', change: 'person.change_source', delete: 'person.delete_source' },
  requser: { view: 'request.view_requser', add: 'request.add_requser', change: 'request.change_requser', delete: 'request.delete_requser' },
  formRequser: {
    view: 'request.view_formrequser',
    add: 'request.add_formrequser',
    change: 'request.change_formrequser',
    delete: 'request.delete_formrequser',
  },
  status: {
    view: 'request.view_statusrequserdcm',
    add: 'request.add_statusrequserdcm',
    change: 'request.change_statusrequserdcm',
    delete: 'request.delete_statusrequserdcm',
  },
  form: {
    view: 'request.view_formrequser',
    add: 'request.add_formrequser',
    change: 'request.change_formrequser',
    delete: 'request.delete_formrequser',
  },
  reference: {
    view: 'references.view_reference',
    add: 'references.add_reference',
    change: 'references.change_reference',
    delete: 'references.delete_reference',
  },
  referenceRequser: {
    view: 'references.view_referencerequser',
    add: 'references.add_referencerequser',
    change: 'references.change_referencerequser',
    delete: 'references.delete_referencerequser',
  },
  user: { view: 'auth.view_user', add: 'auth.add_user', change: 'auth.change_user', delete: 'auth.delete_user' },
  group: { view: 'auth.view_group', add: 'auth.add_group', change: 'auth.change_group', delete: 'auth.delete_group' },
  permission: {
    view: 'auth.view_permission',
    add: 'auth.add_permission',
    change: 'auth.change_permission',
    delete: 'auth.delete_permission',
  },
  logEntry: {
    view: 'admin.view_logentry',
    add: 'admin.add_logentry',
    change: 'admin.change_logentry',
    delete: 'admin.delete_logentry',
  },
} as const;
