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
import { IProduct, AppEvents, IOrderForm, ApiListResponse, BasketUpdatedEvent } from './types';
import { ensureElement, cloneTemplate } from './utils/utils';

// Создание EventEmitter
const events: IEvents = new EventEmitter();

// Создание API клиента
const api = new Api('https://larek-api.nomoreparties.co/api/weblarek');

// ===== СОЗДАНИЕ ЭКЗЕМПЛЯРОВ МОДЕЛЕЙ =====
const productModel = new ProductModel();
const basketModel = new BasketModel();
const orderModel = new OrderModel();

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
    
    // Исправлено: создаем OrderFormView правильно
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
        console.error('Ошибка инициализации:', error);
        loadMockProducts();
    }
}

// ===== ЗАГРУЗКА ПРОДУКТОВ =====
async function loadProducts(): Promise<void> {
    try {
        const response = await api.get<ApiListResponse<IProduct>>('/product');
        
        if (response && response.items) {
            productModel.setProducts(response.items);
            events.emit(AppEvents.PRODUCTS_LOADED, response.items);
        } else {
            loadMockProducts();
        }
    } catch (error) {
        console.error('Ошибка загрузки продуктов:', error);
        loadMockProducts();
    }
}

// ===== ЗАГРУЗКА ТЕСТОВЫХ ДАННЫХ =====
function loadMockProducts(): void {
    const mockProducts: IProduct[] = [
        {
            id: 'mock-1',
            title: 'Тестовый товар 1',
            price: 1000,
            description: 'Описание тестового товара 1',
            category: 'софт-скил',
            image: '/mock-image-1.jpg'
        },
        {
            id: 'mock-2', 
            title: 'Тестовый товар 2',
            price: 2000,
            description: 'Описание тестового товара 2',
            category: 'хард-скил',
            image: '/mock-image-2.jpg'
        }
    ];
    
    productModel.setProducts(mockProducts);
    events.emit(AppEvents.PRODUCTS_LOADED, mockProducts);
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
        basketModel.addProduct(event.product);
        events.emit(AppEvents.BASKET_UPDATED, basketModel.getState());
    });

    // Удаление товара из корзины
    events.on(AppEvents.CARD_REMOVE, (event: { productId: string }) => {
        basketModel.removeProduct(event.productId);
        events.emit(AppEvents.BASKET_UPDATED, basketModel.getState());
    });

    // Очистка корзины
    events.on('basket:clear', () => {
        basketModel.clear();
        events.emit(AppEvents.BASKET_UPDATED, basketModel.getState());
    });

    // Открытие формы заказа
    events.on('order:open', () => {
        openOrderModal();
    });

    // Обновление данных заказа
    events.on('order:submit', (formData: Partial<IOrderForm>) => {
        orderModel.updateOrderData(formData);
        openContactsModal();
    });

    // Обновление данных контактов
    events.on('contacts:submit', (formData: Partial<IOrderForm>) => {
        orderModel.updateOrderData(formData);
        submitOrder();
    });

    // Закрытие окна успеха
    events.on('success:close', () => {
        modal.close();
        basketModel.clear();
        orderModel.clear();
        events.emit(AppEvents.BASKET_UPDATED, basketModel.getState());
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
    const basketState = basketModel.getState();
    
    // Создаем элементы корзины
    const basketItems = basketState.items.map((item, index) => {
        const basketItemElement = cloneTemplate<HTMLElement>('card-basket');
        
        const titleElement = ensureElement<HTMLElement>('.card__title', basketItemElement);
        const priceElement = ensureElement<HTMLElement>('.card__price', basketItemElement);
        const indexElement = ensureElement<HTMLElement>('.basket__item-index', basketItemElement);
        const deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', basketItemElement);
        
        titleElement.textContent = item.product.title;
        priceElement.textContent = item.product.price !== null ? 
            `${item.product.price * item.quantity} синапсов` : 'Бесценно';
        indexElement.textContent = (index + 1).toString();
        
        // Обработчик удаления
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            events.emit(AppEvents.CARD_REMOVE, { productId: item.product.id });
        });
        
        return basketItemElement;
    });
    
    // Обновляем корзину
    basketView.update({
        items: basketItems,
        total: basketState.total
    });
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ТОВАРА =====
function openProductModal(product: IProduct): void {
    const previewElement = cloneTemplate<HTMLElement>('card-preview');
    const isInBasket = basketModel.isProductInBasket(product.id);
    
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
    modal.render({ content: basketView.container });
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ЗАКАЗА =====
function openOrderModal(): void {
    // Сначала рендерим форму (для валидации и обновления состояния)
    orderFormView.render();
    // Затем показываем контейнер формы в модальном окне
    modal.render({ content: orderFormView.container });
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА КОНТАКТОВ =====
function openContactsModal(): void {
    // Сначала рендерим форму (для валидации и обновления состояния)
    contactsFormView.render();
    // Затем показываем контейнер формы в модальном окне
    modal.render({ content: contactsFormView.container });
}

// ===== ОТПРАВКА ЗАКАЗА =====
async function submitOrder(): Promise<void> {
    try {
        const basketState = basketModel.getState();
        const order = orderModel.createOrder(
            basketState.items.map(item => item.product.id),
            basketState.total
        );

        await api.post('/order', order);
        
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