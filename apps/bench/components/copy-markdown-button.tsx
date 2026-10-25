import { useEffect, useState } from 'react';

export function CopyMarkdownButton({
  label,
  markdown,
  disabled = false,
}: {
  label: string;
  markdown: () => string;
  disabled?: boolean;
}) {
  const [copyStatus, setCopyStatus] = useState('');
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!copyStatus) return;
    const timer = window.setTimeout(() => setCopyStatus(''), 4000);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  const copyMarkdown = async () => {
    setCopying(true);
    setCopyStatus('');
    try {
      await navigator.clipboard.writeText(markdown());
      setCopyStatus('Copied!');
    } catch {
      setCopyStatus(
        'Copy failed. Please allow clipboard access and try again.',
      );
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="copy-markdown-control">
      <button
        type="button"
        className="copy-markdown-button"
        aria-label={label}
        title={label}
        disabled={copying || disabled}
        onClick={copyMarkdown}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="8" y="8" width="12" height="13" rx="2" />
          <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
        </svg>
      </button>
      <span className="copy-markdown-status" role="status">
        {copyStatus}
      </span>
    </div>
  );
}
