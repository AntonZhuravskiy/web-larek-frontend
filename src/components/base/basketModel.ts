import { IBasketItem, IProduct } from '../../types';
import { EventEmitter } from './events';

interface BasketState {
    items: IBasketItem[];
    total: number;
    count: number;
}

export class BasketModel {
    private items: IBasketItem[] = [];
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
    }

    addProduct(product: IProduct): void {
        // Не добавляем товары с ценой null
        if (product.price === null) {
            return;
        }

        const existingItem = this.items.find(item => item.product.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ product, quantity: 1 });
        }
        
        this.events.emit('basket:updated', this.getState());
    }

    removeProduct(productId: string): void {
        this.items = this.items.filter(item => item.product.id !== productId);
        this.events.emit('basket:updated', this.getState());
    }

    clear(): void {
        this.items = [];
        this.events.emit('basket:updated', this.getState());
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
        return this.items;
    }

    getCount(): number {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    getState(): BasketState {
        return {
            items: this.items,
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