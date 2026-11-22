import { createHook } from "node:async_hooks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decodeUtf8Strict, readBoundedBytes } from "@/server/request-body";

const encoder = new TextEncoder();
const limits = { maxBytes: 1_000, deadlineMs: 5_000 };

function source(chunks: Uint8Array[], contentLength?: string) {
  let index = 0;
  const cancel = vi.fn();
  const pull = vi.fn((controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (index < chunks.length) controller.enqueue(chunks[index++]);
    else controller.close();
  });
  const body = new ReadableStream<Uint8Array>({ pull, cancel }, { highWaterMark: 0 });
  const headers = new Headers(contentLength === undefined ? {} : { "content-length": contentLength });
  return { headers, body, pull, cancel };
}

function platformRequest(body: ReadableStream<Uint8Array>) {
  const init: RequestInit & { duplex: "half" } = { method: "POST", body, duplex: "half" };
  return new Request("http://localhost/x", init);
}

beforeEach(() => {
  for (const method of ["log", "info", "warn", "error"] as const) {
    vi.spyOn(console, method).mockImplementation(() => {});
  }
});

afterEach(() => {
  try {
    for (const method of ["log", "info", "warn", "error"] as const) {
      expect(console[method]).not.toHaveBeenCalled();
    }
  } finally {
    vi.restoreAllMocks();
    vi.useRealTimers();
  }
});

describe("readBoundedBytes", () => {
  it("accepts exactly 30 Devanagari bytes and rejects one extra ASCII byte", async () => {
    // Naive character counting accepts the 31-byte body because it has only 11 code units.
    const text = "न".repeat(10);
    const exact = encoder.encode(text);
    const over = encoder.encode(text + "a");
    expect(exact.byteLength).toBe(30);
    expect((text + "a").length).toBeLessThanOrEqual(30);
    const cap = { maxBytes: 30, deadlineMs: 5_000 };
    const result = await readBoundedBytes(platformRequest(source([exact]).body), cap);
    expect(result).toEqual({ ok: true, bytes: exact });
    if (!result.ok) throw new Error("Expected an accepted body");
    expect(result.bytes.length).toBe(30);
    await expect(readBoundedBytes(platformRequest(source([over]).body), cap)).resolves.toEqual({
      ok: false, reason: "too_large",
    });
  });

  it("preserves a multibyte character split across chunks before decoding", async () => {
    // Naive text() exposes no raw byte result to verify across the split.
    const bytes = encoder.encode("नम");
    const result = await readBoundedBytes(source([bytes.slice(0, 2), bytes.slice(2)]), limits);
    expect(result).toEqual({ ok: true, bytes });
    if (!result.ok) throw new Error("Expected an accepted body");
    expect(decodeUtf8Strict(result.bytes)).toEqual({ ok: true, text: "नम" });
  });

  it.each(["1001", "99999999999999999999"])("rejects declared length %s without pulling", async (header) => {
    // Naive text() pulls the stream before inspecting the declared length.
    const request = source([new Uint8Array(10)], header);
    await expect(readBoundedBytes(request, limits)).resolves.toEqual({ ok: false, reason: "too_large" });
    expect(request.pull).not.toHaveBeenCalled();
    expect(request.cancel).toHaveBeenCalledTimes(1);
  });

  it("accepts a declared length equal to the byte cap", async () => {
    // Naive text() exposes no bytes to verify the exact declared byte boundary.
    const bytes = encoder.encode("न".repeat(10));
    await expect(readBoundedBytes(source([bytes], "30"), { ...limits, maxBytes: 30 })).resolves.toEqual({
      ok: true, bytes,
    });
  });

  it("stops at the cap plus one chunk when Content-Length lies low", async () => {
    // Naive text() buffers all 10,000 bytes and never cancels at the cap.
    const request = source(Array.from({ length: 100 }, () => new Uint8Array(100)), "10");
    await expect(readBoundedBytes(request, limits)).resolves.toEqual({ ok: false, reason: "too_large" });
    expect(request.cancel).toHaveBeenCalledTimes(1);
    expect(request.pull.mock.calls.length * 100).toBeLessThanOrEqual(limits.maxBytes + 100);
  });

  it("cancels an oversized chunked body without Content-Length", async () => {
    // Naive text() reads to completion instead of cancelling the oversized stream.
    const request = source([new Uint8Array(600), new Uint8Array(600), new Uint8Array(600)]);
    await expect(readBoundedBytes(request, limits)).resolves.toEqual({ ok: false, reason: "too_large" });
    expect(request.cancel).toHaveBeenCalledTimes(1);
    expect(request.pull).toHaveBeenCalledTimes(2);
  });

  it("times out a stalled stream at 5000ms and clears its timer", async () => {
    // Naive text() never resolves for a stream that never ends.
    vi.useFakeTimers();
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({ pull() {}, cancel }, { highWaterMark: 0 });
    const pending = readBoundedBytes({ headers: new Headers(), body }, limits);
    await vi.advanceTimersByTimeAsync(4_999);
    expect(cancel).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toEqual({ ok: false, reason: "timeout" });
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(body.locked).toBe(false);
  });

  it("times out continuously available empty chunks even when the timer cannot run", async () => {
    // Naive text() and a timer-only reader consume every empty chunk past the deadline.
    vi.useFakeTimers();
    let elapsedMs = 0;
    vi.spyOn(performance, "now").mockImplementation(() => elapsedMs);
    const cancel = vi.fn();
    const pull = vi.fn((controller: ReadableStreamDefaultController<Uint8Array>) => {
      // Close eventually so a broken reader fails instead of hanging the suite.
      if (elapsedMs >= 10_000) controller.close();
      else {
        elapsedMs += 1_000;
        controller.enqueue(new Uint8Array(0));
      }
    });
    const body = new ReadableStream<Uint8Array>({ pull, cancel }, { highWaterMark: 0 });

    // Advance only the monotonic clock in pull; the timeout callback never gets a turn.
    await expect(readBoundedBytes({ headers: new Headers(), body }, limits)).resolves.toEqual({
      ok: false, reason: "timeout",
    });
    expect(elapsedMs).toBe(limits.deadlineMs);
    expect(pull).toHaveBeenCalledTimes(5);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(body.locked).toBe(false);
  });

  it("keeps pending async work bounded across thousands of empty chunks", async () => {
    // Naive text() exposes no byte cap; empty chunks must not bypass the reader's memory bound.
    vi.useFakeTimers();
    const pendingPromises = new Set<number>();
    const hook = createHook({
      init(id, type) { if (type === "PROMISE") pendingPromises.add(id); },
      promiseResolve(id) { pendingPromises.delete(id); },
      destroy(id) { pendingPromises.delete(id); },
    });
    let pulls = 0;
    let baseline = 0;
    let peakAfterWarmup = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls++;
        if (pulls === 100) baseline = pendingPromises.size;
        if (pulls >= 100) peakAfterWarmup = Math.max(peakAfterWarmup, pendingPromises.size);
        if (pulls <= 10_000) controller.enqueue(new Uint8Array(0));
        else controller.close();
      },
    }, { highWaterMark: 0 });
    const request = platformRequest(body);

    hook.enable();
    try {
      await expect(readBoundedBytes(request, { ...limits, maxBytes: 0 })).resolves.toEqual({
        ok: true, bytes: new Uint8Array(0),
      });
    } finally {
      hook.disable();
    }
    expect(pulls).toBe(10_001);
    // Allow fixed stream/test bookkeeping, but no growth proportional to the chunk count.
    expect(peakAfterWarmup).toBeLessThanOrEqual(baseline + 32);
    expect(vi.getTimerCount()).toBe(0);
    expect(body.locked).toBe(false);
  });

  it.each(["ok", "streamed", "declared"] as const)("leaves no timer after %s", async (path) => {
    // Naive text() cannot establish or clear a body-read deadline.
    vi.useFakeTimers();
    const request = path === "ok" ? source([new Uint8Array(1)])
      : source([new Uint8Array(1_001)], path === "declared" ? "1001" : undefined);
    const result = await readBoundedBytes(request, limits);
    expect(result.ok).toBe(path === "ok");
    if (!result.ok) expect(result.reason).toBe("too_large");
    expect(vi.getTimerCount()).toBe(0);
    expect(request.body.locked).toBe(false);
  });

  it.each([null, "empty stream"])("accepts %s as zero bytes with a zero cap", async (kind) => {
    // Naive text() returns a string, so the zero-byte result is impossible to assert.
    vi.useFakeTimers();
    const request = kind === null ? { headers: new Headers(), body: null } : source([]);
    await expect(readBoundedBytes(request, { ...limits, maxBytes: 0 })).resolves.toEqual({
      ok: true, bytes: new Uint8Array(0),
    });
    expect(decodeUtf8Strict(new Uint8Array(0))).toEqual({ ok: true, text: "" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("returns BOM and invalid UTF-8 bytes unmodified", async () => {
    const bytes = Uint8Array.of(0xef, 0xbb, 0xbf, 0x7b, 0xff, 0x7d);
    await expect(readBoundedBytes(source([bytes.slice(0, 2), bytes.slice(2)]), limits)).resolves.toEqual({
      ok: true, bytes,
    });
  });

  it.each(["1001.0", "1001, 0", "+1001", "-1", "1e5", "Infinity", ""])(
    "ignores malformed Content-Length %j and enforces the counted cap", async (header) => {
      await expect(readBoundedBytes(source([new Uint8Array(1)], header), limits)).resolves.toEqual({
        ok: true, bytes: new Uint8Array(1),
      });
      const request = source([new Uint8Array(1_001)], header);
      await expect(readBoundedBytes(request, limits)).resolves.toEqual({ ok: false, reason: "too_large" });
      expect(request.pull).toHaveBeenCalledTimes(1);
      expect(request.cancel).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    { maxBytes: NaN, deadlineMs: 5_000 },
    { maxBytes: -1, deadlineMs: 5_000 },
    { maxBytes: 1.5, deadlineMs: 5_000 },
    { maxBytes: Infinity, deadlineMs: 5_000 },
    { maxBytes: Number.MAX_SAFE_INTEGER + 1, deadlineMs: 5_000 },
    { maxBytes: 1_000, deadlineMs: NaN },
    { maxBytes: 1_000, deadlineMs: Infinity },
    { maxBytes: 1_000, deadlineMs: -Infinity },
    { maxBytes: 1_000, deadlineMs: 0 },
    { maxBytes: 1_000, deadlineMs: -1 },
  ])("rejects invalid limits $maxBytes / $deadlineMs before touching the body", async (invalidLimits) => {
    const touched = vi.fn();
    const request = {
      headers: new Headers(),
      get body() { touched(); return null; },
    };
    await expect(readBoundedBytes(request, invalidLimits)).rejects.toBeInstanceOf(RangeError);
    expect(touched).not.toHaveBeenCalled();
  });

  it.each(["timeout", "streamed", "declared"] as const)("does not await a hanging cancel on %s", async (path) => {
    vi.useFakeTimers();
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const body = new ReadableStream<Uint8Array>({
      pull(controller) { if (path !== "timeout") controller.enqueue(new Uint8Array(1_001)); },
      cancel,
    }, { highWaterMark: 0 });
    const headers = new Headers(path === "declared" ? { "content-length": "1001" } : {});
    const pending = readBoundedBytes({ headers, body }, limits);
    if (path === "timeout") await vi.advanceTimersByTimeAsync(5_000);
    await expect(pending).resolves.toEqual({ ok: false, reason: path === "timeout" ? "timeout" : "too_large" });
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["timeout", "streamed", "declared"] as const)("swallows a rejected cancel on %s", async (path) => {
    vi.useFakeTimers();
    const cancel = vi.fn(() => Promise.reject(new Error("cancel failed")));
    const body = new ReadableStream<Uint8Array>({
      pull(controller) { if (path !== "timeout") controller.enqueue(new Uint8Array(1_001)); },
      cancel,
    }, { highWaterMark: 0 });
    const headers = new Headers(path === "declared" ? { "content-length": "1001" } : {});
    const pending = readBoundedBytes({ headers, body }, limits);
    if (path === "timeout") await vi.advanceTimersByTimeAsync(5_000);
    await expect(pending).resolves.toEqual({ ok: false, reason: path === "timeout" ? "timeout" : "too_large" });
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("propagates a stream error after clearing the timer and releasing the reader", async () => {
    vi.useFakeTimers();
    const error = new Error("source failed");
    const body = new ReadableStream<Uint8Array>({
      pull(controller) { controller.error(error); },
    }, { highWaterMark: 0 });
    await expect(readBoundedBytes({ headers: new Headers(), body }, limits)).rejects.toBe(error);
    expect(vi.getTimerCount()).toBe(0);
    expect(body.locked).toBe(false);
  });
});

describe("decodeUtf8Strict", () => {
  it.each([Uint8Array.of(0xff), Uint8Array.of(0xe0, 0xa4)])("rejects invalid UTF-8 %j without throwing", (bytes) => {
    // Naive text() replaces these invalid sequences with U+FFFD instead of rejecting them.
    expect(decodeUtf8Strict(bytes)).toEqual({ ok: false, reason: "invalid_encoding" });
  });

  it("strips a leading BOM from decoded text without modifying the bytes", () => {
    const bytes = Uint8Array.of(0xef, 0xbb, 0xbf, 0x7b, 0x7d);
    expect(decodeUtf8Strict(bytes)).toEqual({ ok: true, text: "{}" });
    expect(bytes).toEqual(Uint8Array.of(0xef, 0xbb, 0xbf, 0x7b, 0x7d));
  });
});
