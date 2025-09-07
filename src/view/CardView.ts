// CardView.ts
import { ensureElement } from '../utils/utils';
import { IProduct, ICardActions, CardState } from '../types';
import { CDN_URL } from '../utils/constants';
import { CardModel } from '../model/CardModel';

export class CardView {
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
			if (actions?.onClick)
				this._button.addEventListener('click', actions.onClick);
		} catch {
			try {
				this._button = ensureElement<HTMLButtonElement>('.button', container);
				if (actions?.onClick)
					this._button.addEventListener('click', actions.onClick);
			} catch {
				this._button = null;
			}
		}
	}

	// Возможность навесить обработчик позже
	onClick(handler: () => void): void {
		const target: HTMLElement = this._button ?? this._container;
		target.addEventListener('click', (event: MouseEvent) => {
			event.preventDefault();
			handler();
		});
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	// ✅ только текст; никаких бизнес-решений
	set price(value: number | null) {
		this.setText(
			this._price,
			value === null ? 'Бесценно' : `${value} синапсов`
		);
	}

	set image(value: string) {
		this._image.src = CDN_URL + value.slice(0, -3) + 'png';
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
		if (this._button) this.setText(this._button, value);
	}

	protected setText(element: HTMLElement, value: unknown): void {
		if (element) element.textContent = String(value);
	}

	protected setImage(
		element: HTMLImageElement,
		src: string,
		alt?: string
	): void {
		if (element) {
			element.src = src;
			if (alt) element.alt = alt;
		}
	}

	render(data: Partial<IProduct>): HTMLElement {
		Object.assign(this, data);
		return this._container;
	}

	/** UI-состояния кнопки — теперь доступны в базовом классе */
	public setInBasketState(): void {
		if (!this._button) return;
		this._button.textContent = 'Удалить из корзины';
		this._button.classList.remove('button_alt');
		this._button.classList.add('button_remove');
		this._button.disabled = false;
	}

	public setNotInBasketState(): void {
		if (!this._button) return;
		this._button.textContent = 'Купить';
		this._button.classList.remove('button_alt', 'button_remove');
		this._button.disabled = false;
	}

	public setUnavailableState(): void {
		if (!this._button) return;
		this._button.textContent = 'Недоступно';
		this._button.classList.remove('button_alt', 'button_remove');
		this._button.disabled = true;
	}

	/** Применяет состояние карточки, которое дал CardModel */
	public cardRender(state: CardState): HTMLElement {
		const p = state.product;
		this.title = p.title;
		this.price = p.price;

		// подставьте ваши реальные имена полей, если отличаются
		if ((p as any).image) this.image = (p as any).image;
		if ((p as any).category) this.category = (p as any).category;

		switch (state.purchaseState) {
			case 'UNAVAILABLE':
				this.setUnavailableState();
				break;
			case 'IN_BASKET':
				this.setInBasketState();
				break;
			case 'NOT_IN_BASKET':
				this.setNotInBasketState();
				break;
		}
		return this._container;
	}

	/** Хелпер: отрендерить напрямую из модели */
	public cardRenderFromModel(model: CardModel): HTMLElement {
		return this.cardRender(model.cardGetState());
	}
}

export class CardPreviewView extends CardView {
	protected _description: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);
		this._description = ensureElement<HTMLElement>('.card__text', container);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}
}
