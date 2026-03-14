import { useLang } from '../LangContext'

export default function NavTabs({ activeTab, onTabChange, drawingCount }) {
  const { t } = useLang()

  const TABS = [
    { id: 'learn',   label: t.tabLearn,   icon: '📖' },
    { id: 'draw',    label: t.tabDraw,    icon: '✏️' },
    { id: 'gallery', label: t.tabGallery, icon: '🖼️' },
    { id: 'quiz',    label: t.tabQuiz,    icon: '⭐' },
  ]

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
