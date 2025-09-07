import { ensureElement } from '../utils/utils';
import { IEvents } from '../components/base/events';
import { AppEvents } from '../types';

export class SuccessView {
    protected _container: HTMLElement;
    protected _description: HTMLElement;
    protected _closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, private events: IEvents) {
        this._container = container;
        this._description = ensureElement<HTMLElement>('.order-success__description', container);
        this._closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this._closeButton.addEventListener('click', () => {
            this.events.emit(AppEvents.SUCCESS_CLOSE);
        });
    }

    set total(value: number) {
        this._description.textContent = `Списано ${value} синапсов`;
    }

    render(data: { total: number }): HTMLElement {
        this.total = data.total;
        return this._container;
    }
}
