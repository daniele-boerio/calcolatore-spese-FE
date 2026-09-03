import "./progress_bar.scss";

export type SegmentTone =
  | "accent"
  /** Quota "prevista" / "accantonata": l'accento in tono più tenue. */
  | "accent-2"
  | "positive"
  | "negative";

export type ProgressSegment = {
  /** Quota sul totale, da 0 a 1. */
  value: number;
  tone: SegmentTone;
};

type ProgressBarProps = {
  segments: ProgressSegment[];
  /** Il design usa 6px nelle liste, 8px nei debiti, 10-12px negli hero. */
  height?: 6 | 8 | 10 | 12;
  label?: string;
  className?: string;
};

/**
 * Barra a segmenti su track `--track`. Un solo segmento serve la percentuale
 * semplice; più segmenti impilano speso/previsto o uscite/accantonato/rimasto.
 */
export default function ProgressBar({
  segments,
  height = 6,
  label,
  className,
}: ProgressBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div
      className={`progress progress--h${height} ${className ?? ""}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(total * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {segments.map((segment, index) => (
        <span
          key={index}
          className={`progress__segment progress__segment--${segment.tone}`}
          style={{ width: `${Math.max(0, Math.min(1, segment.value)) * 100}%` }}
        />
      ))}
    </div>
  );
}
