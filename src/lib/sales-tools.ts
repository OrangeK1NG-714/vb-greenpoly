export const SALES_STATUSES = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATING", "WON", "LOST"] as const;

export type SalesStatus = (typeof SALES_STATUSES)[number];
export type DraftLanguage = "en" | "fr" | "pt";
export type DraftTone = "professional" | "warm" | "concise";

export type SalesLead = {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
  port: string;
  product: string;
  volume: string;
  incoterms: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type QuoteInput = {
  quantityMt: number;
  supplierCostCnyPerMt: number;
  inlandAndPortCny: number;
  documentsCny: number;
  exchangeRateCnyPerUsd: number;
  targetMarginPercent: number;
  oceanFreightUsd: number;
  insurancePercent: number;
};

export type QuoteResult = {
  costBaseUsd: number;
  fobTotalUsd: number;
  fobPerMtUsd: number;
  oceanFreightUsd: number;
  insuranceUsd: number;
  cifTotalUsd: number;
  cifPerMtUsd: number;
  expectedGrossProfitUsd: number;
};

export type LeadAction = {
  label: string;
  detail: string;
  priority: "high" | "medium" | "low" | "done";
  idleDays: number;
};

function assertFiniteNonNegative(label: string, value: number) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number`);
  }
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  assertFiniteNonNegative("supplierCostCnyPerMt", input.supplierCostCnyPerMt);
  assertFiniteNonNegative("inlandAndPortCny", input.inlandAndPortCny);
  assertFiniteNonNegative("documentsCny", input.documentsCny);
  assertFiniteNonNegative("oceanFreightUsd", input.oceanFreightUsd);
  assertFiniteNonNegative("insurancePercent", input.insurancePercent);

  if (!Number.isFinite(input.quantityMt) || input.quantityMt <= 0) {
    throw new Error("quantityMt must be greater than zero");
  }
  if (!Number.isFinite(input.exchangeRateCnyPerUsd) || input.exchangeRateCnyPerUsd <= 0) {
    throw new Error("exchangeRateCnyPerUsd must be greater than zero");
  }
  if (!Number.isFinite(input.targetMarginPercent) || input.targetMarginPercent < 0 || input.targetMarginPercent >= 100) {
    throw new Error("targetMarginPercent must be between zero and 100");
  }

  const totalCostCny = (
    input.supplierCostCnyPerMt * input.quantityMt
    + input.inlandAndPortCny
    + input.documentsCny
  );
  const costBaseUsd = totalCostCny / input.exchangeRateCnyPerUsd;
  const marginRatio = input.targetMarginPercent / 100;
  const fobTotalUsd = costBaseUsd / (1 - marginRatio);
  const insuranceUsd = (fobTotalUsd + input.oceanFreightUsd) * (input.insurancePercent / 100);
  const cifTotalUsd = fobTotalUsd + input.oceanFreightUsd + insuranceUsd;

  return {
    costBaseUsd,
    fobTotalUsd,
    fobPerMtUsd: fobTotalUsd / input.quantityMt,
    oceanFreightUsd: input.oceanFreightUsd,
    insuranceUsd,
    cifTotalUsd,
    cifPerMtUsd: cifTotalUsd / input.quantityMt,
    expectedGrossProfitUsd: fobTotalUsd - costBaseUsd,
  };
}

function wholeDaysBetween(earlier: string, later: string): number {
  const start = new Date(earlier).getTime();
  const end = new Date(later).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

export function getLeadAction(lead: Pick<SalesLead, "status" | "updatedAt">, asOf: string): LeadAction {
  const idleDays = wholeDaysBetween(lead.updatedAt, asOf);

  switch (lead.status) {
    case "NEW":
      return {
        label: "Reply to inquiry",
        detail: idleDays > 0 ? `Waiting ${idleDays}d for first response` : "New today",
        priority: "high",
        idleDays,
      };
    case "CONTACTED":
      return {
        label: "Confirm specifications",
        detail: idleDays > 0 ? `Last activity ${idleDays}d ago` : "Contacted today",
        priority: idleDays >= 3 ? "high" : "medium",
        idleDays,
      };
    case "QUOTED":
      return {
        label: "Follow up on quote",
        detail: idleDays > 0 ? `Quote idle for ${idleDays}d` : "Quote sent today",
        priority: idleDays >= 3 ? "high" : "medium",
        idleDays,
      };
    case "NEGOTIATING":
      return {
        label: "Resolve open terms",
        detail: idleDays > 0 ? `Negotiation idle for ${idleDays}d` : "Active today",
        priority: idleDays >= 2 ? "high" : "medium",
        idleDays,
      };
    case "WON":
      return { label: "Order won", detail: "No sales follow-up due", priority: "done", idleDays };
    case "LOST":
      return { label: "Lead closed", detail: "No sales follow-up due", priority: "done", idleDays };
    default:
      return { label: "Review lead", detail: "Unknown pipeline status", priority: "low", idleDays };
  }
}

type FollowUpDraftInput = {
  lead: Pick<SalesLead, "name" | "company" | "country" | "port" | "product" | "volume" | "incoterms" | "status">;
  language: DraftLanguage;
  tone: DraftTone;
};

type DraftCopy = {
  subject: (lead: FollowUpDraftInput["lead"]) => string;
  greeting: (name: string) => string;
  intro: Record<DraftTone, string>;
  stage: Record<"NEW" | "CONTACTED" | "QUOTED" | "NEGOTIATING" | "DEFAULT", string>;
  details: (lead: FollowUpDraftInput["lead"]) => string;
  close: Record<DraftTone, string>;
};

const DRAFT_COPY: Record<DraftLanguage, DraftCopy> = {
  en: {
    subject: (lead) => `${lead.product || "Product"} inquiry${lead.company ? ` for ${lead.company}` : ""}`,
    greeting: (name) => `Dear ${name || "Sir or Madam"},`,
    intro: {
      professional: "Thank you for contacting GreenPoly. We have reviewed your requirements and are ready to prepare the next step.",
      warm: "Thank you for reaching out to GreenPoly. It is a pleasure to learn about your sourcing needs.",
      concise: "Thank you for your inquiry. We are ready to proceed with your request.",
    },
    stage: {
      NEW: "Could you confirm the target application, color, and any MFI or impact requirements? We can then recommend the right grade and sample.",
      CONTACTED: "We are following up on the specifications discussed. Once confirmed, we can reserve the matching grade and prepare a firm offer.",
      QUOTED: "Please let us know whether the quotation and shipping terms meet your target. We can review the grade, packing, and shipment window with you.",
      NEGOTIATING: "We are ready to close the remaining commercial and technical terms so production and shipment planning can begin.",
      DEFAULT: "Please share any updated specifications or purchasing schedule, and we will prepare the appropriate next step.",
    },
    details: (lead) => `Current requirement: ${lead.product || "recycled plastic pellets"}${lead.volume ? `, ${lead.volume}` : ""}${lead.incoterms ? `, ${lead.incoterms}` : ""}${lead.port ? ` to ${lead.port}` : ""}.`,
    close: {
      professional: "We look forward to your confirmation.\n\nBest regards,\nGreenPoly Sales",
      warm: "Happy to help with samples or technical details.\n\nWarm regards,\nGreenPoly Sales",
      concise: "Please reply with your confirmation.\n\nRegards,\nGreenPoly Sales",
    },
  },
  fr: {
    subject: (lead) => `Demande ${lead.product || "produit"}${lead.company ? ` - ${lead.company}` : ""}`,
    greeting: (name) => `Bonjour ${name || "Madame, Monsieur"},`,
    intro: {
      professional: "Merci d'avoir contacté GreenPoly. Nous avons examiné votre demande et sommes prêts à préparer la prochaine étape.",
      warm: "Merci d'avoir contacté GreenPoly. Nous sommes ravis de découvrir vos besoins d'approvisionnement.",
      concise: "Merci pour votre demande. Nous sommes prêts à avancer.",
    },
    stage: {
      NEW: "Pourriez-vous confirmer l'application, la couleur et les exigences MFI ou de résistance aux chocs ? Nous pourrons ensuite recommander le grade et l'échantillon adaptés.",
      CONTACTED: "Nous revenons vers vous au sujet des spécifications discutées. Dès qu'elles sont confirmées, nous pouvons réserver le grade adapté et préparer une offre ferme.",
      QUOTED: "Merci de nous indiquer si notre offre et les conditions d'expédition correspondent à votre objectif. Nous pouvons ajuster le grade, l'emballage et la période d'expédition.",
      NEGOTIATING: "Nous sommes prêts à finaliser les conditions commerciales et techniques restantes afin de planifier la production et l'expédition.",
      DEFAULT: "Merci de partager toute mise à jour des spécifications ou du calendrier d'achat afin que nous préparions la prochaine étape.",
    },
    details: (lead) => `Besoin actuel : ${lead.product || "granulés de plastique recyclé"}${lead.volume ? `, ${lead.volume}` : ""}${lead.incoterms ? `, ${lead.incoterms}` : ""}${lead.port ? ` vers ${lead.port}` : ""}.`,
    close: {
      professional: "Dans l'attente de votre confirmation.\n\nCordialement,\nEquipe commerciale GreenPoly",
      warm: "Nous restons disponibles pour les échantillons et les détails techniques.\n\nBien cordialement,\nEquipe commerciale GreenPoly",
      concise: "Merci de nous confirmer votre choix.\n\nCordialement,\nEquipe commerciale GreenPoly",
    },
  },
  pt: {
    subject: (lead) => `Consulta sobre ${lead.product || "produto"}${lead.company ? ` - ${lead.company}` : ""}`,
    greeting: (name) => `Prezado(a) ${name || "Senhor(a)"},`,
    intro: {
      professional: "Obrigado por entrar em contato com a GreenPoly. Analisamos sua solicitação e estamos prontos para preparar a próxima etapa.",
      warm: "Obrigado por falar com a GreenPoly. É um prazer conhecer suas necessidades de compra.",
      concise: "Obrigado pela consulta. Estamos prontos para avançar.",
    },
    stage: {
      NEW: "Poderia confirmar a aplicação, a cor e os requisitos de MFI ou impacto? Assim poderemos recomendar o grau e a amostra adequados.",
      CONTACTED: "Estamos acompanhando as especificações discutidas. Após a confirmação, podemos reservar o grau adequado e preparar uma oferta firme.",
      QUOTED: "Por favor, informe se a cotação e as condições de embarque atendem ao seu objetivo. Podemos revisar o grau, a embalagem e a janela de envio.",
      NEGOTIATING: "Estamos prontos para concluir os termos comerciais e técnicos restantes e iniciar o planejamento da produção e do embarque.",
      DEFAULT: "Compartilhe qualquer atualização das especificações ou do cronograma de compra para prepararmos a próxima etapa.",
    },
    details: (lead) => `Necessidade atual: ${lead.product || "pellets de plástico reciclado"}${lead.volume ? `, ${lead.volume}` : ""}${lead.incoterms ? `, ${lead.incoterms}` : ""}${lead.port ? ` para ${lead.port}` : ""}.`,
    close: {
      professional: "Aguardamos sua confirmação.\n\nAtenciosamente,\nEquipe de vendas GreenPoly",
      warm: "Teremos prazer em ajudar com amostras ou detalhes técnicos.\n\nCordialmente,\nEquipe de vendas GreenPoly",
      concise: "Por favor, responda com sua confirmação.\n\nAtenciosamente,\nEquipe de vendas GreenPoly",
    },
  },
};

export function createFollowUpDraft(input: FollowUpDraftInput): { subject: string; body: string } {
  const copy = DRAFT_COPY[input.language];
  const stage = input.lead.status in copy.stage
    ? input.lead.status as keyof typeof copy.stage
    : "DEFAULT";

  return {
    subject: copy.subject(input.lead),
    body: [
      copy.greeting(input.lead.name),
      "",
      copy.intro[input.tone],
      "",
      copy.details(input.lead),
      "",
      copy.stage[stage],
      "",
      copy.close[input.tone],
    ].join("\n"),
  };
}
