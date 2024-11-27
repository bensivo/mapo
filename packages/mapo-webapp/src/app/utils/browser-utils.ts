
export function isTouchScreen() {
    return window.matchMedia('(pointer: coarse)').matches;
}