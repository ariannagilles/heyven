/** Stub: DiceBear only needs this for PNG/JPEG export; SVG avatars use toString/toDataUriSync. */
export function toPng() {
  throw new Error("@dicebear/converter is not available in this environment");
}

export function toJpeg() {
  throw new Error("@dicebear/converter is not available in this environment");
}
