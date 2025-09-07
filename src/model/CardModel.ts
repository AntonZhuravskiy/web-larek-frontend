// CardModel.ts
import { CardPurchaseState, CardState, IProduct } from '../types';
import { BasketModel } from '../model/BasketModel';

export class CardModel {
	private product: IProduct | null = null;
	private inBasket = false;

	/** Установить продукт для карточки */
	public cardSetProduct(product: IProduct): void {
		this.product = product;
		this.inBasket = false;
	}

	/** Синхронизировать флаг "в корзине" с моделью корзины */
	public cardSyncWithBasket(basket: BasketModel): void {
		if (!this.product) return;
		this.inBasket = basket.basketIsProductInBasket(this.product.id);
	}

	/** Явно выставить флаг "в корзине" (если синхронизация делается снаружи) */
	public cardSetInBasket(value: boolean): void {
		this.inBasket = value;
	}

	/** Доступен ли товар для покупки (price !== null) */
	public cardIsAvailable(): boolean {
		return !!this.product && this.product.price !== null;
	}

	/** Текущее доменное состояние покупки для карточки */
	public cardGetPurchaseState(): CardPurchaseState {
		if (!this.cardIsAvailable()) return 'UNAVAILABLE';
		return this.inBasket ? 'IN_BASKET' : 'NOT_IN_BASKET';
	}

	/** Полное состояние карточки, которое отдаём во View */
	public cardGetState(): CardState {
		if (!this.product) throw new Error('CardModel: product is not set');
		const available = this.cardIsAvailable();
		return {
			product: this.product,
			available,
			inBasket: this.inBasket,
			purchaseState: this.cardGetPurchaseState(),
			buttonEnabled: available,
		};
	}
}
