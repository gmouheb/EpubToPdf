"use client";

import { ConversionSettings as Settings } from "@/types/conversion";

interface ConversionSettingsProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  disabled?: boolean;
}

export default function ConversionSettings({
  settings,
  onChange,
  disabled
}: ConversionSettingsProps) {
  return (
    <div className="settings-grid">
      <div className="field">
        <label htmlFor="pageSize">Page size</label>
        <select
          id="pageSize"
          value={settings.pageSize}
          disabled={disabled}
          onChange={(event) => onChange({ ...settings, pageSize: event.target.value as Settings["pageSize"] })}
        >
          <option value="a4">A4</option>
          <option value="letter">Letter</option>
          <option value="original">Original where possible</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="marginPreset">Margins</label>
        <select
          id="marginPreset"
          value={settings.marginPreset}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...settings, marginPreset: event.target.value as Settings["marginPreset"] })
          }
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="fontFamily">Font family override</label>
        <input
          id="fontFamily"
          value={settings.fontFamily ?? ""}
          disabled={disabled}
          placeholder="Optional"
          onChange={(event) =>
            onChange({ ...settings, fontFamily: event.target.value.trim() || undefined })
          }
        />
      </div>

      <div className="field">
        <label htmlFor="fontSize">Font size override</label>
        <input
          id="fontSize"
          type="number"
          min="6"
          max="48"
          value={settings.fontSize ?? ""}
          disabled={disabled}
          placeholder="Optional"
          onChange={(event) =>
            onChange({
              ...settings,
              fontSize: event.target.value ? Number(event.target.value) : undefined
            })
          }
        />
      </div>

      <div className="check-row">
        <div className="check">
          <input
            id="embedFonts"
            type="checkbox"
            checked={settings.embedFonts}
            disabled={disabled}
            onChange={(event) => onChange({ ...settings, embedFonts: event.target.checked })}
          />
          <label htmlFor="embedFonts">Embed fonts when possible</label>
        </div>
        <div className="check">
          <input
            id="preserveCoverAspectRatio"
            type="checkbox"
            checked={settings.preserveCoverAspectRatio}
            disabled={disabled}
            onChange={(event) =>
              onChange({ ...settings, preserveCoverAspectRatio: event.target.checked })
            }
          />
          <label htmlFor="preserveCoverAspectRatio">Preserve cover aspect ratio</label>
        </div>
      </div>

      <div className="check-row">
        <div className="check">
          <input
            id="preserveImages"
            type="checkbox"
            checked={settings.preserveImages}
            disabled={disabled}
            onChange={(event) => onChange({ ...settings, preserveImages: event.target.checked })}
          />
          <label htmlFor="preserveImages">Preserve images</label>
        </div>
        <p className="field-hint">Images are retained by Calibre unless the EPUB itself restricts them.</p>
      </div>
    </div>
  );
}
