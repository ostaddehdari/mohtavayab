import { cleanup, render } from '@testing-library/react';
import axe from 'axe-core';
import { createElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { WorkspaceAdmin } from './workspace-admin';

afterEach(cleanup);

describe('WorkspaceAdmin accessibility', () => {
  it('has no automatically detectable accessibility violations', async () => {
    const { container } = render(createElement(WorkspaceAdmin));
    const result = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
