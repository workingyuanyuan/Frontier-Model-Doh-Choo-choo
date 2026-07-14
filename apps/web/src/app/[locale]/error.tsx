'use client';

interface LocaleErrorProps {
  reset: () => void;
}

export default function LocaleError({ reset }: LocaleErrorProps) {
  return (
    <main className="routeError" role="alert">
      <p>DATA SERVICE UNAVAILABLE</p>
      <h1>資料暫時無法載入</h1>
      <p>The benchmark data service is temporarily unavailable.</p>
      <button type="button" onClick={reset}>
        重試 / Retry
      </button>
    </main>
  );
}
