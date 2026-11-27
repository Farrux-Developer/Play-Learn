// @vitest-environment jsdom
import axe from 'axe-core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Button,
  Chip,
  Dialog,
  Panel,
  ProgressRing,
  SpeechBubble,
  Stars,
  TermChip,
  Toast,
  Toggle,
} from './index';

afterEach(() => {
  cleanup();
});

async function assertZeroAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      // jsdom does not compute CSS variables/layout color contrast; Playwright checks real contrast
      'color-contrast': { enabled: false },
    },
  });
  expect(results.violations).toEqual([]);
}

describe('Phase 1 UI Primitives (Testing Library + axe)', () => {
  it('renders all primitives cleanly with zero axe violations', async () => {
    const { container } = render(
      <div data-surface="paper">
        <Panel variant="chamfered" state="active">
          <Button variant="primary">Bosib koʻr</Button>
          <Button variant="secondary" loading>
            Tekshir
          </Button>
          <Chip label="Algoritm" selected count={4} onClick={() => {}} />
          <Toggle label="Ovoz" checked={true} onChange={() => {}} />
          <TermChip
            term="Oʻzgaruvchi"
            definition="Nomlangan xotira qutisi."
            example="ball = 5"
          />
          <SpeechBubble text="Qadamni tekshirib koʻr." tone="hint" />
          <Stars earned={2} showNumeric />
          <ProgressRing value={75} state="mastered" label="Algoritm mahorati" />
          <Toast message="Saqlandi" tone="success" onDismiss={() => {}} />
        </Panel>
      </div>
    );

    await assertZeroAxeViolations(container);
  });

  it('toggles TermChip disclosure, Toggle switch, and closes Dialog on Escape', async () => {
    const onToggle = vi.fn();
    const onClose = vi.fn();

    const { container } = render(
      <div>
        <Toggle label="Subtitr" checked={false} onChange={onToggle} />
        <TermChip term="Bit" definition="0 yoki 1 qiymat." />
        <Dialog open title="Sinov" onClose={onClose}>
          <p>Dialog matni</p>
        </Dialog>
      </div>
    );

    const sw = screen.getByRole('switch', { name: /Subtitr/i });
    fireEvent.click(sw);
    expect(onToggle).toHaveBeenCalledWith(true);

    const termBtn = screen.getByRole('button', { name: /Bit/i });
    expect(termBtn.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(termBtn);
    expect(termBtn.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('0 yoki 1 qiymat.')).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    await assertZeroAxeViolations(container);
  });
});
