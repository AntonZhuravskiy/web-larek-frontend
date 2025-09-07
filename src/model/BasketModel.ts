import { IProduct, IBasketItem } from '../types';

export interface BasketState {
	items: IBasketItem[];
	total: number;
	count: number;
}

export class BasketModel {
	private basketItems: IBasketItem[] = [];

	/**
	 * Добавляет товар в корзину (увеличивает количество, если уже есть).
	 */
	public basketAddProduct(product: IProduct): void {
		if (product.price === null) return;

		const existing = this.basketItems.find((i) => i.product.id === product.id);
		if (existing) {
			existing.quantity += 1;
		} else {
			this.basketItems.push({ product, quantity: 1 });
		}
	}

	/**
	 * Удаляет товар из корзины по productId (полностью, без уменьшения количества).
	 */
	public basketRemoveProduct(productId: string): void {
		this.basketItems = this.basketItems.filter(
			(i) => i.product.id !== productId
		);
	}

	/**
	 * Очищает корзину полностью.
	 */
	public basketClear(): void {
		this.basketItems = [];
	}

	/**
	 * Возвращает итоговую стоимость ТЕКУЩЕЙ корзины.
	 */
	public basketGetTotal(): number {
		return this.basketCalculateTotalFor(this.basketItems);
	}

	/**
	 * Возвращает копию списка позиций корзины.
	 */
	public basketGetItems(): IBasketItem[] {
		// Возвращаем поверхностную копию, чтобы извне не мутировали состояние.
		return this.basketItems.map((i) => ({ ...i }));
	}

	/**
	 * Возвращает общее количество единиц товара в корзине.
	 */
	public basketGetCount(): number {
		return this.basketItems.reduce((cnt, i) => cnt + i.quantity, 0);
	}

	/**
	 * Возвращает снэпшот состояния корзины.
	 */
	public basketGetState(): BasketState {
		return {
			items: this.basketGetItems(),
			total: this.basketGetTotal(),
			count: this.basketGetCount(),
		};
	}

	/**
	 * Проверяет, есть ли товар в корзине.
	 */
	public basketIsProductInBasket(productId: string): boolean {
		return this.basketItems.some((i) => i.product.id === productId);
	}

	/**
	 * Возвращает стоимость строки товара (цена * количество).
	 */
	public basketGetItemTotal(item: IBasketItem): number | null {
		return item.product.price !== null
			? item.product.price * item.quantity
			: null;
	}

	/**
	 * Считает итоговую сумму для произвольного списка позиций (вынесено из View).
	 */
	public basketCalculateTotalFor(items: IBasketItem[]): number {
		return items.reduce((total, item) => {
			const line = this.basketGetItemTotal(item);
			return line !== null ? total + line : total;
		}, 0);
	}
}
