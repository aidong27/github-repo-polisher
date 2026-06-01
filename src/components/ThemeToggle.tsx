interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      className="icon-button"
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={onToggle}
    >
      <span aria-hidden="true">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
