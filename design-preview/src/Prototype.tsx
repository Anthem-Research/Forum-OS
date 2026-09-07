import { useEffect, useRef, useState } from "react";
import { MobileScroll } from "./mobile";

const ACTIONS = ["ASK", "DRAW", "LOOK", "SYNTHESIS", "PLAY"] as const;
const SAMPLE_APPS = ["Not assigned", "Forum Paper", "Camera", "Synthesis", "Music"];

type LauncherAction = (typeof ACTIONS)[number];
type Screen = "home" | "pin" | "parent";

function useClock() {
  const params = new URLSearchParams(window.location.search);
  const fixedTime = params.get("time");
  const fixedDate = params.get("date");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (fixedTime || fixedDate) return;
    const interval = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(interval);
  }, [fixedDate, fixedTime]);

  return {
    time:
      fixedTime ??
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now),
    date:
      fixedDate ??
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
        .format(now)
        .toLocaleUpperCase("en-GB")
        .replace(/ (\d+) /, " · $1 "),
  };
}

export default function Prototype() {
  const [screen, setScreen] = useState<Screen>(() => {
    const requested = new URLSearchParams(window.location.search).get("screen");
    return requested === "pin" || requested === "parent" ? requested : "home";
  });
  const [activeAction, setActiveAction] = useState<LauncherAction>("ASK");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [assignments, setAssignments] = useState<Record<LauncherAction, string>>({
    ASK: "Not assigned",
    DRAW: "Forum Paper",
    LOOK: "Camera",
    SYNTHESIS: "Synthesis",
    PLAY: "Music",
  });
  const longPressTimer = useRef<number | null>(null);
  const clock = useClock();

  useEffect(
    () => () => {
      if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    },
    [],
  );

  function beginParentPress() {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      setPin("");
      setPinError(false);
      setScreen("pin");
    }, 850);
  }

  function cancelParentPress() {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }

  function enterDigit(digit: string) {
    const nextPin = `${pin}${digit}`.slice(0, 4);
    setPin(nextPin);
    setPinError(false);

    if (nextPin.length === 4) {
      window.setTimeout(() => {
        if (nextPin === "0209") {
          setPin("");
          setScreen("parent");
        } else {
          setPin("");
          setPinError(true);
        }
      }, 140);
    }
  }

  if (screen === "pin") {
    return (
      <MobileScroll key="pin" className="app-screen forum-screen">
        <main className="parent-gate" data-testid="parent-pin-screen">
          <p className="gate-label">PARENT</p>
          <p className="gate-status" role="status">
            {pinError ? "TRY AGAIN" : "ENTER PIN"}
          </p>
          <div className="pin-dots" aria-label={`${pin.length} of 4 digits entered`}>
            {[0, 1, 2, 3].map((index) => (
              <span key={index} data-filled={index < pin.length ? "true" : "false"} />
            ))}
          </div>
          <div className="pin-keypad" aria-label="PIN keypad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0"].map(
              (digit, index) =>
                digit ? (
                  <button key={digit} type="button" onClick={() => enterDigit(digit)}>
                    {digit}
                  </button>
                ) : (
                  <span key={`blank-${index}`} />
                ),
            )}
          </div>
          <button className="gate-cancel" type="button" onClick={() => setScreen("home")}>
            CANCEL
          </button>
        </main>
      </MobileScroll>
    );
  }

  if (screen === "parent") {
    return (
      <MobileScroll key="parent" className="app-screen parent-screen">
        <main className="parent-console" data-testid="parent-console">
          <header className="parent-header">
            <div>
              <p>FORUM</p>
              <h1>Parent controls</h1>
            </div>
            <button type="button" onClick={() => setScreen("home")}>
              LOCK FORUM
            </button>
          </header>
          <p className="parent-intro">
            Choose the one approved destination behind each word. Nothing here is visible on Atlas’s home screen.
          </p>
          <section className="assignment-list" aria-label="Action assignments">
            {ACTIONS.map((action) => (
              <label key={action}>
                <span>{action}</span>
                <select
                  value={assignments[action]}
                  onChange={(event) =>
                    setAssignments((current) => ({ ...current, [action]: event.target.value }))
                  }
                >
                  {SAMPLE_APPS.map((app) => (
                    <option key={app}>{app}</option>
                  ))}
                </select>
              </label>
            ))}
          </section>
          <div className="parent-footer">
            <p className="preview-note">Visual preview · App launching, PIN changes and Android settings run in the native APK.</p>
          </div>
        </main>
      </MobileScroll>
    );
  }

  return (
    <MobileScroll key="home" className="app-screen forum-screen">
      <main className="forum-home" data-testid="forum-home" aria-label="Forum OS home">
        <section className="forum-clock" aria-label={`${clock.time}, ${clock.date}`}>
          <time className="forum-time">{clock.time}</time>
          <p className="forum-date">{clock.date}</p>
        </section>

        <button
          className="forum-wordmark"
          type="button"
          aria-label="Forum. Press and hold for parent controls."
          onPointerDown={beginParentPress}
          onPointerUp={cancelParentPress}
          onPointerCancel={cancelParentPress}
          onPointerLeave={cancelParentPress}
          onContextMenu={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.repeat) return;
            if (event.key === "Enter" || event.key === " ") beginParentPress();
          }}
          onKeyUp={cancelParentPress}
        >
          FORUM
        </button>

        <nav className="forum-actions" aria-label="Forum actions">
          {ACTIONS.map((action) => (
            <button
              key={action}
              className="forum-action"
              type="button"
              aria-pressed={activeAction === action}
              onClick={() => setActiveAction(action)}
            >
              <span>{action}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </nav>
      </main>
    </MobileScroll>
  );
}
