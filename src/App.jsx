import { Suspense, lazy } from 'react';
import { VIEWS } from '@/constants';
import { useArchive } from '@/context';
import { usePrefersReducedMotion } from '@/hooks';
import Announcer from './components/Announcer.jsx';
import AppFooter from './components/AppFooter.jsx';
import Cover from './components/Cover.jsx';
import ReceiptModal from './components/ReceiptModal.jsx';
import TopNav from './components/TopNav.jsx';
import ViewLoading from './components/ViewLoading.jsx';

// The three archive views are code-split: a visitor who only reads the Story
// never downloads the Explorer's filter engine or the Patterns charts. Cover is
// imported eagerly because it is the first paint — no request waterfall there.
const StoryView = lazy(() => import('./components/StoryView.jsx'));
const Explorer = lazy(() => import('./components/Explorer.jsx'));
const Insights = lazy(() => import('./components/Insights.jsx'));

/**
 * Composition root.
 *
 * App owns layout and nothing else: all data, route and interaction state comes
 * from `useArchive()`, and each view renders itself from the same store. That is
 * why this file stays under ~70 lines no matter how many views are added.
 */
export default function App() {
  const {
    view,
    insights,
    enterArchive,
    goToView,
    selectedReceipt,
    selectedLinks,
    openReceipt,
    closeReceipt,
    announcement,
  } = useArchive();
  const reduceMotion = usePrefersReducedMotion();

  if (view === VIEWS.COVER) {
    return (
      <>
        <Cover stats={insights} onEnter={enterArchive} reduceMotion={reduceMotion} />
        <Announcer message={announcement} />
      </>
    );
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <TopNav view={view} onHome={() => goToView(VIEWS.COVER)} />

      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<ViewLoading label={view} />}>
          {view === VIEWS.STORY && <StoryView />}
          {view === VIEWS.EXPLORE && <Explorer />}
          {view === VIEWS.INSIGHTS && <Insights />}
        </Suspense>
        <AppFooter />
      </main>

      <ReceiptModal
        receipt={selectedReceipt}
        links={selectedLinks}
        onClose={closeReceipt}
        onOpen={openReceipt}
      />
      <Announcer message={announcement} />
    </div>
  );
}
