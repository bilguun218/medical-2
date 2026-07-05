import type { InquiryStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const inquiryStatuses = ["NEW", "IN_REVIEW", "REPLIED", "CLOSED"] as const satisfies InquiryStatus[];

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  NEW: "Шинэ",
  IN_REVIEW: "Хянаж байна",
  REPLIED: "Хариулсан",
  CLOSED: "Хаасан"
};

export type InquiryQuery = {
  q?: string | null;
  status?: string | null;
  id?: string | null;
  date?: string | null;
  month?: string | null;
};

export function normalizeInquiryStatus(status?: string | null): InquiryStatus | undefined {
  return inquiryStatuses.includes(status as InquiryStatus) ? (status as InquiryStatus) : undefined;
}

function parseDateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const check = new Date(Date.UTC(year, month - 1, day));

  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function parseMonthParts(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText] = match;
  const year = Number(yearText);
  const month = Number(monthText);

  if (month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

function toLocalDateStart({ year, month, day }: { year: number; month: number; day: number }) {
  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  return new Date(`${year}-${paddedMonth}-${paddedDay}T00:00:00.000+08:00`);
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function buildCreatedAtFilter({ date, month }: Pick<InquiryQuery, "date" | "month">): Prisma.DateTimeFilter | undefined {
  const normalizedDate = date?.trim();
  const normalizedMonth = month?.trim();

  if (normalizedDate) {
    const parts = parseDateParts(normalizedDate);
    if (!parts) return undefined;

    const start = toLocalDateStart(parts);
    return { gte: start, lt: addUtcDays(start, 1) };
  }

  if (normalizedMonth) {
    const parts = parseMonthParts(normalizedMonth);
    if (!parts) return undefined;

    const start = toLocalDateStart({ ...parts, day: 1 });
    const nextMonth =
      parts.month === 12
        ? { year: parts.year + 1, month: 1 }
        : { year: parts.year, month: parts.month + 1 };
    const end = toLocalDateStart({ ...nextMonth, day: 1 });

    return { gte: start, lt: end };
  }

  return undefined;
}

export function buildInquiryWhere({ q, status, id, date, month }: InquiryQuery): Prisma.ContactInquiryWhereInput {
  const normalizedStatus = normalizeInquiryStatus(status);
  const search = q?.trim();
  const createdAt = buildCreatedAtFilter({ date, month });

  return {
    ...(id ? { id } : {}),
    ...(normalizedStatus ? { status: normalizedStatus } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { organization: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
            { message: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };
}

export function getAdminInquiries(query: InquiryQuery = {}) {
  return db.contactInquiry.findMany({
    where: buildInquiryWhere(query),
    include: {
      product: {
        include: { category: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export function getAdminInquiry(id: string) {
  return db.contactInquiry.findUnique({
    where: { id },
    include: {
      product: {
        include: { category: true }
      }
    }
  });
}
