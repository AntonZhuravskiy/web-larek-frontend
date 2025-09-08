import { IBasketView, AppEvents } from '../../types';
import { ensureElement } from '../../utils/utils';
import { CommonView } from './CommonView';
import { IEvents } from '../base/events';
import { BasketProductCard } from '../../types';
import { CardView } from './CardView';

export class BasketView extends CommonView<IBasketView> {
	protected button: HTMLButtonElement;
	protected events: IEvents;
	protected _list: HTMLElement;
	protected _price: HTMLSpanElement;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);

		this._list = ensureElement<HTMLUListElement>('.basket__list', container);

		this.button = ensureElement<HTMLButtonElement>(
			'.basket__button',
			container
		);

		this._price = ensureElement<HTMLSpanElement>('.basket__price', container);

		this.events = events;

		this.button.addEventListener('click', () => this.events.emit(AppEvents.ORDER_START));
	}

	set price(value: number) {
		this.setText(this._price, `${value} синапсов`);
	}

	set valid(state: boolean) {
		this.setDisabled(this.button, state);
	}

	set list(items: HTMLElement[]) {
		this._list.replaceChildren(...items);
	}
}

export class BasketCardView extends CardView<BasketProductCard> {
	protected button: HTMLButtonElement;
	protected _index: HTMLSpanElement;

	constructor(container: HTMLElement, events: IEvents) {
		super(container, events);

		this._index = ensureElement<HTMLSpanElement>(
			'.basket__item-index',
			container
		);

		this.button = ensureElement<HTMLButtonElement>('.card__button', container);

		this.button.addEventListener('click', () =>
			this.events.emit(AppEvents.BASKET_REMOVE_ITEM, { id: this.id })
		);
	}

	set index(value: number) {
		this.setText(this._index, value);
	}
}
