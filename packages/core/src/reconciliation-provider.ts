import type { ProviderResult } from './provider.ts';
import type { FinancialFactCandidate, ReconciliationPolicy, ReconciliationResult } from './reconciliation.ts';
import { reconcileFinancialFacts } from './reconciliation.ts';

export interface ReconciledProviderResults<T> {
  results: ProviderResult<T>[];
  reconciliation: ReconciliationResult;
}

/** Reconcile provider results while preserving failed and successful evidence. */
export function reconcileProviderResults<T>(
  results: ProviderResult<T>[],
  toCandidate: (data: T, providerId: string, providerName: string) => FinancialFactCandidate,
  policy: ReconciliationPolicy
): ReconciledProviderResults<T> {
  const candidates = results
    .filter((result): result is Extract<ProviderResult<T>, { ok: true }> => result.ok)
    .map((result) => toCandidate(result.data, result.provenance.providerId, result.provenance.providerName));
  return { results: [...results], reconciliation: reconcileFinancialFacts(candidates, policy) };
}
