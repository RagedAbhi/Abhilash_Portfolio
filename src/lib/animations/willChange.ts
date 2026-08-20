export function toggleWillChange(elements: Element | Element[], value: string) {
  const els = (Array.isArray(elements) ? elements : [elements]) as HTMLElement[];
  const set = (v: string) => els.forEach((el) => (el.style.willChange = v));
  return {
    onEnter: () => set(value),
    onEnterBack: () => set(value),
    onLeave: () => set(""),
    onLeaveBack: () => set(""),
  };
}
