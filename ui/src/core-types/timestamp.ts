export type Timestamp = [number, number];

export function millisToTimestamp(millis: number): Timestamp {
  const secs = Math.floor(millis / 1000);
  const nanos = (millis % 1000) * 1000;
  return [secs, nanos];
}

export function timestampToMillis(timestamp: Timestamp): number {
  return timestamp[0] * 1000 + Math.floor(timestamp[1] / 1000);
}

export function now(): Timestamp {
  return millisToTimestamp(Date.now());
}
