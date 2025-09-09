import './scss/styles.scss';
import { cloneTemplate, ensureElement } from './utils/utils';
import { CDN_URL, API_URL } from './utils/constants';
import {
	IContactInfo,
	IDeliveryInfo,
	IFormValidation,
	IFormErrors,
	IOrderResponse,
	IProduct,
	ProductCard,
	IOrderRequest,
	IOrderData,
	IOrderUpdate,
	ProductId,
	PaymentMethod,
	AppEvents,
} from './types';
import { ApiClient } from './components/base/apiClient';
import { EventEmitter } from './components/base/events';

// Импорт моделей
import { CatalogModel } from './components/model/CatalogModel';
import { BasketModel } from './components/model/BasketModel';
import { OrderModel } from './components/model/OrderModel';

// Импорт представлений
import { Page } from './components/view/Page';
import { ModalView } from './components/view/ModalView';
import { ContactsView } from './components/view/ContactsView';
import { SuccessView } from './components/view/SuccessView';
import { CatalogView } from './components/view/CatalogView';
import { ProductView } from './components/view/ProductView';
import { BasketCardView, BasketView } from './components/view/BasketView';
import { OrderView } from './components/view/OrderView';

// === ПОЛУЧЕНИЕ DOM ЭЛЕМЕНТОВ ===
const pageContent = ensureElement<HTMLElement>('.page');
const modalContainer = ensureElement<HTMLDivElement>('#modal-container');

// === ПОЛУЧЕНИЕ ШАБЛОНОВ ===
const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// === СОЗДАНИЕ ЭКЗЕМПЛЯРОВ ===
// Базовые сервисы
const api = new ApiClient(CDN_URL, API_URL);
const events = new EventEmitter();

// Основные представления
const page = new Page(pageContent, events);
const modal = new ModalView(modalContainer, events);

// Модели данных
const catalog = new CatalogModel({}, events);
const basket = new BasketModel({}, events);
const order = new OrderModel({}, events);

// Представления продуктов и каталога
const productPreview = new ProductView(
	cloneTemplate(cardPreviewTemplate),
	events
);

// Представления корзины
const basketView = new BasketView(cloneTemplate(basketTemplate), events);

// Представления заказа
const orderView = new OrderView(cloneTemplate(orderTemplate), events);
const contactsForm = new ContactsView(cloneTemplate(contactsTemplate), events);
const successOrder = new SuccessView(cloneTemplate(successTemplate), events);

// === ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ НОВОЙ АРХИТЕКТУРЫ ===

// Обновление данных заказа
events.on(AppEvents.ORDER_UPDATE, (data: IOrderUpdate) => {
	order.setData(data.field, data.value);
});

// Обработка ошибок валидации
events.on(AppEvents.ERRORS_UPDATE, (errors: IFormErrors) => {
	// Определяем, какие ошибки относятся к форме доставки
	const deliveryErrors: IFormErrors = {};
	if (errors.payment) deliveryErrors.payment = errors.payment;
	if (errors.address) deliveryErrors.address = errors.address;
	
	// Определяем, какие ошибки относятся к форме контактов
	const contactsErrors: IFormErrors = {};
	if (errors.email) contactsErrors.email = errors.email;
	if (errors.phone) contactsErrors.phone = errors.phone;
	
	// Обновляем соответствующие формы
	// Всегда обновляем формы, даже если ошибок нет (для активации кнопок)
	orderView.updateErrors(deliveryErrors);
	contactsForm.updateErrors(contactsErrors);
});

// === ОБРАБОТЧИКИ СОБЫТИЙ ===

// Каталог и продукты
events.on(AppEvents.CATALOG_CHANGED, (data: IProduct[]) => {
	const cardList = data.map((item) => {
		const card = new CatalogView<ProductCard>(
			cloneTemplate(cardTemplate),
			events
		);
		return card.render(item);
	});
	page.render({ catalog: cardList });
});

events.on(AppEvents.PRODUCT_SELECT, (data: ProductId) => {
	// Если модальное окно закрыто, открываем его, иначе закрываем
	if (!modal.isOpen()) {
		modal.open();
		
		const product = catalog.getId(data.id);
		if (product) {
			const previewData = Object.assign(product, {
				valid: Boolean(product.price),
				state: !basket.check(data.id),
			});
			modal.render({ content: productPreview.render(previewData) });
		}
	} else {
		modal.close();
	}
});

// Корзина
events.on(AppEvents.BASKET_OPEN, () => {
	modal.open();
	modal.render({
		content: basketView.render({
			price: basket.total,
			valid: basket.length === 0,
		}),
	});
});

events.on(AppEvents.BASKET_ADD_ITEM, (data: ProductId) => {
	const product = catalog.getId(data.id);
	basket.add(product);
});

events.on(AppEvents.BASKET_REMOVE_ITEM, (data: ProductId) => {
	basket.remove(data.id);
});

events.on(AppEvents.BASKET_CHANGED, (data: ProductId) => {
	page.render({ counter: basket.length });
	const cardList = basket.items.map((item, index) => {
		const cardData = Object.assign(item, { index: index + 1 });
		const card = new BasketCardView(cloneTemplate(cardBasketTemplate), events);
		return card.render(cardData);
	});
	basketView.render({
		list: cardList,
		valid: basket.length === 0,
		price: basket.total,
	});
});

// Заказ - информация о доставке
events.on(AppEvents.ORDER_START, () => {
	// Запускаем валидацию при открытии формы
	order.validate();
	
	modal.render({
		content: orderView.render({
			valid: order.validateDelivery(),
		}),
	});
});

events.on(AppEvents.ORDER_DELIVERY_SUBMIT, () => {
	modal.render({
		content: contactsForm.render({
			valid: order.validateContacts(),
		}),
	});
});

events.on(AppEvents.ORDER_CONTACTS_SUBMIT, () => {
	// Собираем полный заказ из данных двух моделей
	const orderData = order.getOrderData(); // Данные доставки и контактов
	const basketData = {
		total: basket.total,
		items: basket.getIdList(),
	}; // Данные корзины
	
	const apiObj: IOrderRequest = {
		...orderData,
		...basketData,
	};
	
	api
		.createOrder(apiObj)
		.then((data: IOrderResponse) => {
			modal.render({ content: successOrder.render({ total: data.total }) });
			orderView.clear();
			contactsForm.clear();
			basket.clear();
		})
		.catch(console.error);
});

// Модальное окно
events.on(AppEvents.MODAL_OPEN, () => {
	page.lock(true);
});

events.on(AppEvents.MODAL_CLOSE, () => {
	page.lock(false);
});

// Успешный заказ
events.on(AppEvents.ORDER_SUCCESS_CLOSE, () => {
	modal.close();
});

// === ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===
api
	.fetchProducts()
	.then((res) => {
		catalog.items = res;
	})
	.catch(console.error);
