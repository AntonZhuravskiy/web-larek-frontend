export interface IProduct {
    id: string;
    title: string;
    price: number | null;
    description?: string;
    category: string;
    image: string;
}

export interface IBasketItem {
    product: IProduct;
    quantity: number;
}

export interface IOrderForm {
    payment: 'online' | 'cash';
    address: string;
    email: string;
    phone: string;
}

export interface IOrder extends IOrderForm {
    items: string[];
    total: number;
}

export type FormErrors = Partial<Record<keyof IOrderForm, string>>;

export enum AppEvents {
    PRODUCTS_LOADED = 'products:loaded',
    BASKET_UPDATED = 'basket:updated',
    ORDER_CREATED = 'order:created',
    MODAL_OPEN = 'modal:open',
    MODAL_CLOSE = 'modal:close',
    CARD_SELECT = 'card:select',
    CARD_ADD = 'card:add',
    CARD_REMOVE = 'card:remove',
    BASKET_CLEAR = 'basket:clear',
    ERRORS_UPDATE = 'errors:update',
    CONTACTS_ERRORS_UPDATE = 'contacts:errors:update',
    ORDER_OPEN = 'order:open',
    ORDER_SUBMIT = 'order:submit',
    CONTACTS_SUBMIT = 'contacts:submit',
    SUCCESS_CLOSE = 'success:close',
    ORDER_UPDATE = 'order:update',
    CONTACTS_UPDATE = 'contacts:update',
    BASKET_REMOVE = 'basket:remove'
}

export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface IBasketView {
    items: HTMLElement[];
    total: number;
}

export interface IModalData {
    content: HTMLElement;
}

export interface ApiListResponse<Type> {
    total: number;
    items: Type[];
}

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

// Добавим интерфейсы для событий
export interface CardAddEvent {
    product: IProduct;
}

export interface CardRemoveEvent {
    productId: string;
}

export interface BasketUpdatedEvent {
    items: IBasketItem[];
    total: number;
    count: number;
}