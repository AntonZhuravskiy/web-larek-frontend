import { ensureElement } from '../../utils/utils';
import { IModalData } from '../../types';

export class Modal {
    protected _modal: HTMLElement;
    protected _content: HTMLElement;
    protected _closeButton: HTMLElement;

    constructor(selector: string, private events?: any) {
        this._modal = ensureElement<HTMLElement>(selector);
        this._content = ensureElement<HTMLElement>('.modal__content', this._modal);
        this._closeButton = ensureElement<HTMLElement>('.modal__close', this._modal);

        this._closeButton.addEventListener('click', this.close.bind(this));
        this._modal.addEventListener('click', (event) => {
            if (event.target === this._modal) {
                this.close();
            }
        });

        // Закрытие по клавише Escape
        this.handleEscapeKey = this.handleEscapeKey.bind(this);
    }

    private handleEscapeKey(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    set content(value: HTMLElement) {
        this._content.innerHTML = '';
        this._content.appendChild(value);
    }

    open(): void {
        this._modal.classList.add('modal_active');
        document.addEventListener('keydown', this.handleEscapeKey);
        
        // Блокируем скролл страницы
        document.body.style.overflow = 'hidden';
    }

    close(): void {
        this._modal.classList.remove('modal_active');
        document.removeEventListener('keydown', this.handleEscapeKey);
        
        // Разблокируем скролл страницы
        document.body.style.overflow = '';
    }

    render(data: IModalData): HTMLElement {
        this.content = data.content;
        this.open();
        return this._modal;
    }
}
