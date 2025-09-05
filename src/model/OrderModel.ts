import { IOrderForm, IOrder, FormErrors } from '../types';
import { IEvents } from '../components/base/events';

export class OrderModel {
    private orderData: Partial<IOrderForm> = {};
    private _errors: FormErrors = {};
    
    constructor(private events: IEvents) {
        // Подписываемся на обновления данных
        events.on('order:update', this.updateOrderData.bind(this));
        events.on('contacts:update', this.updateContactsData.bind(this));
    }

    // Обновление данных заказа (payment, address)
    private updateOrderData(data: { field: keyof IOrderForm, value: string }): void {
        this.orderData[data.field] = data.value as any;
        this.validateOrderForm();
    }

    // Обновление данных контактов (email, phone)
    private updateContactsData(data: { field: keyof IOrderForm, value: string }): void {
        this.orderData[data.field] = data.value as any;
        this.validateContactsForm();
    }

    // Валидация формы заказа
    private validateOrderForm(): void {
        this._errors = {};

        if (!this.orderData.payment) {
            this._errors.payment = 'Необходимо выбрать способ оплаты';
        }

        if (!this.orderData.address || this.orderData.address.trim() === '') {
            this._errors.address = 'Необходимо указать адрес';
        }

        // Эмитим ошибки для формы заказа
        this.events.emit('errors:update', this._errors);
    }

    // Валидация формы контактов
    private validateContactsForm(): void {
        this._errors = {};

        if (!this.orderData.email || this.orderData.email.trim() === '') {
            this._errors.email = 'Необходимо указать email';
        } else if (!this.isValidEmail(this.orderData.email)) {
            this._errors.email = 'Некорректный формат email';
        }

        if (!this.orderData.phone || this.orderData.phone.trim() === '') {
            this._errors.phone = 'Необходимо указать номер телефона';
        }

        // Эмитим ошибки для формы контактов
        this.events.emit('contacts:errors:update', this._errors);
    }

    // Принудительная валидация формы заказа
    validateOrder(): void {
        this.validateOrderForm();
    }

    // Принудительная валидация формы контактов
    validateContacts(): void {
        this.validateContactsForm();
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Получение данных заказа
    getOrderData(): Partial<IOrderForm> {
        return { ...this.orderData };
    }

    // Получение ошибок
    getErrors(): FormErrors {
        return { ...this._errors };
    }

    // Проверка валидности формы заказа
    isOrderValid(): boolean {
        return !!this.orderData.payment && !!this.orderData.address;
    }

    // Проверка валидности формы контактов
    isContactsValid(): boolean {
        return !!this.orderData.email && !!this.orderData.phone && 
               this.isValidEmail(this.orderData.email);
    }

    // Проверка полноты всех данных
    isComplete(): boolean {
        return this.isOrderValid() && this.isContactsValid();
    }

    // Очистка данных
    clear(): void {
        this.orderData = {};
        this._errors = {};
        this.events.emit('errors:update', {});
        this.events.emit('contacts:errors:update', {});
    }

    // Создание объекта заказа
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