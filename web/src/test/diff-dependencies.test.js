/**
 * Test file to verify that diff viewer dependencies are properly installed
 * and can be imported without errors
 */

// Test imports
import { describe, it, expect } from 'vitest';

describe('Diff Viewer Dependencies', () => {
  it('should import react-diff-view without errors', async () => {
    const { parseDiff, Diff, Hunk } = await import('react-diff-view');
    expect(parseDiff).toBeDefined();
    expect(Diff).toBeDefined();
    expect(Hunk).toBeDefined();
  });

  it('should import diff library without errors', async () => {
    const diff = await import('diff');
    expect(diff.createTwoFilesPatch).toBeDefined();
    expect(diff.structuredPatch).toBeDefined();
  });

  it('should import refractor without errors', async () => {
    const refractor = await import('refractor');
    expect(refractor.default).toBeDefined();
  });

  it('should import prismjs without errors', async () => {
    const Prism = await import('prismjs');
    expect(Prism.default).toBeDefined();
  });
});
