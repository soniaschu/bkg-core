import { describe, expect, test } from "bun:test";
import {
  FAVICON_PNG_BASE64,
  FAVICON_PNG_BYTES,
  FAVICON_PNG_DATA_URL,
} from "./favicon";

// Regression test for silent data corruption in the embedded favicon.
//
// A single stray base64 character ("B") had been inserted into element 77,
// making the joined string 8449 chars long. Base64 length must be a multiple of
// 4, so atob() threw DOMException "The string contains invalid characters" at
// MODULE LOAD time. Because FAVICON_PNG_BYTES is computed at module scope, that
// made @plannotator/shared unimportable under Bun, which in turn broke every
// bundle that pulls it in (including the whole bkg-plan-engine plugin).
//
// The corruption was invisible to a per-character base64 check, because the
// inserted character was itself a valid base64 digit. These assertions
// therefore check structural invariants, not the alphabet.

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

describe("favicon base64 integrity", () => {
  test("length is a multiple of 4 (required by atob)", () => {
    expect(FAVICON_PNG_BASE64.length % 4).toBe(0);
  });

  test("contains only base64 alphabet characters", () => {
    expect(/^[A-Za-z0-9+/]+={0,2}$/.test(FAVICON_PNG_BASE64)).toBe(true);
  });

  test("padding is only at the end", () => {
    expect(FAVICON_PNG_BASE64.indexOf("=")).toBeGreaterThanOrEqual(0);
    expect(/=[^=]/.test(FAVICON_PNG_BASE64)).toBe(false);
  });

  test("decodes without throwing", () => {
    expect(() => atob(FAVICON_PNG_BASE64)).not.toThrow();
  });

  test("decoded byte count matches the base64 payload", () => {
    const expectedBytes = (FAVICON_PNG_BASE64.length / 4) * 3
      - (FAVICON_PNG_BASE64.endsWith("==") ? 2 : FAVICON_PNG_BASE64.endsWith("=") ? 1 : 0);
    expect(FAVICON_PNG_BYTES.length).toBe(expectedBytes);
  });
});

describe("favicon decodes to a real PNG", () => {
  test("starts with the PNG signature", () => {
    expect([...FAVICON_PNG_BYTES.slice(0, 8)]).toEqual(PNG_SIGNATURE);
  });

  test("first chunk is IHDR and last chunk is IEND", () => {
    expect(String.fromCharCode(...FAVICON_PNG_BYTES.slice(12, 16))).toBe("IHDR");
    expect(String.fromCharCode(...FAVICON_PNG_BYTES.slice(-8, -4))).toBe("IEND");
  });

  test("dimensions are the expected 64x64", () => {
    const view = new DataView(FAVICON_PNG_BYTES.buffer, FAVICON_PNG_BYTES.byteOffset);
    expect(view.getUint32(16)).toBe(64); // width
    expect(view.getUint32(20)).toBe(64); // height
  });

  test("byte length is the known-good 6335", () => {
    expect(FAVICON_PNG_BYTES.length).toBe(6335);
  });
});

describe("favicon data url", () => {
  test("is a well-formed png data url", () => {
    expect(FAVICON_PNG_DATA_URL.startsWith("data:image/png;base64,")).toBe(true);
  });

  test("payload matches the base64 constant", () => {
    expect(FAVICON_PNG_DATA_URL).toBe(`data:image/png;base64,${FAVICON_PNG_BASE64}`);
  });
});
