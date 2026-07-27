const defaultCredoBaseUrl = "https://api.credocentral.com";

export interface CredoPaymentData {
  transRef?: string;
  businessRef?: string;
  debitedAmount?: number;
  transAmount?: number;
  transFeeAmount?: number;
  settlementAmount?: number;
  amount?: number;
  currencyCode?: string;
  currency?: string;
  status?: number | string;
}

// Credo lifecycle: 0 = successful, 4 = queued for settlement, 5 = settled.
const SUCCESSFUL_STATUSES = new Set<number | string>([0, 4, 5, "0", "4", "5"]);
const PENDING_STATUSES = new Set<number | string>([12, 13, 14, 15, "12", "13", "14", "15"]);
const FAILED_STATUSES = new Set<number | string>([3, 7, 9, 10, "3", "7", "9", "10"]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isSuccessfulCredoStatus(status: unknown) {
  return SUCCESSFUL_STATUSES.has(status as number | string);
}

export function isPendingCredoStatus(status: unknown) {
  return PENDING_STATUSES.has(status as number | string);
}

export function isFailedCredoStatus(status: unknown) {
  return FAILED_STATUSES.has(status as number | string);
}

export function normalizeAmount(amount: unknown) {
  const value = Number(amount);
  return Number.isFinite(value) ? Math.round(value) : NaN;
}

export function getExpectedAmountKobo(orderTotalNaira: number, storedPaymentAmountKobo?: number | null) {
  if (storedPaymentAmountKobo && storedPaymentAmountKobo > 0) {
    return normalizeAmount(storedPaymentAmountKobo);
  }

  return normalizeAmount(orderTotalNaira * 100);
}

export function getPaidAmountKobo(paymentData: CredoPaymentData) {
  return normalizeAmount(
    paymentData.transAmount ?? paymentData.settlementAmount ?? paymentData.amount
  );
}

/**
 * Credo initialize sends amount in kobo, but verify/webhook payloads may return
 * either kobo (150000) or naira (1500 / 1500.0). Match both representations.
 * @see https://docs.credocentral.com/docs/developers/accept-payments
 */
export function amountsMatch(
  orderTotalNaira: number,
  actualRaw: unknown,
  storedPaymentAmountKobo?: number | null
) {
  const actual = Number(actualRaw);
  if (!Number.isFinite(actual)) {
    return false;
  }

  const totalNaira = normalizeAmount(orderTotalNaira);
  const expectedKobo = getExpectedAmountKobo(orderTotalNaira, storedPaymentAmountKobo);
  const actualRounded = normalizeAmount(actual);
  const actualAsKobo = normalizeAmount(actual * 100);
  const actualAsNairaFromKobo =
    actualRounded >= 1000 ? normalizeAmount(actualRounded / 100) : NaN;

  return (
    actualRounded === expectedKobo ||
    actualRounded === totalNaira ||
    actualAsKobo === expectedKobo ||
    actualAsNairaFromKobo === totalNaira
  );
}

export function validateCredoPayment(
  paymentData: CredoPaymentData,
  orderTotalNaira: number,
  storedPaymentAmountKobo?: number | null
) {
  const expectedAmountKobo = getExpectedAmountKobo(orderTotalNaira, storedPaymentAmountKobo);
  const actualAmount = paymentData.transAmount ?? paymentData.settlementAmount ?? paymentData.amount;
  const currency = (paymentData.currencyCode ?? paymentData.currency ?? "NGN")
    .toString()
    .toUpperCase();

  const statusOk = isSuccessfulCredoStatus(paymentData.status);
  const amountOk = amountsMatch(orderTotalNaira, actualAmount, storedPaymentAmountKobo);
  const currencyOk = !currency || currency === "NGN";

  return {
    // Credo docs: confirm status + amount before fulfilling.
    isPaid: statusOk && amountOk && currencyOk,
    isPending: isPendingCredoStatus(paymentData.status),
    isFailed: isFailedCredoStatus(paymentData.status),
    checks: {
      statusOk,
      amountOk,
      currencyOk,
      expectedAmountKobo,
      actualAmount,
      paymentStatus: paymentData.status,
      businessRef: paymentData.businessRef ?? null,
      currency,
    },
  };
}

async function fetchCredoTransactionOnce(transRef: string) {
  const credoSecretKey = process.env.CREDO_SECRET_KEY;
  const credoBaseUrl = process.env.CREDO_BASE_URL ?? defaultCredoBaseUrl;

  if (!credoSecretKey) {
    return { ok: false as const, status: 500, error: "Payment gateway not configured" };
  }

  const response = await fetch(`${credoBaseUrl}/transaction/${encodeURIComponent(transRef)}/verify`, {
    method: "GET",
    headers: {
      Authorization: credoSecretKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Credo verification error:", response.status, errorText);
    return {
      ok: false as const,
      status: response.status,
      error: "Payment verification failed",
    };
  }

  const payload = await response.json();
  const paymentData = (payload.data ?? payload) as CredoPaymentData;

  return {
    ok: true as const,
    payload,
    paymentData,
  };
}

export async function fetchCredoTransaction(transRef: string) {
  const retryDelaysMs = [0, 2000, 3000, 5000, 5000, 8000, 10000];
  let lastResult: Awaited<ReturnType<typeof fetchCredoTransactionOnce>> | null = null;

  for (const delayMs of retryDelaysMs) {
    if (delayMs > 0) {
      await sleep(delayMs);
    }

    const result = await fetchCredoTransactionOnce(transRef);
    lastResult = result;

    if (!result.ok) {
      return result;
    }

    if (isSuccessfulCredoStatus(result.paymentData.status)) {
      return result;
    }

    if (!isPendingCredoStatus(result.paymentData.status)) {
      return result;
    }
  }

  return lastResult!;
}

export function getFailureMessage(checks: ReturnType<typeof validateCredoPayment>["checks"]) {
  if (!checks.statusOk) {
    return `Payment is not confirmed yet (Credo status: ${checks.paymentStatus ?? "unknown"}).`;
  }

  if (!checks.amountOk) {
    return "Payment amount did not match your order total.";
  }

  if (!checks.currencyOk) {
    return "Payment currency was not NGN.";
  }

  return "Payment was not successful.";
}
