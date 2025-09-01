import { IBasketItem, IProduct } from '../types';

export interface BasketState {
    items: IBasketItem[];
    total: number;
    count: number;
}

export class BasketModel {
    private items: IBasketItem[] = [];

    addProduct(product: IProduct): void {
        if (product.price === null) {
            return;
        }

        const existingItem = this.items.find(item => item.product.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ product, quantity: 1 });
        }
    }

    removeProduct(productId: string): void {
        console.log('BasketModel.removeProduct called for:', productId);
        console.log('Items before removal:', this.items.map(item => item.product.id));
        this.items = this.items.filter(item => item.product.id !== productId);
        console.log('Items after removal:', this.items.map(item => item.product.id));
    }

    clear(): void {
        this.items = [];
    }

    getTotal(): number {
        return this.items.reduce((total, item) => {
            if (item.product.price !== null) {
                return total + (item.product.price * item.quantity);
            }
            return total;
        }, 0);
    }

    getItems(): IBasketItem[] {
        return [...this.items];
    }

    getCount(): number {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    getState(): BasketState {
        return {
            items: this.getItems(),
            total: this.getTotal(),
            count: this.getCount()
        };
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    isProductInBasket(productId: string): boolean {
        return this.items.some(item => item.product.id === productId);
    }
}
