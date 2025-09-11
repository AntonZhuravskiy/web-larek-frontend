import { IOrder, IOrderData, PaymentMethod, IFormErrors, AppEvents } from '../../types';  
import { CommonModel } from './CommonModel';
import { IEvents } from '../base/events';

export class OrderModel extends CommonModel<IOrder> implements IOrder {
	protected data: Record<string, any> = {};

	constructor(initialData: Partial<IOrder>, events: IEvents) {
		super(initialData, events);
		this.data = { ...initialData };
	}

	set payment(value: PaymentMethod) {
		this.data.payment = value;
	}

	get payment(): PaymentMethod {
		return this.data.payment;
	}

	set address(value: string) {
		this.data.address = value;
	}

	get address(): string {
		return this.data.address;
	}

	set email(value: string) {
		this.data.email = value;
	}

	get email(): string {
		return this.data.email;
	}

	set phone(value: string) {
		this.data.phone = value;
	}

	get phone(): string {
		return this.data.phone;
	}

	setData(key: string, value: string): void {
		this.data[key] = value;
		this.validate();
	}

	validate(): void {
		const errors: IFormErrors = {};
		
		// Валидация способа оплаты
		if (!this.data.payment) {
			errors.payment = 'Выберите способ оплаты';
		}
		
		// Валидация адреса
		if (!this.data.address || this.data.address.trim().length === 0) {
			errors.address = 'Необходимо указать адрес';
		}
		
		// Валидация email
		if (!this.data.email) {
			errors.email = 'Необходимо указать email';
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(this.data.email.trim())) {
				errors.email = 'Некорректный формат email';
			}
		}
		
		// Валидация телефона
		if (!this.data.phone) {
			errors.phone = 'Необходимо указать телефон';
		} else {
			const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
			if (!phoneRegex.test(this.data.phone.trim())) {
				errors.phone = 'Некорректный формат телефона';
			}
		}
		
		// логика валидации и наполнение объекта с ошибками 
		this.events.emit(AppEvents.ERRORS_UPDATE, errors);
	}

	validateDelivery(): boolean {
		return Boolean(this.data.payment && this.data.address && this.data.address.trim().length > 0);
	}

	validateContacts(): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
		
		return Boolean(
			this.data.email && 
			this.data.phone && 
			emailRegex.test(this.data.email.trim()) && 
			phoneRegex.test(this.data.phone.trim())
		);
	}

	getOrderData(): IOrderData {
		return {
			payment: this.data.payment,
			email: this.data.email,
			phone: this.data.phone,
			address: this.data.address,
		};
	}
}