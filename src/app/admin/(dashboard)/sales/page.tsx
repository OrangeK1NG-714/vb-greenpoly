import SalesWorkspace from "@/components/admin/SalesWorkspace";
import { prisma } from "@/lib/db";
import { goBackendEnabled, listInquiriesGo } from "@/lib/go-backend";
import { PRODUCTS, pick } from "@/lib/products-data";
import { quoteRecordToData, sampleRecordToData } from "@/lib/sales-records";
import type { SalesLead } from "@/lib/sales-tools";

export const dynamic = "force-dynamic";

async function loadSalesLeads(): Promise<SalesLead[]> {
  const inquiries = goBackendEnabled
    ? (await listInquiriesGo()).inquiries
    : await prisma.inquiry.findMany({ orderBy: { updatedAt: "desc" }, take: 200 });

  return inquiries.map((inquiry) => ({
    id: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company ?? "",
    country: inquiry.country ?? "",
    port: inquiry.port ?? "",
    product: inquiry.product ?? "",
    volume: inquiry.volume ?? "",
    incoterms: inquiry.incoterms ?? "",
    status: inquiry.status,
    createdAt: inquiry.createdAt.toISOString(),
    updatedAt: inquiry.updatedAt.toISOString(),
  }));
}

export default async function SalesPage() {
  const [leads, quoteRecords, sampleRecords] = await Promise.all([
    loadSalesLeads(),
    prisma.quoteDraft.findMany({ orderBy: { updatedAt: "desc" }, take: 500 }),
    prisma.sampleConfirmation.findMany({ orderBy: [{ inquiryId: "asc" }, { version: "desc" }], take: 500 }),
  ]);
  const products = PRODUCTS.map((product) => ({
    value: pick(product.name, "en"),
    label: `${product.category} · ${pick(product.name, "en")}`,
  }));

  return (
    <SalesWorkspace
      leads={leads}
      products={products}
      asOf={new Date().toISOString()}
      source={goBackendEnabled ? "go-backend" : "local"}
      initialQuotes={quoteRecords.map(quoteRecordToData)}
      initialSamples={sampleRecords.map(sampleRecordToData)}
    />
  );
}
