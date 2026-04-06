const getAppId = (): string => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_ID) {
    return process.env.NEXT_PUBLIC_APP_ID;
  }
  if (typeof window !== 'undefined') {
    const match = window.location.hostname.match(/^preview-([^.]+)/);
    if (match) return match[1];
  }
  return '64cc5b17-2787-45ae-976e-177b396e00e5';
};

const reportError = (message: string, stack?: string) => {
  const url = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_RUNTIME_ERROR_REPORT_URL : undefined;
  if (!url) return;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: getAppId(),
      message,
      stack: stack || '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    }),
  }).catch(() => {});
};

export function initErrorReporter() {
  if (typeof window === 'undefined') return;
  window.onerror = (msg, _src, _line, _col, err) => {
    reportError(String(msg), err?.stack);
  };
  window.onunhandledrejection = (e) => {
    reportError(e.reason?.message || String(e.reason), e.reason?.stack);
  };
  const origError = console.error;
  console.error = (...args: any[]) => {
    reportError(args.map(String).join(' '));
    origError.apply(console, args);
  };
}