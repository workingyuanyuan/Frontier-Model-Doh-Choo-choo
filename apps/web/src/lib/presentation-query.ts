export const WEB_THEMES = ['editorial', 'studio'] as const;

export type WebTheme = (typeof WEB_THEMES)[number];
export type QueryValue = string | string[] | undefined;

export class InvalidPresentationQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPresentationQueryError';
  }
}

function singleValue(value: QueryValue, name: string): string | undefined {
  if (Array.isArray(value)) {
    throw new InvalidPresentationQueryError(`${name} must occur once`);
  }
  return value;
}

export function resolveWebTheme(value: QueryValue): WebTheme {
  const theme = singleValue(value, 'theme') ?? 'editorial';
  if (!WEB_THEMES.includes(theme as WebTheme)) {
    throw new InvalidPresentationQueryError('Unsupported theme');
  }
  return theme as WebTheme;
}

export function validateEditionQuery(
  value: QueryValue,
  activeEditionId: string | null,
): string | null {
  const edition = singleValue(value, 'edition');
  if (edition === undefined) return activeEditionId;
  if (activeEditionId === null || edition !== activeEditionId) {
    throw new InvalidPresentationQueryError('Edition is not active');
  }
  return edition;
}

export function buildPresentationQuery(input: {
  editionId: string | null;
  theme: WebTheme;
  models?: readonly string[];
}): string {
  const query = new URLSearchParams();
  if (input.editionId) query.set('edition', input.editionId);
  query.set('theme', input.theme);
  for (const slug of input.models ?? []) query.append('models', slug);
  return query.toString();
}
