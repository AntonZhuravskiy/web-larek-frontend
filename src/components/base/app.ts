import { EventEmitter } from './events';
import { Api } from './api';
import { BasketModel } from './basketModel';
import { IProduct, IOrder, AppEvents, ApiListResponse } from '../../types';

export class App {
    private events: EventEmitter;
    private api: Api;
    private basket: BasketModel;
    private products: IProduct[] = [];

    constructor() {
        this.events = new EventEmitter();
        this.api = new Api('https://larek-api.nomoreparties.co/api/weblarek');
        this.basket = new BasketModel(this.events);

        this.init();
    }

    private async init(): Promise<void> {
        try {
            await this.loadProducts();
            this.setupEventListeners();
        } catch (error) {
            console.error('App initialization failed:', error);
        }
    }

    private async loadProducts(): Promise<void> {
        try {
            const response = await this.api.get('/product') as ApiListResponse<IProduct>;
            this.products = response.items;
            this.events.emit(AppEvents.PRODUCTS_LOADED, this.products);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    }

    private setupEventListeners(): void {
        // Обработка событий корзины
        this.events.on(AppEvents.BASKET_UPDATED, (data: any) => {
            this.updateBasketUI(data);
        });

        // Добавление товара в корзину - исправленная типизация
        this.events.on(AppEvents.CARD_ADD, (product: IProduct) => {
            this.basket.addProduct(product);
        });

        // Удаление товара из корзины - исправленная типизация
        this.events.on(AppEvents.CARD_REMOVE, (data: { productId: string }) => {
            this.basket.removeProduct(data.productId);
        });

        // Создание заказа
        this.events.on(AppEvents.ORDER_CREATED, (order: IOrder) => {
            this.createOrder(order);
        });

        // Очистка корзины
        this.events.on('basket:clear', () => {
            this.basket.clear();
        });
    }

    private updateBasketUI(data: { count: number, total: number }): void {
        const basketCounter = document.querySelector('.header__basket-counter');
        const basketPrice = document.querySelector('.basket__price');
        
        if (basketCounter) {
            basketCounter.textContent = data.count.toString();
        }
        
        if (basketPrice) {
            basketPrice.textContent = `${data.total} синапсов`;
        }
    }

    private async createOrder(order: IOrder): Promise<void> {
        try {
            await this.api.post('/order', order);
            this.basket.clear();
            this.showSuccessModal();
        } catch (error) {
            console.error('Order creation failed:', error);
        }
    }

    private showSuccessModal(): void {
        const successModal = document.getElementById('success-modal');
        if (successModal) {
            successModal.classList.add('modal_active');
        }
    }

    // Public methods
    public getProducts(): IProduct[] {
        return this.products;
    }

    public getBasketState() {
        return this.basket.getState();
    }

    public getEventEmitter(): EventEmitter {
        return this.events;
    }
}