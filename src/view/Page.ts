
import { ensureElement } from '../utils/utils';

export class Page {
    protected basketCounter: HTMLElement;
    protected basketButton: HTMLElement;

    constructor() {
        this.basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
        this.basketButton = ensureElement<HTMLElement>('.header__basket');
        
        this.basketButton.addEventListener('click', () => {
            // Эмитируем событие открытия корзины
            // events.emit('basket:open');
        });
    }

    updateBasketCounter(count: number): void {
        this.basketCounter.textContent = count.toString();
    }
}