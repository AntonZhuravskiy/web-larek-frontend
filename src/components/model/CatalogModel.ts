import { CommonModel } from './CommonModel';
import { IProductList, IProduct, AppEvents } from '../../types';
import { IEvents } from '../base/events';

export class CatalogModel extends CommonModel<IProductList> {
	protected _items: IProduct[];

	constructor(data: Partial<IProductList>, events: IEvents) {
		super(data, events);
	}

	set items(list: IProduct[]) {
		this._items = list;
		this.emitChanges(AppEvents.CATALOG_CHANGED, this._items);
	}

	get items() {
		return this._items;
	}

	getId(id: string): IProduct | undefined {
		return this._items.find((item) => item.id === id);
	}
}