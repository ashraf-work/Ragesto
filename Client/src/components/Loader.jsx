function Loader() {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[var(--bg)]">
      <div className="premium-panel p-8 text-center">
        <div className="loader"></div>
        <p className="mt-6 text-sm font-medium text-[var(--text-muted)]">
          Preparing your workspace
        </p>
      </div>
    </div>
  );
}

export default Loader;
