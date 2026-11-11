import { HttpError } from "../src/errors";
import { parseId, positiveInteger, validateBody, validateName } from "../src/validation";

describe("positiveInteger", () => {
  test.each([1, 2147483647])("aceita %s", (value) => expect(positiveInteger(value, "RA")).toBe(value));
  test.each([0, -1, 1.5, NaN, Infinity, 2147483648, "123", null, undefined])("rejeita %p com HTTP 400", (value) => {
    try { positiveInteger(value, "RA"); throw new Error("deveria rejeitar"); } catch (e) { expect(e).toBeInstanceOf(HttpError); expect((e as HttpError).statusCode).toBe(400); }
  });
});

describe("parseId", () => {
  test.each([["1", 1], ["2147483647", 2147483647]])("converte %s", (value, expected) => expect(parseId(value, "RA")).toBe(expected));
  test.each(["1abc", "1.2", "1e2", "", "-1", "0", "2147483648", 123])("rejeita %p com HTTP 400", (value) => {
    try { parseId(value, "RA"); throw new Error("deveria rejeitar"); } catch (e) { expect(e).toBeInstanceOf(HttpError); expect((e as HttpError).statusCode).toBe(400); }
  });
});

describe("validateName", () => {
  test.each(["Ana", "a".repeat(100)])("aceita nome válido com %s", (value) => expect(validateName(value)).toBe(value));
  test.each(["", "ab", "   ", " a ", "a".repeat(101), 123, null, undefined])("rejeita %p com HTTP 400", (value) => {
    try { validateName(value); throw new Error("deveria rejeitar"); } catch (e) { expect(e).toBeInstanceOf(HttpError); expect((e as HttpError).statusCode).toBe(400); }
  });
});

describe("validateBody", () => {
  test("aceita e preserva objeto congelado", () => { const body = Object.freeze({ name: "Ana" }); expect(validateBody(body)).toBe(body); expect(body.name).toBe("Ana"); });
  test.each([null, undefined, [], "Ana", 12])("rejeita %p com HTTP 400", (value) => {
    try { validateBody(value); throw new Error("deveria rejeitar"); } catch (e) { expect(e).toBeInstanceOf(HttpError); expect((e as HttpError).statusCode).toBe(400); }
  });
  test("aceita campos extras sem alterar o objeto", () => { const body = { name: "Ana", extra: true }; expect(validateBody(body)).toBe(body); expect(body).toEqual({ name: "Ana", extra: true }); });
});
