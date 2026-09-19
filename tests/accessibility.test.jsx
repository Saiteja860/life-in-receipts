import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockMatchMedia } from './setup.js';
import { renderApp } from './utils.jsx';

describe('accessibility contract', () => {
  it('exposes the skip link first and points it at a real main region', async () => {
    renderApp({ hash: '#/story' });

    const skip = screen.getByRole('link', { name: /skip to content/i });
    expect(skip).toHaveAttribute('href', '#main-content');
    expect(await screen.findByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('labels the primary navigation and marks the current page', async () => {
    renderApp({ hash: '#/explore' });
    const nav = await screen.findByRole('navigation', { name: /primary/i });

    expect(within(nav).getByRole('link', { name: 'Explorer' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'The Story' })).not.toHaveAttribute('aria-current');
  });

  it('keeps a single top-level heading per view', async () => {
    renderApp({ hash: '#/explore' });
    await screen.findByRole('heading', { level: 1, name: /explorer/i });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('gives every control an accessible name', async () => {
    renderApp({ hash: '#/story' });
    await screen.findByRole('heading', { level: 1 });

    for (const button of screen.getAllByRole('button')) {
      const name = (button.getAttribute('aria-label') ?? button.textContent ?? '').trim();
      expect(name.length, `button without a name: ${button.outerHTML.slice(0, 80)}`).toBeGreaterThan(0);
    }
  });

  it('associates the search field with its label and hint', async () => {
    renderApp({ hash: '#/explore' });
    const input = await screen.findByLabelText(/search receipts/i);
    const hintId = input.getAttribute('aria-describedby');

    expect(hintId).toBeTruthy();
    expect(document.getElementById(hintId)?.textContent).toMatch(/searches titles/i);
  });

  it('exposes charts as described images with text alternatives', async () => {
    renderApp({ hash: '#/insights' });
    await screen.findByRole('heading', { level: 1 });

    expect(screen.getByRole('img', { name: /mood arc/i })).toBeInTheDocument();
    expect(screen.getByText(/peak hour:/i)).toBeInTheDocument();
  });

  it('announces view changes and result counts through live regions', async () => {
    renderApp({ hash: '#/explore' });
    await screen.findByRole('heading', { level: 1 });

    expect(screen.getByTestId('announcer')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByTestId('result-count')).toHaveAttribute('aria-live', 'polite');
  });

  it('traps focus inside the dialog and restores the page afterwards', async () => {
    const user = userEvent.setup();
    renderApp({ hash: '#/explore?q=rooftop' });

    const cards = await screen.findAllByRole('button', { name: /open this receipt's threads/i });
    await user.click(cards[0]);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(document.getElementById(dialog.getAttribute('aria-labelledby'))).toHaveTextContent(/rooftop/i);
    expect(document.body.style.overflow).toBe('hidden');

    for (let i = 0; i < 8; i += 1) await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('');
    expect(cards[0]).toHaveFocus();
  });

  it('describes chapter disclosures with aria-expanded and aria-controls', async () => {
    const user = userEvent.setup();
    renderApp({ hash: '#/story' });

    const [toggle] = await screen.findAllByRole('button', { name: /more receipts in this chapter/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const grid = document.getElementById(toggle.getAttribute('aria-controls'));
    expect(grid).toBeTruthy();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('hides purely decorative artwork from assistive tech', async () => {
    renderApp({ hash: '#/explore' });
    await screen.findByRole('heading', { level: 1 });

    for (const barcode of document.querySelectorAll('.barcode')) {
      expect(barcode).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('skips the cover animation for reduced-motion users', async () => {
    mockMatchMedia((query) => query.includes('prefers-reduced-motion'));
    renderApp();

    expect(await screen.findByRole('button', { name: /unwrap the archive/i })).toBeEnabled();
    expect(screen.getByText(/scanning for meaning/i)).toBeInTheDocument();
    mockMatchMedia();
  });

  it('renders the compact navigation toggle on small viewports', async () => {
    mockMatchMedia((query) => query.includes('max-width: 720px'));
    const user = userEvent.setup();
    renderApp({ hash: '#/story' });

    const toggle = await screen.findByRole('button', { name: /navigation menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    mockMatchMedia();
  });
});
