import './scss/styles.scss';

// ===== БАЗОВЫЕ КОМПОНЕНТЫ =====
import { EventEmitter, IEvents } from './components/base/events';
import { Api } from './components/base/api';

// ===== МОДЕЛИ =====
import { ProductModel } from './model/ProductModel';
import { BasketModel } from './model/BasketModel';
import { OrderModel } from './model/OrderModel';

// ===== ПРЕДСТАВЛЕНИЯ =====
import { CardView, CardPreviewView } from './view/CardView';
import { ModalView } from './view/ModalView';
import { BasketView } from './view/BasketView';
import { OrderFormView } from './view/OrderView';
import { ContactsFormView } from './view/ContactsView';
import { SuccessView } from './view/SuccessView';
import { GalleryView } from './view/GalleryView';
import { Page } from './view/Page';

// ===== ТИПЫ И УТИЛИТЫ =====
import { IProduct, AppEvents, BasketUpdatedEvent } from './types';
import { ensureElement, cloneTemplate } from './utils/utils';
import { ApiClient } from './components/base/apiClient';
import { API_URL } from './utils/constants';

// Создание EventEmitter
const events: IEvents = new EventEmitter();

// Создание API клиента
const apiClient = new ApiClient(API_URL);

// ===== СОЗДАНИЕ ЭКЗЕМПЛЯРОВ МОДЕЛЕЙ =====
const productModel = new ProductModel();
const basketModel = new BasketModel();
const orderModel = new OrderModel(events);

// ===== СОЗДАНИЕ ЭКЗЕМПЛЯРОВ ПРЕДСТАВЛЕНИЙ =====
let modal: ModalView;
let gallery: GalleryView;
let page: Page;
let basketView: BasketView;
let orderFormView: OrderFormView;
let contactsFormView: ContactsFormView;
let successView: SuccessView;

// ===== ИНИЦИАЛИЗАЦИЯ ПРЕДСТАВЛЕНИЙ =====
function initViews(): void {
	modal = new ModalView('#modal-container');
	gallery = new GalleryView('.gallery');
	page = new Page();

	// Создаем представления форм
	const orderTemplate = cloneTemplate<HTMLElement>('order');
	orderFormView = new OrderFormView(orderTemplate, events);

	const basketTemplate = cloneTemplate<HTMLElement>('basket');
	basketView = new BasketView(basketTemplate, events);

	const contactsTemplate = cloneTemplate<HTMLElement>('contacts');
	contactsFormView = new ContactsFormView(contactsTemplate, events);

	const successTemplate = cloneTemplate<HTMLElement>('success');
	successView = new SuccessView(successTemplate, events);

	// Обработчик клика на кнопку корзины
	const basketButton = ensureElement<HTMLElement>('.header__basket');
	basketButton.addEventListener('click', () => {
		openBasketModal();
	});
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
async function init(): Promise<void> {
	try {
		setupEventListeners();
		await loadProducts();
	} catch (error) {
		// Тут должен быть throw
		console.error('Ошибка инициализации:', error);
	}
}

async function loadProducts(): Promise<void> {
	try {
		const products: IProduct[] = await apiClient.fetchProducts();

		productModel.setProducts(products);
		events.emit(AppEvents.PRODUCTS_LOADED, products);
	} catch (error) {
		throw new Error(`Ошибка загрузки продуктов: ${error}`);
	}
}

// ===== НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ =====
function setupEventListeners(): void {
	// Загрузка продуктов
	events.on(AppEvents.PRODUCTS_LOADED, (products: IProduct[]) => {
		renderProducts(products);
	});

	// Обновление корзины
	events.on(AppEvents.BASKET_UPDATED, (data: BasketUpdatedEvent) => {
		updateBasketUI(data);
		updateBasketView();
	});

	// Добавление товара в корзину
	events.on(AppEvents.CARD_ADD, (event: { product: IProduct }) => {
		basketModel.basketAddProduct(event.product);
		events.emit(AppEvents.BASKET_UPDATED, basketModel.basketGetState());
	});

	// Удаление товара из корзины
	events.on(AppEvents.CARD_REMOVE, (event: { productId: string }) => {
		basketModel.basketRemoveProduct(event.productId);
		events.emit(AppEvents.BASKET_UPDATED, basketModel.basketGetState());
	});

	// Очистка корзины
	events.on(AppEvents.BASKET_CLEAR, () => {
		basketModel.basketClear();
		events.emit(AppEvents.BASKET_UPDATED, basketModel.basketGetState());
	});

	// Обновление ошибок формы заказа
	events.on(AppEvents.ERRORS_UPDATE, (errors: Record<string, string>) => {
		orderFormView.updateErrors(errors);
	});

	// Обновление ошибок формы контактов
	events.on(AppEvents.CONTACTS_ERRORS_UPDATE, (errors: Record<string, string>) => {
		contactsFormView.updateErrors(errors);
	});

	// Открытие формы заказа
	events.on(AppEvents.ORDER_OPEN, () => {
		openOrderModal();
	});

	// Отправка формы заказа
	events.on(AppEvents.ORDER_SUBMIT, () => {
		openContactsModal();
	});

	// Отправка формы контактов
	events.on(AppEvents.CONTACTS_SUBMIT, () => {
		submitOrder();
	});

	// Закрытие окна успеха
	events.on(AppEvents.SUCCESS_CLOSE, () => {
		modal.close();
		basketModel.basketClear();
		orderModel.clear();
		events.emit(AppEvents.BASKET_UPDATED, basketModel.basketGetState());
	});
}

// ===== ОТРИСОВКА ПРОДУКТОВ =====
function renderProducts(products: IProduct[]): void {
	if (!products || products.length === 0) {
		console.warn('Нет продуктов для отображения');
		return;
	}

	gallery.render(products, (product) => {
		const cardElement = cloneTemplate<HTMLElement>('card-catalog');
		const card = new CardView(cardElement);

		card.render(product);

		// Обработчик клика по карточке
		cardElement.addEventListener('click', () => {
			openProductModal(product);
		});

		return cardElement;
	});
}

// ===== ОБНОВЛЕНИЕ ПРЕДСТАВЛЕНИЯ КОРЗИНЫ =====
function updateBasketView(): void {
	const basketState = basketModel.basketGetState();

	// Создаем элементы корзины
	const basketItems = basketState.items.map((item, index) => {
		const basketItemElement = cloneTemplate<HTMLElement>('card-basket');

		const titleElement = ensureElement<HTMLElement>(
			'.card__title',
			basketItemElement
		);
		const priceElement = ensureElement<HTMLElement>(
			'.card__price',
			basketItemElement
		);
		const indexElement = ensureElement<HTMLElement>(
			'.basket__item-index',
			basketItemElement
		);
		const deleteButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			basketItemElement
		);

		titleElement.textContent = item.product.title;
		const itemTotal = basketModel.basketGetItemTotal(item);
		priceElement.textContent =
			itemTotal !== null ? `${itemTotal} синапсов` : 'Бесценно';
		indexElement.textContent = (index + 1).toString();

		// Обработчик удаления
		deleteButton.addEventListener('click', (e) => {
			e.stopPropagation();
			events.emit(AppEvents.CARD_REMOVE, { productId: item.product.id });
		});

		return basketItemElement;
	});

	// Обновляем корзину
	basketView.basketUpdate({
		items: basketItems,
		total: basketState.total,
	});
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ТОВАРА =====
function openProductModal(product: IProduct): void {
	const previewElement = cloneTemplate<HTMLElement>('card-preview');
	const isInBasket = basketModel.basketIsProductInBasket(product.id);

	const preview = new CardPreviewView(previewElement);
	preview.render(product);

	if (product.price === null) {
		preview.setUnavailableState();
	} else if (isInBasket) {
		preview.setInBasketState();
	} else {
		preview.setNotInBasketState();
	}

	// Обработчик кнопки
	const button = previewElement.querySelector('.button');
	if (button) {
		button.addEventListener('click', () => {
			if (product.price === null) return;

			if (isInBasket) {
				events.emit(AppEvents.CARD_REMOVE, { productId: product.id });
			} else {
				events.emit(AppEvents.CARD_ADD, { product });
			}
			modal.close();
		});
	}

	modal.render({ content: previewElement });
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА КОРЗИНЫ =====
function openBasketModal(): void {
	updateBasketView();
	modal.render({ content: basketView.basketContainer });
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ЗАКАЗА =====
function openOrderModal(): void {
	// Принудительно запускаем валидацию формы заказа
	orderModel.validateOrder();
	orderFormView.render();
	modal.render({ content: orderFormView.container });
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА КОНТАКТОВ =====
function openContactsModal(): void {
	// Устанавливаем текущие данные в форму
	const orderData = orderModel.getOrderData();
	if (orderData.email) contactsFormView.setEmail(orderData.email);
	if (orderData.phone) contactsFormView.setPhone(orderData.phone);

	// Принудительно запускаем валидацию формы контактов
	orderModel.validateContacts();

	modal.render({ content: contactsFormView.container });
}

// ===== ОТПРАВКА ЗАКАЗА =====
async function submitOrder(): Promise<void> {
	try {
		const basketState = basketModel.basketGetState();

		if (!orderModel.isContactsValid()) {
			alert('Пожалуйста, заполните правильно все поля контактов');
			return;
		}

		// Создаем заказ
		const order = orderModel.createOrder(
			basketState.items.map((item) => item.product.id),
			basketState.total
		);

		// Отправляем заказ на сервер
		await apiClient.createOrder(order);

		// Показываем окно успеха
		showSuccessModal(basketState.total);
	} catch (error) {
		console.error('Ошибка отправки заказа:', error);
		alert('Ошибка при оформлении заказа. Попробуйте еще раз.');
	}
}

// ===== ПОКАЗ МОДАЛЬНОГО ОКНА УСПЕХА =====
function showSuccessModal(total: number): void {
	modal.render({ content: successView.render({ total }) });
}

// ===== ОБНОВЛЕНИЕ UI КОРЗИНЫ =====
function updateBasketUI(data: BasketUpdatedEvent): void {
	page.updateBasketCounter(data.count);
}

// ===== ЗАПУСК ПРИЛОЖЕНИЯ =====
document.addEventListener('DOMContentLoaded', () => {
	initViews();
	init();
});
