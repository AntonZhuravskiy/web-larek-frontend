export abstract class CommonView<T> {
	protected readonly container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
	}

	setImage(element: HTMLImageElement, src: string, alt?: string): void {
		if (!element) return;
		element.src = src;
		if (alt) {
			element.alt = alt;
		}
	}

	setText(element: HTMLElement, value: unknown): void {
		if (!element) return;
		element.textContent = String(value);
	}

	setVisible(element: HTMLElement): void {
		if (!element) return;
		element.style.removeProperty('display');
	}

	setDisabled(element: HTMLElement, state: boolean): void {
		if (!element) return;
		if (state) {
			element.setAttribute('disabled', 'disabled');
		} else {
			element.removeAttribute('disabled');
		}
	}

	setHidden(element: HTMLElement): void {
		if (!element) return;
		element.style.display = 'none';
	}

	toggleClass(element: HTMLElement, className: string, force?: boolean): void {
		if (!element) return;
		element.classList.toggle(className, force);
	}

	render(data?: Partial<T>): HTMLElement {
		Object.assign(this, data);
		return this.container;
	}
}
