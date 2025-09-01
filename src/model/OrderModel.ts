import { IOrderForm, IOrder } from '../types';

export class OrderModel {
    private orderData: Partial<IOrderForm> = {};

    updateOrderData(data: Partial<IOrderForm>): void {
        this.orderData = { ...this.orderData, ...data };
    }

    getOrderData(): Partial<IOrderForm> {
        return { ...this.orderData };
    }

    clear(): void {
        this.orderData = {};
    }

    isComplete(): boolean {
        return !!(
            this.orderData.payment &&
            this.orderData.address &&
            this.orderData.email &&
            this.orderData.phone
        );
    }

    createOrder(items: string[], total: number): IOrder {
        if (!this.isComplete()) {
            throw new Error('Order data is incomplete');
        }

        return {
            payment: this.orderData.payment!,
            address: this.orderData.address!,
            email: this.orderData.email!,
            phone: this.orderData.phone!,
            items,
            total
        };
    }
}
