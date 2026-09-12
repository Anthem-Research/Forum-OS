export function SeedVisual({ kind }: { kind: "boat" | "sea" | "rover" }) {
  if (kind === "boat") {
    return (
      <svg className="seed-visual seed-visual-boat" viewBox="0 0 760 520" role="img" aria-label="Line drawing of Thetis with a proposed sail rig">
        <path d="M86 349 C220 386 517 392 674 334 C617 424 218 443 86 349Z" />
        <path d="M354 329 L354 86 L516 329" />
        <path className="accent-line" d="M365 104 L365 315 L497 315 Z" />
        <path d="M168 362 L152 332 M585 355 L604 320 M260 386 L250 417 M494 384 L505 417" />
        <circle cx="355" cy="330" r="9" />
      </svg>
    );
  }

  if (kind === "sea") {
    return (
      <svg className="seed-visual seed-visual-sea" viewBox="0 0 760 520" role="img" aria-label="Submarine and shark sprite study">
        <path d="M139 276 C177 213 320 208 390 267 C318 331 177 332 139 276Z" />
        <path d="M381 267 L451 221 L437 281 L455 333 L385 299" />
        <circle cx="222" cy="265" r="11" />
        <path className="paper-line" d="M508 190 C576 190 634 222 663 272 C625 322 570 340 500 330 L550 274 Z" />
        <path className="accent-fill" d="M503 245 L453 210 L467 270 L451 322 L508 295Z" />
        <path className="bubble" d="M99 179 h1 M124 148 h1 M103 112 h1" />
      </svg>
    );
  }

  return (
    <svg className="seed-visual seed-visual-rover" viewBox="0 0 760 520" role="img" aria-label="Field drawing of a small garden rover">
      <path d="M88 385 C211 339 330 351 427 392 C533 434 629 403 688 355" />
      <path d="M104 223 C206 193 289 207 359 244 C438 286 535 280 652 214" />
      <rect x="273" y="218" width="206" height="124" />
      <path d="M317 218 V170 H434 V218 M374 170 V126 M356 126 H392" />
      <circle cx="311" cy="356" r="44" />
      <circle cx="446" cy="356" r="44" />
      <path className="accent-line" d="M479 256 L590 218 M479 280 L606 280 M479 304 L579 337" />
    </svg>
  );
}
