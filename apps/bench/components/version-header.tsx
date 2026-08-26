export function VersionHeader({
  developerMode,
  onDeveloperModeChange,
}: {
  developerMode: boolean;
  onDeveloperModeChange: (enabled: boolean) => void;
}) {
  return (
    <header className="site-header">
      <div>
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <strong>FM-DCC</strong>
            <small>Frontier Model Doh Choo-choo</small>
          </span>
        </a>
      </div>
      <div className="header-controls">
        <button
          type="button"
          className="developer-mode-switch"
          role="switch"
          aria-label="Developer mode"
          aria-checked={developerMode}
          title={
            developerMode ? 'Hide excluded models' : 'Show excluded models'
          }
          onClick={() => onDeveloperModeChange(!developerMode)}
        >
          <span className="developer-mode-switch-knob" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
