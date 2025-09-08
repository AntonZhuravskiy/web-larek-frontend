import { IPageView, AppEvents } from '../../types';
import { ensureElement } from '../../utils/utils';
import { CommonView } from './CommonView';
import { IEvents } from '../base/events';

export class Page extends CommonView<IPageView> {
	protected events: IEvents;
	protected _counter: HTMLSpanElement;
	protected _wrapper: HTMLDivElement;
	protected _basketButton: HTMLElement;
	protected _catalog: HTMLElement;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);

		this.events = events;

		this._basketButton = ensureElement<HTMLElement>('.header__basket');

		this._counter = ensureElement<HTMLSpanElement>('.header__basket-counter');

		this._catalog = ensureElement<HTMLElement>('.gallery');

		this._wrapper = ensureElement<HTMLDivElement>('.page__wrapper', container);

		this._basketButton.addEventListener('click', () =>
			events.emit(AppEvents.BASKET_OPEN)
		);
	}

	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	set counter(value: string) {
		this.setText(this._counter, value);
	}

	lock(state: boolean): void {
		this.toggleClass(this._wrapper, 'page__wrapper_locked', state);
	}
}
