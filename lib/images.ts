// Kiểm tra src ảnh có thể render được hay không.
export function hasImageSrc(src?: string | null): src is string {
  return Boolean(src?.trim())
}
