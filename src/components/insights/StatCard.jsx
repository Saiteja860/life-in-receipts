/**
 * One headline statistic with an explanatory sentence.
 * The whole Patterns view is built from these, so the "big number + why it
 * matters" pattern stays identical across every card.
 * @param {{ title: string, value: string|number, note?: string, children?: React.ReactNode }} props
 */
export default function StatCard({ title, value, note, children }) {
  return (
    <article className="ins-card">
      <h3>{title}</h3>
      <p className="ins-big">{value}</p>
      {note && <p className="ins-note">{note}</p>}
      {children}
    </article>
  );
}
