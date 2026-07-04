export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-screen-logo">
        <span className="app-logo-mark loading-screen-mark">Z</span>
        <span className="app-logo-text loading-screen-text">Zenith Finance</span>
      </div>
      <span className="loading-screen-spinner" aria-hidden="true" />
    </div>
  );
}
