import './scss/styles.scss';

// ===== БАЗОВЫЕ КОМПОНЕНТЫ =====
import { EventEmitter, IEvents } from './components/base/events';
import { Api } from './components/base/api';

// ===== МОДЕЛИ (только данные и логика) =====
import { ProductModel } from './model/ProductModel';
import { BasketModel } from './model/BasketModel';
import { OrderModel } from './model/OrderModel';

// ===== ПРЕДСТАВЛЕНИЯ (только DOM) =====
import { CardView, CardPreviewView } from './view/CardView';
import { ModalView } from './view/ModalView';
import { BasketView } from './view/BasketView';
import { OrderFormView } from './view/OrderView';
import { ContactsFormView } from './view/ContactsView';
import { SuccessView } from './view/SuccessView';
import { GalleryView } from './view/GalleryView';

// ===== ТИПЫ И УТИЛИТЫ =====
import { IProduct, AppEvents, IOrderForm, ApiListResponse } from './types';
import { ensureElement, cloneTemplate } from './utils/utils';

// ===== PRESENTER (Логика приложения) =====
// Описывается напрямую в index.ts без отдельного класса

// Создание EventEmitter как шины событий
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

// ===== ОТЛАДКА =====
let renderCallCount = 0;

// ===== ИНИЦИАЛИЗАЦИЯ ПРЕДСТАВЛЕНИЙ =====
function initViews(): void {
    console.log('Initializing views...');
    console.log('Document ready state:', document.readyState);
    console.log('All templates in DOM:', Array.from(document.querySelectorAll('template')).map(t => ({ id: t.id, content: t.content })));
    
    // Создание экземпляров представлений
    modal = new ModalView('#modal-container');
    gallery = new GalleryView('.gallery');
    
    const galleryElement = document.querySelector('.gallery');
    console.log('Gallery element found:', galleryElement);
    console.log('Gallery element styles:', galleryElement ? window.getComputedStyle(galleryElement).display : 'N/A');
    console.log('Modal element found:', document.querySelector('#modal-container'));
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
async function init(): Promise<void> {
    try {
        console.log('Setting up event listeners...');
        setupEventListeners();
        console.log('Event listeners set up, loading products...');
        await loadProducts();
        console.log('Products loaded, setting up basket button...');
        setupBasketButton();
        console.log('Initialization complete');
    } catch (error) {
        console.error('App initialization failed:', error);
    }
}

// ===== ЗАГРУЗКА ПРОДУКТОВ ЧЕРЕЗ API =====
async function loadProducts(): Promise<void> {
    try {
        console.log('Loading products from API...');
        const response = await api.get('/product') as ApiListResponse<IProduct>;
        console.log('API response:', response);
        
        // Проверяем структуру ответа
        if (response && response.items && Array.isArray(response.items)) {
            console.log(`Loaded ${response.items.length} products`);
            productModel.setProducts(response.items);
            const products = productModel.getProducts();
            console.log('Emitting PRODUCTS_LOADED event with:', products);
            events.emit(AppEvents.PRODUCTS_LOADED, products);
        } else if (Array.isArray(response)) {
            // Если ответ - это массив продуктов напрямую
            console.log(`Loaded ${response.length} products (direct array)`);
            productModel.setProducts(response as unknown as IProduct[]);
            events.emit(AppEvents.PRODUCTS_LOADED, productModel.getProducts());
        } else {
            console.warn('Unexpected API response structure:', response);
            // Попробуем загрузить тестовые данные
            loadMockProducts();
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        // Загрузим тестовые данные в случае ошибки
        loadMockProducts();
    }
}

// ===== ЗАГРУЗКА ТЕСТОВЫХ ДАННЫХ =====
function loadMockProducts(): void {
    console.log('Loading mock products...');
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
    events.emit(AppEvents.PRODUCTS_LOADED, productModel.getProducts());
}

// ===== НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ =====
function setupEventListeners(): void {
    console.log('Setting up PRODUCTS_LOADED event listener...');
    
    // Загрузка продуктов
    events.on(AppEvents.PRODUCTS_LOADED, (products: IProduct[]) => {
        console.log('PRODUCTS_LOADED event received with products:', products);
        renderProducts(products);
    });
    
    console.log('PRODUCTS_LOADED event listener set up successfully');

    // Обновление корзины
    events.on('basket:updated', (data: any) => {
        updateBasketUI(data);
    });

    // Добавление товара в корзину
    events.on(AppEvents.CARD_ADD, (product: IProduct) => {
        basketModel.addProduct(product);
        events.emit('basket:updated', basketModel.getState());
    });

    // Удаление товара из корзины
    events.on(AppEvents.CARD_REMOVE, (data: { productId: string }) => {
        basketModel.removeProduct(data.productId);
        events.emit('basket:updated', basketModel.getState());
    });

    // Удаление товара из корзины (альтернативный обработчик)
    events.on('basket:remove', (data: { productId?: string } | string) => {
        const productId = typeof data === 'string' ? data : data.productId;
        console.log('basket:remove event received for product:', productId);
        if (productId) {
            basketModel.removeProduct(productId);
            events.emit('basket:updated', basketModel.getState());
            
            // Если корзина открыта в модальном окне, обновляем её
            if (modal && document.querySelector('.modal_active .basket')) {
                console.log('Basket modal is open, updating...');
                setTimeout(() => openBasketModal(), 0);
            }
        }
    });

    // Очистка корзины
    events.on('basket:clear', () => {
        basketModel.clear();
        events.emit('basket:updated', basketModel.getState());
    });

    // Открытие формы заказа
    events.on('order:open', () => {
        openOrderModal();
    });

    // Отправка формы заказа
    events.on('order:submit', (formData: Partial<IOrderForm>) => {
        orderModel.updateOrderData(formData);
        openContactsModal();
    });

    // Отправка формы контактов
    events.on('contacts:submit', (formData: Partial<IOrderForm>) => {
        orderModel.updateOrderData(formData);
        submitOrder();
    });

    // Создание заказа
    events.on(AppEvents.ORDER_CREATED, (order: any) => {
        createOrder(order);
    });

    // Закрытие окна успеха
    events.on('success:close', () => {
        modal.close();
        orderModel.clear();
    });
}

// ===== НАСТРОЙКА КНОПКИ КОРЗИНЫ =====
function setupBasketButton(): void {
    const basketBtn = ensureElement<HTMLElement>('.header__basket');
    basketBtn.addEventListener('click', () => {
        openBasketModal();
    });
}

// ===== ОТРИСОВКА ПРОДУКТОВ =====
function renderProducts(products: IProduct[]): void {
    renderCallCount++;
    console.log(`\n=== RENDER PRODUCTS CALLED (${renderCallCount}) ===`);
    console.log('Products to render:', products.length);
    console.log('Products data:', products.map(p => ({ id: p.id, title: p.title })));
    
    if (!products || products.length === 0) {
        console.warn('No products to render');
        return;
    }

    gallery.render(products, (product) => {
        console.log('Rendering product:', product.title);
        const cardElement = cloneTemplate<HTMLElement>('card-catalog');
        console.log('Cloned card element:', cardElement);
        console.log('Card element classes:', cardElement.className);
        console.log('Card element tag:', cardElement.tagName);
        
        const card = new CardView(cardElement);
        
        cardElement.addEventListener('click', () => {
            openProductModal(product);
        });
        
        card.render(product);
        console.log('Card rendered, final element:', cardElement);
        return cardElement;
    });
    
    console.log(`Successfully rendered ${products.length} products`);
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ТОВАРА =====
function openProductModal(product: IProduct): void {
    const previewElement = cloneTemplate<HTMLElement>('card-preview');
    const isInBasket = basketModel.isProductInBasket(product.id);
    
    const preview = new CardPreviewView(previewElement, {
        onClick: () => {
            if (product.price === null) {
                return;
            }
            
            if (isInBasket) {
                events.emit(AppEvents.CARD_REMOVE, { productId: product.id });
            } else {
                events.emit(AppEvents.CARD_ADD, product);
            }
            modal.close();
        }
    });
    
    preview.render(product);
    
    if (product.price === null) {
        preview.setUnavailableState();
    } else if (isInBasket) {
        preview.setInBasketState();
    } else {
        preview.setNotInBasketState();
    }
    
    modal.render({ content: previewElement });
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА КОРЗИНЫ =====
function openBasketModal(): void {
    const basketTemplate = cloneTemplate<HTMLElement>('basket');
    const basket = new BasketView(basketTemplate, events);
    
    const basketState = basketModel.getState();
    basket.render({
        items: basketState.items,
        total: basketState.total
    });
    
    modal.render({ content: basketTemplate });
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ЗАКАЗА =====
function openOrderModal(): void {
    const orderTemplate = cloneTemplate<HTMLElement>('order');
    const orderForm = new OrderFormView(orderTemplate, events);
    
    modal.render({ content: orderForm.render() });
}

// ===== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА КОНТАКТОВ =====
function openContactsModal(): void {
    const contactsTemplate = cloneTemplate<HTMLElement>('contacts');
    const contactsForm = new ContactsFormView(contactsTemplate, events);
    
    modal.render({ content: contactsForm.render() });
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
        basketModel.clear();
        orderModel.clear();
        events.emit('basket:updated', basketModel.getState());
        
    } catch (error) {
        console.error('Order submission failed:', error);
    }
}

// ===== СОЗДАНИЕ ЗАКАЗА =====
async function createOrder(order: any): Promise<void> {
    try {
        await api.post('/order', order);
    } catch (error) {
        console.error('Order creation failed:', error);
    }
}

// ===== ПОКАЗ МОДАЛЬНОГО ОКНА УСПЕХА =====
function showSuccessModal(total: number): void {
    const successTemplate = cloneTemplate<HTMLElement>('success');
    const success = new SuccessView(successTemplate, events);
    
    modal.render({ content: success.render({ total }) });
}

// ===== ОБНОВЛЕНИЕ UI КОРЗИНЫ =====
function updateBasketUI(data: { count: number, total: number }): void {
    const basketCounter = document.querySelector('.header__basket-counter');
    
    if (basketCounter) {
        basketCounter.textContent = data.count.toString();
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
// Presenter описан напрямую в index.ts без отдельного класса

// Ждем загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initViews();
        init();
    });
} else {
    initViews();
    init();
}

// Экспорт для отладки
(window as any).appState = {
    productModel,
    basketModel,
    orderModel,
    events,
    api
};