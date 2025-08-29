import { IProduct, IOrder } from '../../types';
import { Api } from './api'; // путь к api.ts

export class ApiClient extends Api {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    // Теперь TS понимает, что возвращаемый тип — массив IProduct
    fetchProducts(): Promise<IProduct[]> {
        return this.get<IProduct[]>('/products');
    }

    // Возвращаемый тип — объект с данными заказа
    createOrder(order: IOrder): Promise<IOrder> {
        return this.post<IOrder>('/order', order);
    }
}
