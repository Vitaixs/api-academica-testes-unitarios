import { CoursesService } from "../../../src/modules/courses/courses.service";
import type { CourseRepository } from "../../../src/modules/courses/courses.repository";
import { HttpError } from "../../../src/errors";

const course = { id: 1, name: "Qualidade" };
const setup = () => {
  const repository: jest.Mocked<CourseRepository> = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn() };
  return { repository, service: new CoursesService(repository) };
};
const status = async (promise: Promise<unknown>, code: number) => { try { await promise; throw new Error("deveria falhar"); } catch (e) { expect(e).toBeInstanceOf(HttpError); expect((e as HttpError).statusCode).toBe(code); } };

test("cria curso e encaminha somente name (mock)", async () => { const { repository, service } = setup(); repository.create.mockResolvedValue(course); await expect(service.create({ name: "Qualidade" })).resolves.toEqual(course); expect(repository.create).toHaveBeenCalledTimes(1); expect(repository.create).toHaveBeenCalledWith({ name: "Qualidade" }); });
test.each([null, {}, { name: "A" }])("rejeita criação inválida %p sem acessar repositório", async (input) => { const { repository, service } = setup(); await status(service.create(input), 400); expect(repository.create).not.toHaveBeenCalled(); });
test("converte nome duplicado em 409", async () => { const { repository, service } = setup(); repository.create.mockRejectedValue({ code: "23505" }); await status(service.create({ name: "Qualidade" }), 409); });
test("lista cursos com resposta predefinida (stub)", async () => { const { repository, service } = setup(); repository.findAll.mockResolvedValue([course]); await expect(service.findAll()).resolves.toEqual([course]); expect(repository.findAll).toHaveBeenCalledTimes(1); });
test("busca curso existente e encaminha id", async () => { const { repository, service } = setup(); repository.findOne.mockResolvedValue(course); await expect(service.findOne(123)).resolves.toEqual(course); expect(repository.findOne).toHaveBeenCalledWith(123); });
test("retorna 404 para curso inexistente", async () => { const { service, repository } = setup(); repository.findOne.mockResolvedValue(undefined); await status(service.findOne(123), 404); });
test("rejeita id inválido sem consultar", async () => { const { service, repository } = setup(); await status(service.findOne(0), 400); expect(repository.findOne).not.toHaveBeenCalled(); });
test.each(["create", "findAll", "findOne"] as const)("propaga falha inesperada em %s", async (method) => { const { repository, service } = setup(); const error = new Error("db"); if (method === "create") repository.create.mockRejectedValue(error); if (method === "findAll") repository.findAll.mockRejectedValue(error); if (method === "findOne") repository.findOne.mockRejectedValue(error); const call = method === "create" ? service.create({ name: "Qualidade" }) : method === "findAll" ? service.findAll() : service.findOne(1); await expect(call).rejects.toBe(error); });
test("spy observa findOne de objeto existente", async () => { const stub: jest.Mocked<CourseRepository> = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn().mockResolvedValue(course) }; const spy = jest.spyOn(stub, "findOne"); const service = new CoursesService(stub); await expect(service.findOne(1)).resolves.toEqual(course); expect(spy).toHaveBeenCalledWith(1); });
test("remove campos extras antes de chamar repositório", async () => { const { repository, service } = setup(); repository.create.mockResolvedValue(course); await service.create({ name: "Qualidade", extra: true }); expect(repository.create).toHaveBeenCalledWith({ name: "Qualidade" }); });
