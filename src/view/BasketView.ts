import { ensureElement, cloneTemplate } from '../utils/utils';
import { IBasketItem, AppEvents } from '../types';
import { IEvents } from '../components/base/events';
import { BasketModel } from '../model/BasketModel';

export class BasketView {
	protected _container: HTMLElement;
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(
		container: HTMLElement,
		private events: IEvents,
		private model: BasketModel // инжектим модель, чтобы НЕ считать во View
	) {
		this._container = container;
		this._list = ensureElement<HTMLElement>('.basket__list', container);
		this._total = ensureElement<HTMLElement>('.basket__price', container);
		this._button = ensureElement<HTMLButtonElement>(
			'.basket__button',
			container
		);

		this._button.addEventListener('click', () => {
			this.events.emit(AppEvents.ORDER_OPEN);
		});
	}

	/** Обновляет вид корзины: список позиций и итог. */
	public basketUpdate(data: { items: HTMLElement[]; total: number }): void {
		this._list.innerHTML = '';

		if (data.items.length === 0) {
			const emptyMessage = document.createElement('li');
			emptyMessage.className = 'basket__empty';
			emptyMessage.textContent = 'Корзина пуста';
			this._list.appendChild(emptyMessage);
		} else {
			data.items.forEach((item) => this._list.appendChild(item));
		}

		this._total.textContent = `${data.total} синапсов`;
		this.basketUpdateButton(); // решаем по состоянию модели
	}

	/**
	 * Устанавливает позиции корзины с ПЕРЕСЧЁТОМ СУММЫ В МОДЕЛИ.
	 * View больше не считает total самостоятельно.
	 */
	set basketItems(items: IBasketItem[]) {
		const basketItems = items.map((item, index) => {
			const el = cloneTemplate<HTMLElement>('card-basket');
			const view = new BasketItemView(el, {
				onClick: () =>
					this.events.emit(AppEvents.BASKET_REMOVE, {
						productId: item.product.id,
					}),
				getItemTotal: (i) => this.model.basketGetItemTotal(i), // логика из модели
			});
			view.basketRender(item, index + 1);
			return el;
		});

		this.basketUpdate({
			items: basketItems,
			total: this.model.basketCalculateTotalFor(items), // считаем через модель
		});
	}

	/** Устанавливает итоговую сумму корзины (визуально). */
	set basketTotal(value: number) {
		this._total.textContent = `${value} синапсов`;
	}

	/** Обновляет состояние кнопки оформления заказа по состоянию модели. */
	protected basketUpdateButton(): void {
		this._button.disabled = this.model.basketGetCount() <= 0;
	}

	/**
	 * Полный рендер корзины (совместимость со старым кодом).
	 * УМНОЖЕНИЕ price*quantity ВЫНЕСЕНО: используем модель для lineTotal.
	 */
	public basketRender(data: {
		items: IBasketItem[];
		total: number;
	}): HTMLElement {
		const basketItems = data.items.map((item, index) => {
			const basketItemElement = cloneTemplate<HTMLElement>('card-basket');

			const titleElement = ensureElement<HTMLElement>(
				'.card__title',
				basketItemElement
			);
			const priceElement = ensureElement<HTMLElement>(
				'.card__price',
				basketItemElement
			);
			const indexElement = ensureElement<HTMLElement>(
				'.basket__item-index',
				basketItemElement
			);
			const deleteButton = ensureElement<HTMLButtonElement>(
				'.basket__item-delete',
				basketItemElement
			);

			titleElement.textContent = item.product.title;

			const lineTotal = this.model.basketGetItemTotal(item); // логика в модели
			priceElement.textContent =
				lineTotal !== null ? `${lineTotal} синапсов` : 'Бесценно';

			indexElement.textContent = (index + 1).toString();

			deleteButton.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.events.emit(AppEvents.BASKET_REMOVE, {
					productId: item.product.id,
				});
			});

			return basketItemElement;
		});

		// total считаем через модель, а не доверяем входному значению.
		this.basketUpdate({
			items: basketItems,
			total: this.model.basketCalculateTotalFor(data.items),
		});
		return this._container;
	}

	/** Возвращает DOM-контейнер корзины. */
	get basketContainer(): HTMLElement {
		return this._container;
	}

	/** Полностью очищает корзину (визуально). */
	public basketClear(): void {
		this.basketUpdate({ items: [], total: 0 });
	}
}

// Вспомогательный класс для элемента корзины
class BasketItemView {
	protected _container: HTMLElement;
	protected _index: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(
		container: HTMLElement,
		actions?: {
			onClick?: () => void;
			getItemTotal?: (item: IBasketItem) => number | null; // калькулятор из модели
		}
	) {
		this._container = container;
		this._index = ensureElement<HTMLElement>('.basket__item-index', container);
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._button = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			container
		);

		if (actions?.onClick) {
			this._button.addEventListener('click', (event) => {
				event.preventDefault();
				event.stopPropagation();
				actions.onClick();
			});
		}

		this._getItemTotal = actions?.getItemTotal ?? (() => null);
	}

	private _getItemTotal: (item: IBasketItem) => number | null;

	set basketIndex(value: number) {
		this._index.textContent = value.toString();
	}

	set basketTitle(value: string) {
		this._title.textContent = value;
	}

	set basketPrice(value: number | null) {
		this._price.textContent = value !== null ? `${value} синапсов` : 'Бесценно';
	}

	public basketRender(item: IBasketItem, index: number): HTMLElement {
		this.basketIndex = index;
		this.basketTitle = item.product.title;
		this.basketPrice = this._getItemTotal(item);
		return this._container;
	}
}
