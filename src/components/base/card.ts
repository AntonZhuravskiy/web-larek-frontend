import { ensureElement } from '../../utils/utils';
import { IProduct, ICardActions } from '../../types';
import { CDN_URL } from '../../utils/constants';

export class Card {
	protected _container: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _image: HTMLImageElement;
	protected _category: HTMLElement;
	protected _button: HTMLButtonElement | null;

	constructor(container: HTMLElement, actions?: ICardActions) {
		this._container = container;

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._image = ensureElement<HTMLImageElement>('.card__image', container);
		this._category = ensureElement<HTMLElement>('.card__category', container);

		try {
			this._button = ensureElement<HTMLButtonElement>(
				'.card__button',
				container
			);
			if (actions?.onClick) {
				this._button.addEventListener('click', actions.onClick);
			}
		} catch {
			try {
				this._button = ensureElement<HTMLButtonElement>('.button', container);
				if (actions?.onClick) {
					this._button.addEventListener('click', actions.onClick);
				}
			} catch {
				this._button = null;
			}
		}
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: number | null) {
		if (value === null) {
			this.setText(this._price, 'Бесценно');
			if (this._button) {
				this._button.disabled = true;
			}
		} else {
			this.setText(this._price, `${value} синапсов`);
			if (this._button) {
				this._button.disabled = false;
			}
		}
	}

	set image(value: string) {
		this._image.src = (CDN_URL + value.slice(0, -3) + 'png');
	}

	set category(value: string) {
		this.setText(this._category, value);

		const categoryClassMap: Record<string, string> = {
			'софт-скил': 'card__category_soft',
			'хард-скил': 'card__category_hard',
			другое: 'card__category_other',
			дополнительное: 'card__category_additional',
			кнопка: 'card__category_button',
		};

		const categoryClass = categoryClassMap[value] || 'card__category_other';
		this._category.className = `card__category ${categoryClass}`;
	}

	set buttonText(value: string) {
		if (this._button) {
			this.setText(this._button, value);
		}
	}

	protected setText(element: HTMLElement, value: unknown): void {
		if (element) {
			element.textContent = String(value);
		}
	}

	protected setImage(
		element: HTMLImageElement,
		src: string,
		alt?: string
	): void {
		if (element) {
			element.src = src;
			if (alt) {
				element.alt = alt;
			}
		}
	}

	render(data: Partial<IProduct>): HTMLElement {
		Object.assign(this, data);
		return this._container;
	}
}

export class CardPreview extends Card {
	protected _description: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);
		this._description = ensureElement<HTMLElement>('.card__text', container);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	setInBasketState(): void {
		if (this._button) {
			this._button.textContent = 'Удалить из корзины';
			this._button.classList.remove('button_alt');
			this._button.classList.add('button_remove');
			this._button.disabled = false;
		}
	}

	setNotInBasketState(): void {
		if (this._button) {
			this._button.textContent = 'Купить';
			this._button.classList.remove('button_alt', 'button_remove');
			this._button.disabled = false;
		}
	}

	setUnavailableState(): void {
		if (this._button) {
			this._button.textContent = 'Недоступно';
			this._button.classList.remove('button_alt', 'button_remove');
			this._button.disabled = true;
		}
	}
}
