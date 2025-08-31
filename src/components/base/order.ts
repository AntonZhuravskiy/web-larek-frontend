import { ensureElement } from '../../utils/utils';
import { IOrderForm, FormErrors } from '../../types';

export class OrderForm {
	protected _container: HTMLElement;
	protected _paymentButtons: HTMLButtonElement[];
	protected _addressInput: HTMLInputElement;
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

		// Получаем кнопки способа оплаты
		this._paymentButtons = Array.from(
			container.querySelectorAll('.order__buttons .button')
		) as HTMLButtonElement[];

		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		// Обработчики кнопок оплаты
		this._paymentButtons.forEach((button) => {
			button.addEventListener('click', (event) => {
				event.preventDefault();
				const buttonName = button.getAttribute('name');
				const payment = buttonName === 'card' ? 'online' : 'cash';
				this.setPaymentMethod(payment);
			});
		});

		// Обработчик ввода адреса
		this._addressInput.addEventListener('input', () => {
			this.setAddress(this._addressInput.value);
		});

		// Обработчик отправки формы
		this._form.addEventListener('submit', (event) => {
			event.preventDefault();
			this.submit();
		});
	}

	private setPaymentMethod(payment: 'online' | 'cash'): void {
		this._formData.payment = payment;

		// Обновляем визуальное состояние кнопок
		this._paymentButtons.forEach((button) => {
			const buttonName = button.getAttribute('name');
			const isActive =
				(payment === 'online' && buttonName === 'card') ||
				(payment === 'cash' && buttonName === 'cash');
			button.classList.toggle('button_alt-active', isActive);
		});

		this.validateForm();
	}

	private setAddress(address: string): void {
		this._formData.address = address;
		this.validateForm();
	}

	private validateForm(): void {
		this._errors = {};

		// Проверка способа оплаты
		if (!this._formData.payment) {
			this._errors.payment = 'Необходимо выбрать способ оплаты';
		}

		// Проверка адреса
		if (!this._formData.address || this._formData.address.trim() === '') {
			this._errors.address = 'Необходимо указать адрес';
		}

		this.updateErrors();
		this.updateSubmitButton();
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
			this.events?.emit('order:submit', this._formData);
		}
	}

	set payment(value: 'online' | 'cash') {
		this.setPaymentMethod(value);
	}

	set address(value: string) {
		this._addressInput.value = value;
		this.setAddress(value);
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
		this._addressInput.value = '';
		this._paymentButtons.forEach((button) => {
			button.classList.remove('button_alt-active');
		});
		this.updateErrors();
		this.updateSubmitButton();
	}
}
