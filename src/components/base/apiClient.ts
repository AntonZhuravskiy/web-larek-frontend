import { Api, ApiListResponse } from './api';
import { IApiClient, IProduct, IOrderRequest, IOrderResponse } from '../../types';

export class ApiClient extends Api implements IApiClient {
	protected readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	fetchProducts(): Promise<IProduct[]> {
		return this.get('/product').then((data: ApiListResponse<IProduct>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	fetchProduct(id: string): Promise<IProduct> {
		return this.get(`/product/${id}`).then((item: IProduct) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	createOrder(order: IOrderRequest): Promise<IOrderResponse> {
		return this.post('/order', order).then((data: IOrderResponse) => data);
	}
}
