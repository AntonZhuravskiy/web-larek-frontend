import { ensureElement } from '../utils/utils';
import { IEvents } from '../components/base/events';

export class OrderFormView {
    protected _container: HTMLElement;
    protected _paymentButtons: HTMLButtonElement[];
    protected _addressInput: HTMLInputElement;
    protected _submitButton: HTMLButtonElement;
    protected _errorsElement: HTMLElement;
    protected _form: HTMLFormElement;

    constructor(container: HTMLElement, private events: IEvents) {
        this._container = container;

        if (container.tagName === 'FORM') {
            this._form = container as HTMLFormElement;
        } else {
            this._form = ensureElement<HTMLFormElement>('form', container);
        }

        this._addressInput = ensureElement<HTMLInputElement>(
            'input[name="address"]',
            container
        );
        this._submitButton = ensureElement<HTMLButtonElement>(
            '.order__button',
            container
        );
        this._errorsElement = ensureElement<HTMLElement>(
            '.form__errors',
            container
        );

        this._paymentButtons = Array.from(
            container.querySelectorAll('.order__buttons .button')
        ) as HTMLButtonElement[];

        this.setupEventListeners();
    }

    get container(): HTMLElement {
        return this._container;
    }

    private setupEventListeners(): void {
        // Обработчики для кнопок оплаты
        this._paymentButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const buttonName = button.getAttribute('name');
                const payment = buttonName === 'card' ? 'online' : 'cash';
                
                // Эмитим событие обновления, а не валидируем здесь
                this.events.emit('order:update', { 
                    field: 'payment', 
                    value: payment 
                });
                
                // Только визуальное обновление
                this.updatePaymentButtons(payment);
            });
        });

        // Обработчик для поля адреса
        this._addressInput.addEventListener('input', () => {
            this.events.emit('order:update', { 
                field: 'address', 
                value: this._addressInput.value 
            });
        });

        // Обработчик отправки формы
        this._form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit('order:submit');
        });
    }

    // Только визуальное обновление кнопок
    private updatePaymentButtons(payment: 'online' | 'cash'): void {
        this._paymentButtons.forEach((button) => {
            const buttonName = button.getAttribute('name');
            const isActive =
                (payment === 'online' && buttonName === 'card') ||
                (payment === 'cash' && buttonName === 'cash');
            button.classList.toggle('button_alt-active', isActive);
        });
    }

    // Обновление ошибок (вызывается извне)
    updateErrors(errors: Record<string, string>): void {
        const errorMessages = Object.values(errors).filter(Boolean);
        this._errorsElement.textContent = errorMessages.join('; ');
        this._submitButton.disabled = errorMessages.length > 0;
    }

    // Установка значений (вызывается извне)
    setAddress(value: string): void {
        this._addressInput.value = value;
    }

    setPayment(value: 'online' | 'cash'): void {
        this.updatePaymentButtons(value);
    }

    render(): HTMLElement {
        return this._container;
    }

    reset(): void {
        this._addressInput.value = '';
        this._paymentButtons.forEach((button) => {
            button.classList.remove('button_alt-active');
        });
        this._errorsElement.textContent = '';
        this._submitButton.disabled = true;
    }
}