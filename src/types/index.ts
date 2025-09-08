export interface IPageView {
	catalog: HTMLElement[];
	counter: number;
}

export interface IModalView {
	content: HTMLElement;
}

export interface IModel {
	emitChanges(event: string, data?: object): void;
}

export interface IProduct {
	id: string;
	title: string;
	description: string;
	category: string;
	price: number;
	image: string;
}

export interface IProductList {
	items: IProduct[];
}

export type ProductId = Pick<IProduct, 'id'>;

export type ProductCard = Omit<IProduct, 'description'>;

export type ProductPreviewData = IProduct & {
	valid: boolean;
	state: boolean;
};

export interface IBasketView {
	list: HTMLElement[];
	valid: boolean;
	price: number;
}

export type BasketProductCard = Omit<
	IProduct,
	'description' | 'category' | 'image'
> & {
	index: number;
};

export interface IApiClient {
	fetchProducts(): Promise<IProduct[]>;
	fetchProduct(id: string): Promise<IProduct>;
	createOrder(order: IOrderRequest): Promise<IOrderResponse>;
}

export interface IFormValidation {
	valid: boolean;
}

export interface IForm extends IFormValidation {
	render(data?: IFormValidation): HTMLElement;
}

export interface IInputField {
	field: string;
	value: string;
}

export interface IDeliveryInfo {
	payment: PaymentMethod;
	address: string;
}

export type PaymentMethod = 'card' | 'cash';

export interface IContactInfo {
	email: string;
	phone: string;
}

export type IOrderRequest = IDeliveryInfo & IContactInfo & IOrderItems;


export interface IOrderItems {
	total: number;
	items: string[];
}

export interface IOrder extends IOrderRequest {
	readyОrder(): IOrderRequest;
	setDelivery(delivery: IDeliveryInfo): void;
	setContacts(contacts: IContactInfo): void;
	setOrderItems(orderItems: IOrderItems): void;
}

export interface IOrderResponse {
	id: string;
	total: number;
}

export interface ISuccessView {
	total: number;
}

export enum AppEvents {
	// Каталог и товары
	CATALOG_CHANGED = 'catalog:items-changed',
	PRODUCT_SELECT = 'card:select',
	
	// Корзина
	BASKET_OPEN = 'basket:open',
	BASKET_ADD_ITEM = 'basket:add',
	BASKET_REMOVE_ITEM = 'basket:remove',
	BASKET_CHANGED = 'basket:items-changed',
	
	// Оформление заказа
	ORDER_START = 'order:open',
	ORDER_DELIVERY_INPUT = 'order:input',
	ORDER_DELIVERY_SUBMIT = 'order:submit',
	ORDER_DELIVERY_CHANGED = 'order:delivery-changed',
	ORDER_CONTACTS_INPUT = 'contacts:input',
	ORDER_CONTACTS_SUBMIT = 'contacts:submit',
	ORDER_CONTACTS_CHANGED = 'order:contacts-changed',
	ORDER_ITEMS_CHANGED = 'order:items-changed',
	
	// Завершение заказа
	ORDER_SUCCESS_CLOSE = 'success:submit',
	
	// Модальные окна
	MODAL_OPEN = 'modal:open',
	MODAL_CLOSE = 'modal:close',
}