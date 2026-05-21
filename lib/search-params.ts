export type RouteSearchParams = Record<string, string | string[] | undefined>

export function readSearchParam(value: string | string[] | undefined, fallback = "") {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback
}
