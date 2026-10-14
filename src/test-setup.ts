import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no ResizeObserver; components that measure themselves need a stub.
globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// jsdom has no Popover API, but its stylesheet already hides a closed [popover].
// The stub shows the element, which is all the tests need from it.
HTMLElement.prototype.showPopover ??= function (this: HTMLElement) {
    this.style.display = 'block';
};
HTMLElement.prototype.hidePopover ??= function (this: HTMLElement) {
    this.style.display = '';
};

afterEach(cleanup);
