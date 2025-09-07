import { IProduct, IOrder } from '../../types';
import { Api } from './api';

export class ApiClient extends Api {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	fetchProducts(): Promise<IProduct[]> {
		return this.get<IProduct[]>('/products');
	}

	createOrder(order: IOrder): Promise<IOrder> {
		return this.post<IOrder>('/order', order);
	}
}
