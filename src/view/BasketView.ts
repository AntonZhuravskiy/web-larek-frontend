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

    set items(items: IBasketItem[]) {
        this._list.innerHTML = '';
        
        if (items.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'basket__empty';
            emptyMessage.textContent = 'Корзина пуста';
            this._list.appendChild(emptyMessage);
        } else {
            items.forEach((item, index) => {
                const basketItemElement = cloneTemplate<HTMLElement>('card-basket');
                const basketItem = new BasketItemView(basketItemElement, {
                    onClick: () => {
                        console.log('Delete button clicked for product:', item.product.id);
                        this.events.emit('basket:remove', { productId: item.product.id });
                    }
                });
                
                basketItem.render(item, index + 1);
                this._list.appendChild(basketItemElement);
            });
        }

        this.updateButton(items.length > 0);
    }

    set total(value: number) {
        this._total.textContent = `${value} синапсов`;
    }

    private updateButton(hasItems: boolean): void {
        this._button.disabled = !hasItems;
    }

    render(data: { items: IBasketItem[], total: number }): HTMLElement {
        this.items = data.items;
        this.total = data.total;
        return this._container;
    }
}

export class BasketItemView {
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

        console.log('BasketItemView created, button found:', this._button);
        if (actions?.onClick) {
            console.log('Adding click handler to delete button');
            this._button.addEventListener('click', (event) => {
                console.log('Delete button clicked, calling action');
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
        this.price = item.product.price;
        return this._container;
    }
}
