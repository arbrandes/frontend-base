import { getAuthenticatedUser } from '../auth';
import { getActiveRoles, getSiteConfig } from '../config';
import { SlotOperation } from './types';

export function getSlotOperations(id: string, defaultOperation?: SlotOperation) {
  const { apps } = getSiteConfig();
  const ops: SlotOperation[] = [];

  if (defaultOperation) {
    ops.push(defaultOperation);
  }

  if (apps) {
    apps.forEach((app) => {
      if (Array.isArray(app.slots)) {
        app.slots.forEach((operation) => {
          if (operation.slotId === id) {
            ops.push(operation);
          }
        });
      }
    });
  }

  return ops;
}

export function isSlotOperationConditionSatisfied(operation: SlotOperation) {
  const { condition } = operation;
  if (condition?.authenticated !== undefined) {
    const isAuthenticated = getAuthenticatedUser() !== null;
    // If we failed the authenticated condition, return false.
    if (condition.authenticated !== isAuthenticated) {
      return false;
    }
  }

  if (condition?.active !== undefined) {
    let activeConditionRoleFound = false;
    const activeRoles: string[] = getActiveRoles();
    for (const conditionRole of condition.active) {
      if (activeRoles.includes(conditionRole)) {
        activeConditionRoleFound = true;
        break;
      }
    }
    // If we couldn't find an active role in our list, then we've failed this condition.
    if (!activeConditionRoleFound) {
      return false;
    }
  }

  // If there was no condition, we return true.
  return true;
}
