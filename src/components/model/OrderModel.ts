import { IOrder, IOrderRequest, PaymentMethod, IDeliveryInfo, IContactInfo, IOrderItems, AppEvents } from '../../types';
import { CommonModel } from './CommonModel';
import { IEvents } from '../base/events';

export class OrderModel extends CommonModel<IOrder> implements IOrder {
	protected _payment: PaymentMethod;
	protected _address: string;
	protected _email: string;
	protected _phone: string;
	protected _total: number;
	protected _items: string[];

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

	set total(value: number) {
		this._total = value;
	}

	get total(): number {
		return this._total;
	}

	set items(list: string[]) {
		this._items = list;
	}

	get items(): string[] {
		return this._items;
	}

	setDelivery(delivery: IDeliveryInfo): void {
		this.payment = delivery.payment;
		this.address = delivery.address;
		this.emitChanges(AppEvents.ORDER_DELIVERY_CHANGED);
	}

	setContacts(contacts: IContactInfo): void {
		this.email = contacts.email;
		this.phone = contacts.phone;
		this.emitChanges(AppEvents.ORDER_CONTACTS_CHANGED);
	}

	setOrderItems(orderItems: IOrderItems): void {
		this.total = orderItems.total;
		this.items = orderItems.items;
		this.emitChanges(AppEvents.ORDER_ITEMS_CHANGED);
	}

	readyОrder(): IOrderRequest {
		return {
			payment: this._payment,
			email: this._email,
			phone: this._phone,
			address: this._address,
			total: this._total,
			items: this._items,
		};
	}
}