import { cleanup, render } from '@testing-library/react';
import axe from 'axe-core';
import { createElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { DashboardShell } from './dashboard-shell';

afterEach(cleanup);

describe('DashboardShell accessibility', () => {
  it('has no automatically detectable accessibility violations', async () => {
    const { container } = render(createElement(DashboardShell));
    const result = await axe.run(container, {
      rules: { region: { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
