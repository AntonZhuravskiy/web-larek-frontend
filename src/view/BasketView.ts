import { ensureElement, cloneTemplate } from '../utils/utils';
import { IBasketItem } from '../types';
import { IEvents } from '../components/base/events';

export class BasketView {
    protected _container: HTMLElement;
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, private events: IEvents) {
        this._container = container;
        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', container);

        this._button.addEventListener('click', () => {
            this.events.emit('order:open');
        });
    }

    // Основной метод обновления корзины
    update(data: { items: HTMLElement[], total: number }): void {
        // Очищаем список
        this._list.innerHTML = '';
        
        if (data.items.length === 0) {
            // Показываем сообщение о пустой корзине
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'basket__empty';
            emptyMessage.textContent = 'Корзина пуста';
            this._list.appendChild(emptyMessage);
        } else {
            // Добавляем все элементы корзины
            data.items.forEach(item => {
                this._list.appendChild(item);
            });
        }

        // Обновляем общую сумму
        this._total.textContent = `${data.total} синапсов`;
        
        // Блокируем кнопку если корзина пуста
        this.updateButton(data.items.length > 0);
    }

    // Установка элементов корзины (альтернативный метод)
    set items(items: IBasketItem[]) {
        const basketItems = items.map((item, index) => {
            const basketItemElement = cloneTemplate<HTMLElement>('card-basket');
            const basketItem = new BasketItemView(basketItemElement, {
                onClick: () => {
                    this.events.emit('basket:remove', { productId: item.product.id });
                }
            });
            
            basketItem.render(item, index + 1);
            return basketItemElement;
        });

        this.update({
            items: basketItems,
            total: this.calculateTotal(items)
        });
    }

    // Установка общей суммы
    set total(value: number) {
        this._total.textContent = `${value} синапсов`;
    }

    // Обновление состояния кнопки
    protected updateButton(hasItems: boolean): void {
        this._button.disabled = !hasItems;
    }

    // Расчет общей суммы
    protected calculateTotal(items: IBasketItem[]): number {
        return items.reduce((total, item) => {
            if (item.product.price !== null) {
                return total + (item.product.price * item.quantity);
            }
            return total;
        }, 0);
    }

    // Рендер корзины (совместимость со старым кодом)
    render(data: { items: IBasketItem[], total: number }): HTMLElement {
        const basketItems = data.items.map((item, index) => {
            const basketItemElement = cloneTemplate<HTMLElement>('card-basket');
            
            const titleElement = ensureElement<HTMLElement>('.card__title', basketItemElement);
            const priceElement = ensureElement<HTMLElement>('.card__price', basketItemElement);
            const indexElement = ensureElement<HTMLElement>('.basket__item-index', basketItemElement);
            const deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', basketItemElement);

            titleElement.textContent = item.product.title;
            priceElement.textContent = item.product.price !== null ? 
                `${item.product.price * item.quantity} синапсов` : 'Бесценно';
            indexElement.textContent = (index + 1).toString();

            deleteButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.events.emit('basket:remove', { productId: item.product.id });
            });

            return basketItemElement;
        });

        this.update({
            items: basketItems,
            total: data.total
        });

        return this._container;
    }

    // Геттер для контейнера
    get container(): HTMLElement {
        return this._container;
    }

    // Очистка корзины
    clear(): void {
        this.update({
            items: [],
            total: 0
        });
    }
}

// Вспомогательный класс для элемента корзины
class BasketItemView {
    protected _container: HTMLElement;
    protected _index: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: { onClick: () => void }) {
        this._container = container;
        this._index = ensureElement<HTMLElement>('.basket__item-index', container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

        if (actions?.onClick) {
            this._button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                actions.onClick();
            });
        }
    }

    set index(value: number) {
        this._index.textContent = value.toString();
    }

    set title(value: string) {
        this._title.textContent = value;
    }

    set price(value: number | null) {
        this._price.textContent = value !== null ? `${value} синапсов` : 'Бесценно';
    }

    render(item: IBasketItem, index: number): HTMLElement {
        this.index = index;
        this.title = item.product.title;
        this.price = item.product.price !== null ? item.product.price * item.quantity : null;
        return this._container;
    }
}