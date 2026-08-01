import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { InquiryService } from "../src/application/inquiries/inquiry-service";
import type {
  InquiryCreateInput,
  InquiryListResult,
  InquiryRecord,
  InquiryRepository,
} from "../src/domain/inquiries/inquiry-repository";

function fixtureInquiry(): InquiryRecord {
  return {
    id: "inq-1",
    name: "Demo buyer",
    email: "buyer@example.test",
    company: null,
    phone: null,
    country: "VN",
    port: null,
    product: "PP",
    volume: null,
    incoterms: null,
    message: null,
    status: "NEW",
    notes: null,
    sessionId: null,
    ipAddress: null,
    userAgent: null,
    referrer: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    createdAt: new Date("2026-07-29T00:00:00.000Z"),
    updatedAt: new Date("2026-07-29T00:00:00.000Z"),
  };
}

class FakeInquiryRepository implements InquiryRepository {
  readonly source = "local" as const;
  readonly created: InquiryCreateInput[] = [];
  readonly inquiry = fixtureInquiry();
  listQuery:
    | { status?: string; limit?: number; orderBy?: "createdAt" | "updatedAt" }
    | undefined;

  async create(input: InquiryCreateInput): Promise<string> {
    this.created.push(input);
    return this.inquiry.id;
  }

  async exists(id: string): Promise<boolean> {
    return id === this.inquiry.id;
  }

  async get(id: string): Promise<InquiryRecord | null> {
    return id === this.inquiry.id ? this.inquiry : null;
  }

  async list(
    status?: string,
    limit?: number,
    orderBy?: "createdAt" | "updatedAt",
  ): Promise<InquiryListResult> {
    this.listQuery = { status, limit, orderBy };
    return { inquiries: [this.inquiry], counts: { NEW: 1 } };
  }
}

test("InquiryService delegates use cases through the repository port", async () => {
  const repository = new FakeInquiryRepository();
  const service = new InquiryService(repository);
  const input = { name: "Demo buyer", email: "buyer@example.test" };

  assert.equal(service.source, "local");
  assert.equal(await service.create(input), "inq-1");
  assert.deepEqual(repository.created, [input]);
  assert.equal(await service.exists("inq-1"), true);
  assert.equal((await service.get("inq-1"))?.name, "Demo buyer");
  assert.deepEqual(await service.list("NEW", 200, "updatedAt"), {
    inquiries: [repository.inquiry],
    counts: { NEW: 1 },
  });
  assert.deepEqual(repository.listQuery, {
    status: "NEW",
    limit: 200,
    orderBy: "updatedAt",
  });
});

test("inquiry domain and application layers stay framework-independent", async () => {
  const files = [
    new URL("../src/domain/inquiries/inquiry-repository.ts", import.meta.url),
    new URL("../src/application/inquiries/inquiry-service.ts", import.meta.url),
  ];
  const forbiddenImport =
    /from\s+["'](?:next(?:\/|["'])|react(?:\/|["'])|@prisma|@\/(?:adapters|composition|lib)\/)/;

  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.equal(
      forbiddenImport.test(source),
      false,
      `${file.pathname} crossed a framework boundary`,
    );
  }
});
