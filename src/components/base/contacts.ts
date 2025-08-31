import { ensureElement } from '../../utils/utils';
import { IOrderForm, FormErrors } from '../../types';

export class ContactsForm {
    protected _container: HTMLElement;
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;
    protected _submitButton: HTMLButtonElement;
    protected _errorsElement: HTMLElement;
    protected _form: HTMLFormElement;
    
    protected _formData: Partial<IOrderForm> = {};
    protected _errors: FormErrors = {};

    constructor(container: HTMLElement, private events?: any) {
        this._container = container;
        
        // Проверяем, является ли контейнер формой, иначе ищем форму внутри
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

    private setupEventListeners(): void {
        // Обработчик ввода email
        this._emailInput.addEventListener('input', () => {
            this.setEmail(this._emailInput.value);
        });

        // Обработчик ввода телефона
        this._phoneInput.addEventListener('input', () => {
            this.setPhone(this._phoneInput.value);
        });

        // Обработчик отправки формы
        this._form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.submit();
        });
    }

    private setEmail(email: string): void {
        this._formData.email = email;
        this.validateForm();
    }

    private setPhone(phone: string): void {
        this._formData.phone = phone;
        this.validateForm();
    }

    private validateForm(): void {
        this._errors = {};

        // Проверка email
        if (!this._formData.email || this._formData.email.trim() === '') {
            this._errors.email = 'Необходимо указать email';
        } else if (!this.isValidEmail(this._formData.email)) {
            this._errors.email = 'Некорректный формат email';
        }

        // Проверка телефона
        if (!this._formData.phone || this._formData.phone.trim() === '') {
            this._errors.phone = 'Необходимо указать номер телефона';
        }

        this.updateErrors();
        this.updateSubmitButton();
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private updateErrors(): void {
        const errorMessages = Object.values(this._errors).filter(Boolean);
        this._errorsElement.textContent = errorMessages.join('; ');
    }

    private updateSubmitButton(): void {
        const hasErrors = Object.keys(this._errors).length > 0;
        this._submitButton.disabled = hasErrors;
    }

    private submit(): void {
        this.validateForm();
        
        if (Object.keys(this._errors).length === 0) {
            this.events?.emit('contacts:submit', this._formData);
        }
    }

    set email(value: string) {
        this._emailInput.value = value;
        this.setEmail(value);
    }

    set phone(value: string) {
        this._phoneInput.value = value;
        this.setPhone(value);
    }

    get formData(): Partial<IOrderForm> {
        return { ...this._formData };
    }

    render(): HTMLElement {
        this.validateForm();
        return this._container;
    }

    reset(): void {
        this._formData = {};
        this._errors = {};
        this._emailInput.value = '';
        this._phoneInput.value = '';
        this.updateErrors();
        this.updateSubmitButton();
    }
}
