import { useContext } from 'react';
import AppContext from '../AppContext';

const useAuthenticatedUser = () => {
  const { authenticatedUser } = useContext(AppContext);
  return authenticatedUser;
};

export default useAuthenticatedUser;
