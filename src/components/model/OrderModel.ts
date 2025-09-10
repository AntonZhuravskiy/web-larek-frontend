import { IOrder, IOrderData, PaymentMethod, IFormErrors, AppEvents } from '../../types';  
import { CommonModel } from './CommonModel';
import { IEvents } from '../base/events';

export class OrderModel extends CommonModel<IOrder> implements IOrder {
	protected _payment: PaymentMethod;
	protected _address: string;
	protected _email: string;
	protected _phone: string;

	constructor(data: Partial<IOrder>, events: IEvents) {
		super(data, events);
	}

	set payment(value: PaymentMethod) {
		this._payment = value;
	}

	get payment(): PaymentMethod {
		return this._payment;
	}

	set address(value: string) {
		this._address = value;
	}

	get address(): string {
		return this._address;
	}

	set email(value: string) {
		this._email = value;
	}

	get email(): string {
		return this._email;
	}

	set phone(value: string) {
		this._phone = value;
	}

	get phone(): string {
		return this._phone;
	}

	setData(field: string, value: string): void {
		switch (field) {
			case 'payment':
				this._payment = value as PaymentMethod;
				break;
			case 'address':
				this._address = value;
				break;
			case 'email':
				this._email = value;
				break;
			case 'phone':
				this._phone = value;
				break;
		}
		this.validate();
	}

	validate(): void {
		const errors: IFormErrors = {};
		
		// Валидация способа оплаты
		if (!this._payment) {
			errors.payment = 'Выберите способ оплаты';
		}
		
		// Валидация адреса
		if (!this._address || this._address.trim().length === 0) {
			errors.address = 'Необходимо указать адрес';
		}
		
		// Валидация email
		if (!this._email) {
			errors.email = 'Необходимо указать email';
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(this._email.trim())) {
				errors.email = 'Некорректный формат email';
			}
		}
		
		// Валидация телефона
		if (!this._phone) {
			errors.phone = 'Необходимо указать телефон';
		} else {
			const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
			if (!phoneRegex.test(this._phone.trim())) {
				errors.phone = 'Некорректный формат телефона';
			}
		}
		
		this.events.emit(AppEvents.ERRORS_UPDATE, errors);
	}

	validateDelivery(): boolean {
		return Boolean(this._payment && this._address && this._address.trim().length > 0);
	}

	validateContacts(): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
		
		return Boolean(
			this._email && 
			this._phone && 
			emailRegex.test(this._email.trim()) && 
			phoneRegex.test(this._phone.trim())
		);
	}

	getOrderData(): IOrderData {
		return {
			payment: this._payment,
			email: this._email,
			phone: this._phone,
			address: this._address,
		};
	}

	// Получить ошибки доставки для OrderView
	getDeliveryErrors(): { errorText: string; hasErrors: boolean } {
		const errors: IFormErrors = {};
		
		if (!this._payment) {
			errors.payment = 'Выберите способ оплаты';
		}
		
		if (!this._address || this._address.trim().length === 0) {
			errors.address = 'Необходимо указать адрес';
		}
		
		const errorMessages = Object.values(errors).filter(Boolean);
		return {
			errorText: errorMessages.join('; '),
			hasErrors: errorMessages.length > 0
		};
	}

	// Получить ошибки контактов для ContactsView
	getContactsErrors(): { errorText: string; hasErrors: boolean } {
		const errors: IFormErrors = {};
		
		if (!this._email) {
			errors.email = 'Необходимо указать email';
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(this._email.trim())) {
				errors.email = 'Некорректный формат email';
			}
		}
		
		if (!this._phone) {
			errors.phone = 'Необходимо указать телефон';
		} else {
			const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
			if (!phoneRegex.test(this._phone.trim())) {
				errors.phone = 'Некорректный формат телефона';
			}
		}
		
		const errorMessages = Object.values(errors).filter(Boolean);
		return {
			errorText: errorMessages.join('; '),
			hasErrors: errorMessages.length > 0
		};
	}
}