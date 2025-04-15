import { envConfig } from '../../config';

/**
 * @returns true if the current process is running in a test environment.
 */
export const isDev = (): boolean => {
  return envConfig.environment === 'development';
};
