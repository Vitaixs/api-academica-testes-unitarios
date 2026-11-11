import { isForeignKeyViolation } from "../../src/database/foreign-key-violation";
test("reconhece violação de chave estrangeira PostgreSQL", () => expect(isForeignKeyViolation({ code: "23503" })).toBe(true));
test.each([null, undefined, "23505", 23503, {}, { code: "outro" }])("não reconhece %p como violação de chave estrangeira", (value) => expect(isForeignKeyViolation(value)).toBe(false));
