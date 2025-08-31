import './scss/styles.scss';
import { App } from './components/base/app';
import { Card, CardPreview } from './components/base/card';
import { Modal } from './components/base/modal';
import { Basket } from './components/base/basket';
import { OrderForm } from './components/base/order';
import { ContactsForm } from './components/base/contacts';
import { Success } from './components/base/success';
import { ensureElement, cloneTemplate } from './utils/utils';
import { IProduct, AppEvents, IOrderForm } from './types';

// Инициализация приложения
const app = new App();
const events = app.getEventEmitter();

// Глобальные переменные
const modal = new Modal('#modal-container');
let orderData: Partial<IOrderForm> = {};

// Инициализация приложения
events.on(AppEvents.PRODUCTS_LOADED, (products: IProduct[]) => {
    renderProducts(products);
    setupModalHandlers();
});

// Обработка удаления товара из корзины
events.on('basket:remove', (data: any) => {
    const productId = typeof data === 'string' ? data : data.productId || data;
    events.emit(AppEvents.CARD_REMOVE, { productId });
    // Обновляем отображение корзины
    setTimeout(() => openBasketModal(), 0);
});

// Обработка открытия формы заказа
events.on('order:open', () => {
    openOrderModal();
});

// Обработка отправки формы заказа (первый шаг)
events.on('order:submit', (formData: Partial<IOrderForm>) => {
    orderData = { ...orderData, ...formData };
    openContactsModal();
});

// Обработка отправки формы контактов (второй шаг)
events.on('contacts:submit', (formData: Partial<IOrderForm>) => {
    orderData = { ...orderData, ...formData };
    submitOrder();
});

// Обработка закрытия окна успеха
events.on('success:close', () => {
    modal.close();
    orderData = {};
});



// Рендер продуктов
function renderProducts(products: IProduct[]): void {
    const gallery = ensureElement<HTMLElement>('.gallery');
    const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
    
    gallery.innerHTML = '';
    
    products.forEach(product => {
        const cardElement = cloneTemplate<HTMLElement>('card-catalog');
        const card = new Card(cardElement);
        
        // Добавляем обработчик клика на всю карточку
        cardElement.addEventListener('click', () => openProductModal(product));
        
        card.render(product);
        gallery.appendChild(cardElement);
    });
}

// Открытие модального окна товара
function openProductModal(product: IProduct): void {
    const previewElement = cloneTemplate<HTMLElement>('card-preview');
    const basketState = app.getBasketState();
    const isInBasket = basketState.items.some(item => item.product.id === product.id);
    
    const preview = new CardPreview(previewElement, {
        onClick: () => {
            // Если товар недоступен (price: null), ничего не делаем
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
    
    // Устанавливаем соответствующее состояние кнопки
    if (product.price === null) {
        preview.setUnavailableState();
    } else if (isInBasket) {
        preview.setInBasketState();
    } else {
        preview.setNotInBasketState();
    }
    
    modal.render({ content: previewElement });
}

// Настройка обработчиков модальных окон
function setupModalHandlers(): void {
    // Обработка удаления товаров из корзины
    document.querySelectorAll('.basket__item-delete').forEach(deleteBtn => {
        deleteBtn.addEventListener('click', (event) => {
            const item = (event.target as HTMLElement).closest('.basket__item');
            if (item) {
                const productId = item.getAttribute('data-product-id');
                if (productId) {
                    events.emit(AppEvents.CARD_REMOVE, { productId });
                }
            }
        });
    });
}



// Инициализация корзины
const basketBtn = ensureElement<HTMLElement>('.header__basket');
basketBtn.addEventListener('click', openBasketModal);

function openBasketModal(): void {
    const basketTemplate = cloneTemplate<HTMLElement>('basket');
    const basket = new Basket(basketTemplate, events);
    
    const basketState = app.getBasketState();
    basket.render({
        items: basketState.items,
        total: basketState.total
    });
    
    modal.render({ content: basketTemplate });
}

function openOrderModal(): void {
    const orderTemplate = cloneTemplate<HTMLElement>('order');
    const orderForm = new OrderForm(orderTemplate, events);
    
    modal.render({ content: orderForm.render() });
}

function openContactsModal(): void {
    const contactsTemplate = cloneTemplate<HTMLElement>('contacts');
    const contactsForm = new ContactsForm(contactsTemplate, events);
    
    modal.render({ content: contactsForm.render() });
}

function submitOrder(): void {
    try {
        const basketState = app.getBasketState();
        const orderPayload = {
            ...orderData,
            items: basketState.items.map(item => item.product.id),
            total: basketState.total
        };

        // Отправляем заказ на сервер
        events.emit(AppEvents.ORDER_CREATED, orderPayload);
        
        // Показываем окно успеха
        showSuccessModal(basketState.total);
        
        // Очищаем корзину
        events.emit('basket:clear');
        
    } catch (error) {
        console.error('Order submission failed:', error);
        // Здесь можно показать ошибку пользователю
    }
}

function showSuccessModal(total: number): void {
    const successTemplate = cloneTemplate<HTMLElement>('success');
    const success = new Success(successTemplate, events);
    
    modal.render({ content: success.render({ total }) });
}

// Экспорт для отладки
(window as any).app = app;