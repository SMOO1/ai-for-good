const TABS = [
  { id: 'learn',   label: 'Learn',   icon: '📖' },
  { id: 'draw',    label: 'Draw',    icon: '✏️' },
  { id: 'gallery', label: 'Gallery', icon: '🖼️' },
  { id: 'quiz',    label: 'Quiz',    icon: '⭐' },
]

export default function NavTabs({ activeTab, onTabChange, drawingCount }) {
  return (
    <nav className="nav-tabs" role="tablist">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab${activeTab === tab.id ? ' nav-tab--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          <span className="nav-tab__icon">{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.id === 'gallery' && drawingCount > 0 && (
            <span className="nav-tab__badge">{drawingCount}</span>
          )}
        </button>
      ))}
    </nav>
  )
}
