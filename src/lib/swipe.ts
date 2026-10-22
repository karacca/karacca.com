import { slider } from "@/styles/tokens/slider";

export function onSwipe(
  target: HTMLElement,
  move: (direction: number) => void,
  enabled: () => boolean = () => true,
): void {
  let travel = 0;
  let swiped = false;
  let momentum = false;
  let previous = 0;
  let time = Number.NEGATIVE_INFINITY;
  let run = 0;
  let peak = 0;
  let low = 0;

  target.addEventListener(
    "wheel",
    (event) => {
      if (!enabled() || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }
      event.preventDefault();
      const delta = Math.abs(event.deltaX);
      const idle = momentum ? slider.momentumIdle : slider.swipeIdle;
      if (
        event.timeStamp - time > idle ||
        (momentum && delta > Math.max(slider.riseMin, low * slider.rise))
      ) {
        travel = 0;
        swiped = false;
        momentum = false;
        previous = 0;
      }
      const decaying =
        Math.sign(event.deltaX) === Math.sign(previous) &&
        delta <= Math.abs(previous);
      run = decaying ? run + 1 : 0;
      peak = decaying ? peak : delta;
      low = momentum ? Math.min(low, delta) : delta;
      momentum ||= run >= slider.decaySamples && delta <= peak * slider.decay;
      previous = event.deltaX;
      time = event.timeStamp;
      if (swiped) {
        return;
      }
      travel += event.deltaX;
      if (Math.abs(travel) >= slider.swipeDistance) {
        swiped = true;
        move(Math.sign(travel));
      }
    },
    { passive: false },
  );
}

export function onArrowKeys(
  target: HTMLElement,
  move: (direction: number) => void,
): void {
  target.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    const direction =
      event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    if (direction !== 0) {
      event.preventDefault();
      move(direction);
    }
  });
}
