import { IProduct, IProductList, AppEvents } from '../../types';
import { CommonModel } from './CommonModel';
import { IEvents } from '../base/events';

export class BasketModel extends CommonModel<IProductList> {
	protected _items: IProduct[];

	constructor(data: Partial<IProductList>, events: IEvents) {
		super(data, events);
		this._items = [];
	}

	get items(): IProduct[] {
		return this._items;
	}

	get total(): number {
		return this._items.reduce((sum, item) => {
			return item.price + sum;
		}, 0);
	}

	get length(): number {
		return this._items.length;
	}

	add(item: IProduct): void {
		const product = this._items.find((product) => product.id === item.id);
		if (!product) {
			this._items.push(item);
			this.emitChanges(AppEvents.BASKET_CHANGED, { id: item.id });
		}
	}

	remove(id: string): void {
		this._items = this._items.filter((item) => item.id !== id);
		this.emitChanges(AppEvents.BASKET_CHANGED, { id: id });
	}

	check(id: string): boolean {
		const item = this._items.find((item) => item.id === id);
		return Boolean(item);
	}

	clear(): void {
		this._items = [];
		this.emitChanges(AppEvents.BASKET_CHANGED);
	}

	getIdList(): string[] {
		return this._items.map((item) => item.id);
	}
}