import { LIMITS, MONTHS } from '@/constants';
import { useArchive } from '@/context';
import { pluralize } from '@/utils/format.js';
import { BarMeter, CuriosityLog, HourHeatStrip, MonthBars, MoodArc, StatCard } from './insights/index.js';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Patterns — the "so what?" view.
 *
 * Every number here is computed from the raw receipts by `@/lib/insights`, i.e.
 * deleting this file loses no data, only a reading of it. Charts are described in
 * `./insights/*` where their accessibility alternatives live.
 */
export default function Insights() {
  const { insights: stats, connection } = useArchive();

  const lateNightPct = stats.musicTotal ? Math.round((stats.lateNightMusic / stats.musicTotal) * 100) : 0;
  const photoShare = stats.total ? Math.round((stats.totalPhotos / stats.total) * 100) : 0;
  const maxArtist = Math.max(...stats.topArtists.map(([, count]) => count), 1);

  return (
    <div className="insights">
      <header className="view-head">
        <h1 className="view-title">Patterns — what the receipts confess</h1>
        <p>
          Computed live from the raw records, in the browser. This is where the data stops being data: rhythm,
          money, mood and the places that repeat.
        </p>
      </header>

      <div className="ins-grid">
        <StatCard
          title="The 2 AM Index"
          value={`${lateNightPct}%`}
          note={`of all ${stats.musicTotal} logged plays happened between midnight and 4 AM — ${pluralize(
            stats.lateNightMusic,
            'late-night play'
          )}. The archive suspects one heavy season.`}
        />
        <StatCard
          title="The Ledger"
          value={`₹${stats.totalSpend.toLocaleString('en-IN')}`}
          note={`Traced across purchases. Busiest month: ${
            stats.busiestMonth
              ? `${MONTHS[stats.busiestMonth.month]} (${stats.busiestMonth.count} receipts)`
              : '—'
          }; quietest: ${
            stats.quietestMonth ? `${MONTHS[stats.quietestMonth.month]} (${stats.quietestMonth.count})` : '—'
          }.`}
        />
        <StatCard
          title="The Regulars"
          value={`${stats.uniquePlaces} places`}
          note="Where the year actually happened, by number of receipts."
        >
          {stats.topPlaces.map(([place, count]) => (
            <BarMeter
              key={place}
              label={place}
              value={count}
              max={stats.topPlaces[0][1]}
              color="#2f7d5a"
              suffix={`${count}×`}
            />
          ))}
        </StatCard>
        <StatCard
          title="The Soundtrack"
          value={`${stats.uniqueArtists} artists`}
          note="Top artists, then the people who heard the most from them."
        >
          {stats.topArtists.map(([artist, count]) => (
            <BarMeter
              key={artist}
              label={artist}
              value={count}
              max={maxArtist}
              color="#4a3b8f"
              suffix={`${count}×`}
            />
          ))}
          {stats.topContacts.length > 0 && (
            <p className="ins-note">
              Most messaged: {stats.topContacts.map(([name, count]) => `${name} (${count})`).join(' · ')} ·{' '}
              {pluralize(stats.uniqueContacts, 'distinct contact')}.
            </p>
          )}
        </StatCard>
      </div>

      <div className="ins-row2">
        <section className="ins-card ins-wide" aria-labelledby="ins-spend">
          <h3 id="ins-spend">Spending by month</h3>
          <MonthBars
            values={stats.spendByMonth}
            months={stats.months}
            caption={`Spending by month, total ₹${stats.totalSpend.toLocaleString('en-IN')}.`}
          />
        </section>
        <section className="ins-card ins-wide" aria-labelledby="ins-mood">
          <h3 id="ins-mood">Mood arc of the year</h3>
          <MoodArc moods={stats.moodByMonth} months={stats.months} average={stats.averageMood} />
          {stats.moodPeak != null && (
            <p className="ins-note">
              Average mood {stats.averageMood}/5 — lowest {stats.moodLow}, highest {stats.moodPeak}.
            </p>
          )}
        </section>
      </div>

      <div className="ins-row2">
        <section className="ins-card ins-wide" aria-labelledby="ins-hours">
          <h3 id="ins-hours">When the year happened (hour of day)</h3>
          <HourHeatStrip bins={stats.hourBins} label="Receipts by hour of day" />
          <p className="ins-note">
            Busiest weekday: {stats.busiestWeekday == null ? '—' : WEEKDAYS[stats.busiestWeekday]} ·{' '}
            {pluralize(stats.totalPhotos, 'photo')} ({photoShare}% of the archive)
          </p>
        </section>
        <section className="ins-card" aria-labelledby="ins-curiosity">
          <h3 id="ins-curiosity">Curiosity log</h3>
          <CuriosityLog searches={stats.searches} limit={LIMITS.INSIGHT_SEARCHES} />
        </section>
      </div>

      {stats.busiest && (
        <p className="ins-busiest">
          <strong>Busiest day: {stats.busiest.date}</strong> — {pluralize(stats.busiest.count, 'receipt')} in
          a single day. A day fully lived. Find it in the Explorer.
        </p>
      )}

      {stats.streak.days > 1 && (
        <p className="ins-busiest">
          <strong>Longest streak: {pluralize(stats.streak.days, 'consecutive day')}</strong> (
          {stats.streak.start} → {stats.streak.end}) — the habit the receipts never mention out loud.
        </p>
      )}

      <p className="ins-note ins-engine-note">
        Relationship engine: {connection.connected}/{connection.total} receipts connected (
        {connection.coverage}%),
        {` ${connection.averageLinks} links each on average`} · signals used:{' '}
        {connection.reasons.map(([reason, count]) => `${reason} (${count})`).join(', ')}.
      </p>
    </div>
  );
}
