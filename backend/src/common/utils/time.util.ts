interface DurationUnitConfig {
  unit: string;
  multiplier: number;
}

const SUPPORTED_UNITS: DurationUnitConfig[] = [
  { unit: 'ms', multiplier: 1 },
  { unit: 's', multiplier: 1000 },
  { unit: 'm', multiplier: 1000 * 60 },
  { unit: 'h', multiplier: 1000 * 60 * 60 },
  { unit: 'd', multiplier: 1000 * 60 * 60 * 24 },
];

export function parseDuration(duration: string): number {
  const trimmed = duration.trim();
  const match = trimmed.match(/^(\d+)(ms|s|m|h|d)$/i);
  if (!match) {
    throw new Error(`Unsupported duration format: ${duration}`);
  }

  const [, value, unitRaw] = match;
  const unit = unitRaw.toLowerCase();
  const numericValue = Number.parseInt(value, 10);
  if (Number.isNaN(numericValue)) {
    throw new Error(`Invalid duration value: ${duration}`);
  }

  const config = SUPPORTED_UNITS.find((item) => item.unit === unit);
  if (!config) {
    throw new Error(`Unsupported duration unit: ${unit}`);
  }

  return numericValue * config.multiplier;
}

export function calculateExpiryDate(duration: string): Date {
  const milliseconds = parseDuration(duration);
  return new Date(Date.now() + milliseconds);
}
