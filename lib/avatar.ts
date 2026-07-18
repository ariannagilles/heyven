import { createAvatar } from "@dicebear/core";
import { shapes } from "@dicebear/collection";

export function avatarDataUri(nickname: string): string {
  const seed = nickname || "anon";
  return createAvatar(shapes, { seed }).toDataUriSync();
}
