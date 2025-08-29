import { ensureElement } from '../../utils/utils';
import { IProduct, ICardActions } from '../../types';

export class Card {
    protected _container: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        this._container = container;
        
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._button = ensureElement<HTMLButtonElement>('.button', container);

        if (actions?.onClick) {
            this._button.addEventListener('click', actions.onClick);
        }
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number) {
        this.setText(this._price, `${value} синапсов`);
    }

    set image(value: string) {
        this.setImage(this._image, value, this._title.textContent || '');
    }

    set category(value: string) {
        this.setText(this._category, value);
        const categoryClass = `card__category_${value}`;
        this._category.className = `card__category ${categoryClass}`;
    }

    set buttonText(value: string) {
        this.setText(this._button, value);
    }

    protected setText(element: HTMLElement, value: unknown): void {
        if (element) {
            element.textContent = String(value);
        }
    }

    protected setImage(element: HTMLImageElement, src: string, alt?: string): void {
        if (element) {
            element.src = src;
            if (alt) {
                element.alt = alt;
            }
        }
    }

    render(data: Partial<IProduct>): HTMLElement {
        Object.assign(this, data);
        return this._container;
    }
}

export class CardPreview extends Card {
    protected _description: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container, actions);
        this._description = ensureElement<HTMLElement>('.card__text', container);
    }

    set description(value: string) {
        this.setText(this._description, value);
    }
}