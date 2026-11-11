import { isUniqueViolation } from "../../src/database/unique-violation";
test("reconhece violação de unicidade PostgreSQL", () => expect(isUniqueViolation({ code: "23505" })).toBe(true));
test.each([null, undefined, "23505", 23503, {}, { code: "outro" }])("não reconhece %p como violação de unicidade", (value) => expect(isUniqueViolation(value)).toBe(false));
