 /**
 * Utility to get the public base URL for QR codes.
 * In production (Firebase), this will be the actual site URL.
 * In local development, it defaults to window.location.origin (localhost).
 * You can override it by setting VITE_PUBLIC_URL in an .env file
 * or by accessing the site via a tunnel (like ngrok).
 */
export const getPublicBaseUrl = (): string => {
  // Priority 1: Environment variable (useful for forcing a specific tunnel/production URL)
  const envUrl = import.meta.env.VITE_PUBLIC_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }

  // Priority 2: Current window origin
  // If you access your local dev server via a tunnel (ngrok), 
  // window.location.origin will automatically be the tunnel URL.
  return window.location.origin;
};

export const getTreePublicViewUrl = (treeId: string): string => {
  return `${getPublicBaseUrl()}/view/${treeId}`;
};

export const getQRCodeApiUrl = (data: string, size: number = 300): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
};
