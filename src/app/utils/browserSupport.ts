/**
 * Browser support utilities for checking Web API compatibility
 */

export interface BrowserSupport {
  nfc: boolean;
  geolocation: boolean;
  localStorage: boolean;
  serviceWorker: boolean;
}

export function checkBrowserSupport(): BrowserSupport {
  return {
    nfc: 'NDEFReader' in window,
    geolocation: 'geolocation' in navigator,
    localStorage: typeof Storage !== 'undefined',
    serviceWorker: 'serviceWorker' in navigator,
  };
}

export function getBrowserInfo(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari';
  } else if (userAgent.includes('Edg')) {
    return 'Edge';
  } else {
    return 'Unknown';
  }
}

export function isNFCCompatible(): { compatible: boolean; reason?: string } {
  const browser = getBrowserInfo();
  const support = checkBrowserSupport();

  if (!support.nfc) {
    if (browser === 'Safari') {
      return {
        compatible: false,
        reason: 'Web NFC API is not supported on iOS Safari. Please use an Android device with Chrome browser.',
      };
    }
    if (browser === 'Firefox') {
      return {
        compatible: false,
        reason: 'Web NFC API is not supported on Firefox. Please use Chrome browser on Android.',
      };
    }
    return {
      compatible: false,
      reason: 'Web NFC API is not supported on this browser. Please use Chrome 89+ on Android.',
    };
  }

  return { compatible: true };
}
