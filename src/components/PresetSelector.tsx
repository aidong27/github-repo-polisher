import { scoringPresets } from '../lib/scoringPresets';
import type { ScoringPresetId } from '../types/repo';

interface PresetSelectorProps {
  selectedPresetId: ScoringPresetId;
  onChange: (presetId: ScoringPresetId) => void;
}

export function PresetSelector({ selectedPresetId, onChange }: PresetSelectorProps) {
  const selectedPreset =
    scoringPresets.find((preset) => preset.id === selectedPresetId) || scoringPresets[0];

  return (
    <section className="panel preset-panel" aria-labelledby="preset-heading">
      <div>
        <p className="eyebrow">Scoring preset</p>
        <h2 id="preset-heading">Tune the audit for this repository type</h2>
      </div>
      <div className="preset-control">
        <label className="field-label" htmlFor="scoring-preset">
          Repository type
        </label>
        <select
          id="scoring-preset"
          value={selectedPresetId}
          onChange={(event) => onChange(event.target.value as ScoringPresetId)}
        >
          {scoringPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>
      <p className="preset-description">{selectedPreset.description}</p>
      <p className="preset-focus">
        <strong>Focus:</strong> {selectedPreset.focus}
      </p>
    </section>
  );
}
