import { useState } from 'react'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function GalleryTab({ drawings, onDeleteDrawing }) {
  const [lightbox, setLightbox] = useState(null)

  if (drawings.length === 0) {
    return (
      <div className="gallery-empty">
        <div className="gallery-empty__icon">✏️</div>
        <div className="gallery-empty__title">No drawings yet!</div>
        <div className="gallery-empty__sub">Go to the Draw tab to create something ✏️</div>
      </div>
    )
  }

  return (
    <div className="gallery-tab">
      <h2>My Drawings ({drawings.length})</h2>

      <div className="gallery-grid">
        {drawings.map((d, i) => (
          <div key={i} className="gallery-card">
            <img
              src={d.img}
              alt={d.en}
              className="gallery-card__img"
              onClick={() => setLightbox(d)}
            />
            <div className="gallery-card__info">
              <div className="gallery-card__word">{d.emoji} {d.en}</div>
              <div className="gallery-card__roh">{d.roh}</div>
              <div className="gallery-card__time">{timeAgo(d.timestamp)}</div>
            </div>
            <button
              className="gallery-card__delete"
              onClick={() => onDeleteDrawing(i)}
              aria-label="Delete drawing"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <img
            src={lightbox.img}
            alt={lightbox.en}
            className="lightbox__img"
            onClick={e => e.stopPropagation()}
          />
          <button className="lightbox__close" onClick={() => setLightbox(null)}>
            ✕ Close
          </button>
        </div>
      )}
    </div>
  )
}
