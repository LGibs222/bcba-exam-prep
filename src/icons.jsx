// Blue Hour line-icon set — single-weight stroke icons that inherit
// currentColor, replacing the emoji iconography app-wide. Keep additions
// in this same 24×24 stroke grammar.
const PATHS = {
  home: <><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></>,
  clipboard: <><path d="M9 5h6M9 5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4"/></>,
  chart: <path d="M4 19h16M6 16V9m4 7V5m4 11v-6m4 6V8"/>,
  book: <path d="M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h13M8 8h7"/>,
  cards: <path d="M5 7h11v11H5zM8 4h11v11"/>,
  compass: <><circle cx="12" cy="12" r="9"/><path d="M15 9l-1.8 4.2L9 15l1.8-4.2z"/></>,
  timer: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></>,
  doc: <><path d="M6 3h9l4 4v14H6zM14 3v5h5"/><path d="M9 13h6M9 17h6"/></>,
  target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.8" fill="currentColor"/></>,
  flame: <path d="M12 2s5 4.5 5 9.5a5 5 0 0 1-10 0C7 8 9 6.5 9.5 4.5c.7 1.1 1.4 1.9 2.4 2.4C12.3 5.4 12 3.6 12 2z"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></>,
  mic: <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm6-3a6 6 0 0 1-12 0M12 18v3"/>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></>,
  moon: <path d="M21 13A8.5 8.5 0 0 1 11 3a8 8 0 1 0 10 10z"/>,
  gear: <><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1"/></>,
  alert: <><path d="M12 3 22 21H2z"/><path d="M12 10v5M12 18.4v.1"/></>,
  bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.5 1 2.5h6c0-1 .2-1.8 1-2.5A6 6 0 0 0 12 3z"/>,
}

export function Icon({ name, size = 18, stroke = 1.7, style = {} }) {
  const p = PATHS[name]
  if (!p) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: '-3px', flexShrink: 0, ...style }} aria-hidden="true">
      {p}
    </svg>
  )
}
