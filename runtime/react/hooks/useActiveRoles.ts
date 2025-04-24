import { useState } from 'react';
import { getActiveRoles } from '../../config';
import { ACTIVE_ROLES_CHANGED } from '../../constants';
import useAppEvent from './useAppEvent';

const useActiveRoles = () => {
  const [roles, setRoles] = useState<string[]>(getActiveRoles());
  useAppEvent(ACTIVE_ROLES_CHANGED, () => {
    setRoles(getActiveRoles());
  });

  return roles;
};

export default useActiveRoles;
