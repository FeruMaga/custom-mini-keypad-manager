export function Icon({ name }: { name: string }) {
  
  const paths: Record<string, string> = {
    Keyboard: 'M3 5h18v14H3z M6 9h1m3 0h1m3 0h1m3 0h1M6 12h1m3 0h1m3 0h1m3 0h1M7 16h10',
    Media: 'M9 7l8 5-8 5z M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    System: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 2h6l1 4 4 1 2 5-3 3v5l-5 2-3-3-5-1-2-5 3-3z',
    Mouse: 'M12 3v7 M6 9a6 6 0 0 1 12 0v6a6 6 0 0 1-12 0z',
    LED: 'M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3',
    Close: 'M6 6l12 12M18 6L6 18',
    volume: 'M3 9h4l5-4v14l-5-4H3z M16 8q5 4 0 8 M19 5q7 7 0 14',
    mute: 'M3 9h4l5-4v14l-5-4H3z M17 9l5 6m0-6-5 6',
    play: 'M3 5l9 7-9 7z M16 5v14m5-14v14',
  }

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.Keyboard} />
    </svg>
  )
}
