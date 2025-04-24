import { useContext } from 'react';
import AppContext from '../AppContext';

const useConfig = () => {
  const { config } = useContext(AppContext);
  return config;
};

export default useConfig;
