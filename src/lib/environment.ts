/**
 * Environment detection utilities for Power Platform deployment
 */

export const isPowerPlatform = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for Power Platform specific domains
  const hostname = window.location.hostname;
  return (
    hostname.includes('powerapps.com') ||
    hostname.includes('powerplatformusercontent.com') ||
    hostname.includes('powerpages.microsoft.com')
  );
};

export const isLocalDevelopment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

export const getEnvironmentInfo = () => {
  return {
    isPowerPlatform: isPowerPlatform(),
    isLocalDevelopment: isLocalDevelopment(),
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
  };
};