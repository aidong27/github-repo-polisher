import { FormEvent, useState } from 'react';

interface RepoInputProps {
  disabled: boolean;
  onSubmit: (url: string) => void;
  onUseMock: (index: number) => void;
}

export function RepoInput({ disabled, onSubmit, onUseMock }: RepoInputProps) {
  const [value, setValue] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <div className="repo-input-card">
      <form className="repo-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="repo-url">
          Public GitHub repository URL
        </label>
        <div className="repo-form-row">
          <input
            id="repo-url"
            aria-label="Public GitHub repository URL"
            type="url"
            inputMode="url"
            placeholder="https://github.com/owner/repo"
            value={value}
            disabled={disabled}
            onChange={(event) => setValue(event.target.value)}
          />
          <button className="primary-button" type="submit" disabled={disabled}>
            {disabled ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>
      <div className="sample-actions" aria-label="Sample repositories">
        <button type="button" className="secondary-button" onClick={() => onUseMock(0)}>
          Weak sample
        </button>
        <button type="button" className="secondary-button" onClick={() => onUseMock(1)}>
          Polished sample
        </button>
      </div>
    </div>
  );
}
