import { CommonView } from './CommonView';
import { ensureElement } from '../../utils/utils';
import { ProductId } from '../../types';
import { IEvents } from '../base/events';

export class CardView<T> extends CommonView<T> {
	protected events: IEvents;
	protected _id: ProductId;
	protected _title: HTMLHeadingElement;
	protected _price: HTMLSpanElement;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);

		this.events = events;

		this._title = ensureElement<HTMLHeadingElement>('.card__title', container);

		this._price = ensureElement<HTMLSpanElement>('.card__price', container);
	}

	set id(value: ProductId) {
		this._id = value;
	}

	get id(): ProductId {
		return this._id;
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent;
	}

	set price(value: string) {
		const priceText = value ? `${value} синапсов` : 'Бесценно';
		this.setText(this._price, priceText);
	}

	get price(): string {
		return this._price.textContent;
	}
}
