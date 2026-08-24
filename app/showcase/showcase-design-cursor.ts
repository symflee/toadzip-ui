const CURSOR_PREFIX = "v1_";

export function encodeShowcaseDesignCursor(sequence: number) {
  if (!Number.isSafeInteger(sequence) || sequence < 1) {
    throw new Error("시안 cursor로 변환할 수 없는 순서입니다.");
  }
  return `${CURSOR_PREFIX}${sequence.toString(36)}`;
}

export function decodeShowcaseDesignCursor(cursor: string) {
  if (!/^v1_[0-9a-z]+$/.test(cursor)) {
    return null;
  }
  const sequence = Number.parseInt(cursor.slice(CURSOR_PREFIX.length), 36);
  if (!Number.isSafeInteger(sequence) || sequence < 1) {
    return null;
  }
  return sequence;
}
