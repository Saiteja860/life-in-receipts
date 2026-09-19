import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockMatchMedia } from './setup.js';
import { renderApp } from './utils.jsx';

describe('application flow', () => {
  it('unwraps the archive from the cover into the story', async () => {
    mockMatchMedia((query) => query.includes('prefers-reduced-motion')); // skip the decode animation
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByRole('heading', { level: 1, name: /your life/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /unwrap the archive/i }));

    expect(
      await screen.findByRole('heading', { level: 1, name: /the story in eight chapters/i })
    ).toBeInTheDocument();
    expect(window.location.hash).toBe('#/story');
    mockMatchMedia();
  });

  it('deep-links straight into a filtered explorer view', async () => {
    renderApp({ hash: '#/explore?q=rooftop&month=1' });

    const search = await screen.findByLabelText(/search receipts/i);
    expect(search).toHaveValue('rooftop');
    await waitFor(() => expect(screen.getByTestId('result-count')).toHaveTextContent(/^1 of 163 receipts$/));
  });

  it('navigates between views through the primary nav and keeps the hash in sync', async () => {
    const user = userEvent.setup();
    renderApp({ hash: '#/story' });

    await screen.findByRole('heading', { level: 1, name: /the story in eight chapters/i });
    await user.click(screen.getByRole('link', { name: 'Patterns' }));

    expect(await screen.findByRole('heading', { level: 1, name: /patterns/i })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/insights');
    expect(screen.getByRole('link', { name: 'Patterns' })).toHaveAttribute('aria-current', 'page');
  });

  it('filters as the visitor types (debounced into the URL)', async () => {
    const user = userEvent.setup();
    renderApp({ hash: '#/explore' });

    await screen.findByRole('heading', { level: 1, name: /explorer/i });
    await user.type(screen.getByLabelText(/search receipts/i), 'cubbon');

    await waitFor(() => expect(window.location.hash).toContain('q=cubbon'));
    await waitFor(() => expect(screen.getByTestId('result-count')).toHaveTextContent(/^5 of 163 receipts$/));
  });

  it('filters by category chip and reports the pressed state', async () => {
    const user = userEvent.setup();
    renderApp({ hash: '#/explore' });

    const chips = await screen.findByRole('group', { name: /filter by receipt category/i });
    const photoChip = within(chips).getByRole('button', { name: /photo/i });
    expect(photoChip).toHaveAttribute('aria-pressed', 'false');

    await user.click(photoChip);

    expect(photoChip).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(photoChip.className).toContain('on'));
    await waitFor(() => expect(window.location.hash).toContain('type=photo'));
  });

  it('clears every filter with one action', async () => {
    const user = userEvent.setup();
    renderApp({ hash: '#/explore?q=goa&type=photo&month=6&sort=desc' });

    await waitFor(() => expect(screen.getByTestId('result-count')).not.toHaveTextContent(/^163/));
    await user.click(await screen.findByRole('button', { name: /clear 4 filters/i }));

    await waitFor(() => expect(window.location.hash).toBe('#/explore'));
    expect(screen.getByLabelText(/search receipts/i)).toHaveValue('');
    await waitFor(() =>
      expect(screen.getByTestId('result-count')).toHaveTextContent(/^163 of 163 receipts$/)
    );
  });

  it('copies the current filtered URL to the clipboard', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    renderApp({ hash: '#/explore?q=goa' });
    await user.click(await screen.findByRole('button', { name: /copy view link/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(screen.getByTestId('announcer').textContent).toMatch(/copied/i);
  });

  it('opens a receipt thread modal, then closes it with Escape', async () => {
    const user = userEvent.setup();
    renderApp({ hash: '#/explore?q=rooftop' });

    const [card] = await screen.findAllByRole('button', { name: /open this receipt's threads/i });
    await user.click(card);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(within(dialog).getByText(/found in the same threads/i)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // focus returns to the card that opened the dialog
    expect(card).toHaveFocus();
  });

  it('switches the connection lens from the story header', async () => {
    const user = userEvent.setup();
    renderApp({ hash: '#/story' });

    const lens = await screen.findByRole('button', { name: /connection lens/i });
    expect(lens).toHaveAttribute('aria-pressed', 'true');

    await user.click(lens);
    expect(lens).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders the patterns view with computed statistics', async () => {
    renderApp({ hash: '#/insights' });

    expect(await screen.findByRole('heading', { name: /the 2 am index/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /the ledger/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /spending by month/i })).toBeInTheDocument();
    expect(screen.getByText(/of all \d+ logged plays/i)).toBeInTheDocument();
  });

  it('shows the archive provenance and keyboard contract in the footer', async () => {
    renderApp({ hash: '#/insights' });
    expect(await screen.findByRole('heading', { name: /keyboard & screen readers/i })).toBeInTheDocument();
    expect(screen.getByTestId('dataset-note')).toHaveTextContent(/fictional/i);
  });
});
