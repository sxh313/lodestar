import { describe, expect, it } from 'bun:test';
import type { ProviderResult } from '@finagent/core';
import { reconcileProviderResults } from '@finagent/core';

const policy = { version: 'financial-facts.v1', relativeTolerance: 0.03 };
const result = (providerId: string, value: number): ProviderResult<{ value: number }> => ({
  ok: true,
  data: { value },
  provenance: { providerId, providerName: providerId, fetchedAt: 1_700_000_000, stale: false },
});

describe('provider reconciliation fixtures', () => {
  it('classifies exact agreement', () => {
    const r = reconcileProviderResults([result('longbridge', 100), result('massive', 100)], (d, p) => ({ provider: p, value: d.value }), policy);
    expect(r.reconciliation.state).toBe('agreement');
  });
  it('classifies a material disagreement and keeps both candidates', () => {
    const r = reconcileProviderResults([result('longbridge', 100), result('massive', 130)], (d, p) => ({ provider: p, value: d.value }), policy);
    expect(r.reconciliation.state).toBe('material-conflict');
    expect(r.reconciliation.candidates).toHaveLength(2);
  });
  it('reports insufficient sources when one provider fails', () => {
    const failed: ProviderResult<{ value: number }> = { ok: false, error: { code: 'TIMEOUT', message: 'timeout' } };
    const r = reconcileProviderResults([result('longbridge', 100), failed], (d, p) => ({ provider: p, value: d.value }), policy);
    expect(r.reconciliation.state).toBe('insufficient-sources');
    expect(r.results).toHaveLength(2);
  });
});
