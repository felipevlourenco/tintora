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

// jsdom has no showModal either. Opening sets [open]; close() also fires
// the `close` event, as a browser does.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
};

afterEach(cleanup);
