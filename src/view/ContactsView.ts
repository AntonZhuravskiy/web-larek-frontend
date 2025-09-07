import { ensureElement } from '../utils/utils';
import { IEvents } from '../components/base/events';
import { AppEvents } from '../types';

export class ContactsFormView {
    protected _container: HTMLElement;
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;
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
        
        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);
        this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
        this._errorsElement = ensureElement<HTMLElement>('.form__errors', container);
        
        this.setupEventListeners();
    }

    get container(): HTMLElement {
        return this._container;
    }

    private setupEventListeners(): void {
        this._emailInput.addEventListener('input', () => {
            // Эмитим событие обновления, а не валидируем здесь
            this.events.emit(AppEvents.CONTACTS_UPDATE, { 
                field: 'email', 
                value: this._emailInput.value 
            });
        });

        this._phoneInput.addEventListener('input', () => {
            // Эмитим событие обновления, а не валидируем здесь
            this.events.emit(AppEvents.CONTACTS_UPDATE, { 
                field: 'phone', 
                value: this._phoneInput.value 
            });
        });

        this._form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit(AppEvents.CONTACTS_SUBMIT);
        });
    }

    // Обновление ошибок (вызывается извне из Model)
    updateErrors(errors: Record<string, string>): void {
        const errorMessages = Object.values(errors).filter(Boolean);
        this._errorsElement.textContent = errorMessages.join('; ');
        this._submitButton.disabled = errorMessages.length > 0;
    }

    // Установка значений (вызывается извне)
    setEmail(value: string): void {
        this._emailInput.value = value;
    }

    setPhone(value: string): void {
        this._phoneInput.value = value;
    }

    render(): HTMLElement {
        return this._container;
    }

    reset(): void {
        this._emailInput.value = '';
        this._phoneInput.value = '';
        this._errorsElement.textContent = '';
        this._submitButton.disabled = true;
    }
}