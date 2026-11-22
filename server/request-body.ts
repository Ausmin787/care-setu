type BodySource = { headers: Headers; body: ReadableStream<Uint8Array> | null };
type BodyResult =
  | { ok: true; bytes: Uint8Array }
  | { ok: false; reason: "too_large" | "timeout" };

export async function readBoundedBytes(
  request: BodySource,
  { maxBytes, deadlineMs }: { maxBytes: number; deadlineMs: number },
): Promise<BodyResult> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new RangeError("maxBytes must be a non-negative safe integer");
  }
  if (!Number.isFinite(deadlineMs) || deadlineMs <= 0) {
    throw new RangeError("deadlineMs must be a positive finite number");
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && /^\d+$/.test(declaredLength) && Number(declaredLength) > maxBytes) {
    void request.body?.cancel().catch(() => {});
    return { ok: false, reason: "too_large" };
  }
  if (request.body === null) return { ok: true, bytes: new Uint8Array(0) };

  const reader = request.body.getReader();
  const startedAt = performance.now();
  let timedOut = false;
  // Cancellation settles a pending read without retaining a timeout handler per chunk.
  const timer = setTimeout(() => {
    timedOut = true;
    void reader.cancel().catch(() => {});
  }, deadlineMs);

  try {
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const result = await reader.read();
      // Ready chunks can keep the loop in microtasks and starve the timer callback.
      if (timedOut || performance.now() - startedAt >= deadlineMs) {
        if (!timedOut) void reader.cancel().catch(() => {});
        return { ok: false, reason: "timeout" };
      }
      if (result.done) {
        const bytes = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.byteLength;
        }
        return { ok: true, bytes };
      }

      length += result.value.byteLength;
      if (length > maxBytes) {
        void reader.cancel().catch(() => {});
        return { ok: false, reason: "too_large" };
      }
      // Own the bytes before the source can reuse its buffer on the next read.
      if (result.value.byteLength > 0) chunks.push(new Uint8Array(result.value));
    }
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}

export function decodeUtf8Strict(
  bytes: Uint8Array,
): { ok: true; text: string } | { ok: false; reason: "invalid_encoding" } {
  try {
    return { ok: true, text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, reason: "invalid_encoding" };
  }
}
