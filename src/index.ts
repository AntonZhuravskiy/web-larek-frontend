import './scss/styles.scss';
import { App } from './components/base/app';
import { Card, CardPreview } from './components/base/card';
import { ensureElement, cloneTemplate } from './utils/utils';
import { IProduct, AppEvents } from './types';

// Инициализация приложения
const app = new App();
const events = app.getEventEmitter();

// Глобальные переменные
let currentModal: HTMLElement | null = null;

// Инициализация приложения
events.on(AppEvents.PRODUCTS_LOADED, (products: IProduct[]) => {
    renderProducts(products);
    setupModalHandlers();
});

// Рендер продуктов
function renderProducts(products: IProduct[]): void {
    const gallery = ensureElement<HTMLElement>('.gallery');
    const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
    
    gallery.innerHTML = '';
    
    products.forEach(product => {
        const cardElement = cloneTemplate<HTMLElement>('card-catalog');
        const card = new Card(cardElement, {
            onClick: () => openProductModal(product)
        });
        
        card.render(product);
        gallery.appendChild(cardElement);
    });
}

// Открытие модального окна товара
function openProductModal(product: IProduct): void {
    const modal = ensureElement<HTMLElement>('#modal-container');
    const modalContent = ensureElement<HTMLElement>('.modal__content', modal);
    
    const previewElement = cloneTemplate<HTMLElement>('card-preview');
    const preview = new CardPreview(previewElement, {
        onClick: () => {
            // Правильная передача данных через объект
            events.emit(AppEvents.CARD_ADD, product);
            closeModal();
        }
    });
    
    preview.render(product);
    modalContent.innerHTML = '';
    modalContent.appendChild(previewElement);
    
    modal.classList.add('modal_active');
    currentModal = modal;
}

// Настройка обработчиков модальных окон
function setupModalHandlers(): void {
    // Закрытие модальных окон
    document.querySelectorAll('.modal__close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });
    
    // Закрытие по клику вне контента
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    });

    // Обработка удаления товаров из корзины
    document.querySelectorAll('.basket__item-delete').forEach(deleteBtn => {
        deleteBtn.addEventListener('click', (event) => {
            const item = (event.target as HTMLElement).closest('.basket__item');
            if (item) {
                const productId = item.getAttribute('data-product-id');
                if (productId) {
                    // Правильная передача данных через объект
                    events.emit(AppEvents.CARD_REMOVE, { productId });
                }
            }
        });
    });
}

// Закрытие модального окна
function closeModal(): void {
    if (currentModal) {
        currentModal.classList.remove('modal_active');
        currentModal = null;
    }
}

// Инициализация корзины
const basketBtn = ensureElement<HTMLElement>('.header__basket');
basketBtn.addEventListener('click', openBasketModal);

function openBasketModal(): void {
    const modal = ensureElement<HTMLElement>('#basket-modal');
    modal.classList.add('modal_active');
    currentModal = modal;
}

// Экспорт для отладки
(window as any).app = app;