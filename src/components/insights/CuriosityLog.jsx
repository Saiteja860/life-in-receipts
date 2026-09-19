/**
 * The literal list of searches, in order of the year — the rawest possible
 * evidence that this is a person and not a dashboard.
 * @param {{ searches: string[], limit: number }} props
 */
export default function CuriosityLog({ searches, limit }) {
  const shown = searches.slice(0, limit);
  const remaining = Math.max(searches.length - shown.length, 0);

  return (
    <>
      <p className="ins-note">Actual searches, in order of the year:</p>
      <ol className="search-list">
        {shown.map((query, index) => (
          <li key={`${query}-${index}`}>{query}</li>
        ))}
      </ol>
      {remaining > 0 && <p className="ins-note">…{remaining} more in the Explorer.</p>}
    </>
  );
}
