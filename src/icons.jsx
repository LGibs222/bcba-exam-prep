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
  flag: <path d="M5 21V4m0 0h12l-2.5 4L17 12H5"/>,
  star: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.2 6L12 16.7l-5.5 2.9 1.2-6L3.2 9.4l6.1-.8z"/>,
  trophy: <path d="M8 3h8v6a4 4 0 0 1-8 0zM8 5H4c0 3 1.6 5 4 5m8-7h4c0 3-1.6 5-4 5m-4 5v4m-4 4h8m-4-4v4"/>,
  sprout: <path d="M12 21v-8m0 0c0-4.2-3-6.5-7.5-6.5C4.5 10.7 7.5 13 12 13zm0 0c0-4.2 3-6.5 7.5-6.5C19.5 10.7 16.5 13 12 13z"/>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
  coin: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></>,
  brain: <path d="M12 4v14M12 4a3 3 0 0 0-5.8 1A3.5 3.5 0 0 0 4 11a3.5 3.5 0 0 0 1.5 6A3.2 3.2 0 0 0 12 18M12 4a3 3 0 0 1 5.8 1A3.5 3.5 0 0 1 20 11a3.5 3.5 0 0 1-1.5 6A3.2 3.2 0 0 1 12 18"/>,
  gradcap: <path d="M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.5M22 9v6"/>,
  key: <><circle cx="8" cy="12" r="4.5"/><path d="M12.5 12H21m-3 0v3.5m-3.5-3.5v2.5"/></>,
  map: <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zm0 0v14m6-12v14"/>,
  calendar: <path d="M4 5h16v16H4zM4 10h16M8 3v4m8-4v4"/>,
  gem: <path d="M6 3h12l4 6-10 12L2 9zM2 9h20M12 21 8 9l4-6 4 6z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></>,
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
