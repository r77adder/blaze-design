// Google local-pack style stack of competitor listings. Each row reads as
// a Maps card — photo, name, rating, address, hours. Used for the "Looking
// for competitors" scan step.

const COMPETITORS = [
  {
    name: 'Austin Air Pros',
    rating: '4.8',
    reviews: '1.2K',
    range: '$150–$400',
    address: '5821 Burnet Rd, Austin, TX',
    hours: 'Open 24 hours',
    photo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=160&q=75',
  },
  {
    name: 'Reliable Comfort HVAC',
    rating: '4.7',
    reviews: '892',
    range: '$120–$380',
    address: '3104 N Lamar Blvd, Austin, TX',
    hours: 'Closed · Opens 7 AM',
    photo: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=160&q=75',
  },
  {
    name: 'Lone Star Heating & Air',
    rating: '4.6',
    reviews: '654',
    range: '$140–$420',
    address: '2210 S Congress Ave, Austin, TX',
    hours: 'Open 24 hours',
    photo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=160&q=75',
  },
  {
    name: 'Hill Country HVAC',
    rating: '4.5',
    reviews: '418',
    range: '$130–$390',
    address: '8001 Research Blvd, Austin, TX',
    hours: 'Closed · Opens 8 AM',
    photo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=160&q=75',
  },
];

export function CompetitorListPanel() {
  return (
    <div
      style={{
        background: 'var(--light-100)',
        borderRadius: 14,
        border: '1px solid var(--dark-8)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
        padding: 20,
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-60)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Local pack · HVAC repair Austin
        </div>
        <div style={{ fontSize: 11, color: 'var(--dark-40)' }}>6 results</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {COMPETITORS.map((c, i) => (
          <div
            key={c.name}
            style={{
              display: 'flex',
              gap: 12,
              padding: 12,
              border: '1px solid var(--dark-8)',
              borderRadius: 10,
              background: 'var(--light-100)',
              opacity: 0,
              animation: `fadeInUp 400ms ease ${i * 120}ms forwards`,
            }}
          >
            <img
              src={c.photo}
              alt=""
              style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{c.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--dark-60)', marginBottom: 4 }}>
                <span style={{ color: '#E7711B', fontWeight: 500 }}>{c.rating}</span>
                <span style={{ color: '#E7711B', letterSpacing: '-1px' }}>★★★★★</span>
                <span style={{ color: 'var(--dark-40)' }}>({c.reviews})</span>
                <span style={{ color: 'var(--dark-40)' }}>·</span>
                <span style={{ color: 'var(--dark-60)' }}>{c.range}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>{c.address}</div>
              <div style={{ fontSize: 12, color: c.hours.startsWith('Open') ? 'var(--status-approved)' : 'var(--status-connect)', marginTop: 2, fontWeight: 500 }}>
                {c.hours}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
