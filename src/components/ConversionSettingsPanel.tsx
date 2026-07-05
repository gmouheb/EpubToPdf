"use client";

import { ConversionSettings as Settings } from "@/types/conversion";
import Checkbox from "./ui/Checkbox";
import Input from "./ui/Input";
import Select from "./ui/Select";

interface ConversionSettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  disabled?: boolean;
}

export default function ConversionSettingsPanel({
  settings,
  onChange,
  disabled
}: ConversionSettingsPanelProps) {
  const preserveBookFonts = !settings.fontFamily && !settings.fontSize;

  return (
    <section className="flow-section" aria-labelledby="settings-heading">
      <div className="section-heading">
        <p className="section-kicker">Step 2</p>
        <h2 id="settings-heading">Choose PDF settings</h2>
        <p>Keep the defaults for a clean A4 PDF, or tune the output for your book.</p>
      </div>

      <div className="settings-sections">
        <div className="settings-card">
          <div className="settings-card-heading">
            <h3>Page setup</h3>
            <p>Controls the PDF page canvas and whitespace.</p>
          </div>

          <div className="control-grid">
            <label className="field-control" htmlFor="pageSize">
              <span>Page size</span>
              <Select
                id="pageSize"
                value={settings.pageSize}
                disabled={disabled}
                onChange={(event) =>
                  onChange({ ...settings, pageSize: event.target.value as Settings["pageSize"] })
                }
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="original">Original where possible</option>
              </Select>
              <small>Reflowable EPUBs are repaginated into this page size.</small>
            </label>

            <label className="field-control" htmlFor="marginPreset">
              <span>Margins</span>
              <Select
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
              </Select>
              <small>Medium is a good balance for reading and printing.</small>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-heading">
            <h3>Typography</h3>
            <p>Preserve the book feel or apply a simple override.</p>
          </div>

          <Checkbox
            checked={preserveBookFonts}
            disabled={disabled}
            onChange={(event) => {
              if (event.target.checked) {
                onChange({ ...settings, fontFamily: undefined, fontSize: undefined });
              }
            }}
            label="Preserve book fonts"
            description="Leave font family and size unchanged when possible."
          />

          <div className="control-grid">
            <label className="field-control" htmlFor="fontFamily">
              <span>Custom font family</span>
              <Input
                id="fontFamily"
                value={settings.fontFamily ?? ""}
                disabled={disabled}
                placeholder="Optional"
                onChange={(event) =>
                  onChange({ ...settings, fontFamily: event.target.value.trim() || undefined })
                }
              />
              <small>Example: DejaVu Serif. Leave blank to keep the book default.</small>
            </label>

            <label className="field-control" htmlFor="fontSize">
              <span>Font size</span>
              <Input
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
              <small>Optional base size between 6 and 48.</small>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-heading">
            <h3>Output quality</h3>
            <p>Tell Calibre what should be retained in the final PDF.</p>
          </div>

          <div className="checkbox-stack">
            <Checkbox
              checked={settings.embedFonts}
              disabled={disabled}
              onChange={(event) => onChange({ ...settings, embedFonts: event.target.checked })}
              label="Embed fonts"
              description="Include available font files in the generated PDF."
            />
            <Checkbox
              checked={settings.preserveCoverAspectRatio}
              disabled={disabled}
              onChange={(event) =>
                onChange({ ...settings, preserveCoverAspectRatio: event.target.checked })
              }
              label="Preserve cover aspect ratio"
              description="Avoid stretching the book cover during conversion."
            />
            <Checkbox
              checked={settings.preserveImages}
              disabled={disabled}
              onChange={(event) => onChange({ ...settings, preserveImages: event.target.checked })}
              label="Preserve images"
              description="Keep illustrations and inline images when the EPUB allows it."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
