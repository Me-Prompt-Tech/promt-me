type CompanyScopedWhere = {
  companyId: string;
};

type SessionLike = {
  user?: {
    companyId?: string | null;
  };
};

export function requireCompanyId(session: SessionLike): string {
  const companyId = session.user?.companyId;

  if (!companyId) {
    throw new Error("Missing companyId for company-scoped query.");
  }

  return companyId;
}

export function companyWhere<TWhere extends object>(
  session: SessionLike,
  where?: TWhere
): TWhere & CompanyScopedWhere {
  return {
    ...(where ?? {}),
    companyId: requireCompanyId(session),
  } as TWhere & CompanyScopedWhere;
}

export function assertSameCompany(
  session: SessionLike,
  targetCompanyId: string
) {
  const companyId = requireCompanyId(session);

  if (companyId !== targetCompanyId) {
    throw new Error("Cross-company access is not allowed.");
  }
}

/**
 * Example:
 *
 * const session = await auth();
 * const documents = await prisma.document.findMany({
 *   where: companyWhere(session, { status: "PENDING" }),
 * });
 */
