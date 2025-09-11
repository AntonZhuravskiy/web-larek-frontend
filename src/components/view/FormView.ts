import { IFormValidation, IFormErrors, AppEvents } from '../../types';
import { ensureAllElements, ensureElement } from '../../utils/utils';
import { CommonView } from './CommonView';
import { IEvents } from '../base/events';

export class FormView<T> extends CommonView<IFormValidation> {
	protected container: HTMLFormElement;
	protected events: IEvents;
	protected inputList: HTMLInputElement[];
	protected _submit: HTMLButtonElement;
	protected _error: HTMLSpanElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container);

		this.events = events;

		this.inputList = ensureAllElements<HTMLInputElement>(
			'.form__input',
			container
		);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			container
		);
		this._error = ensureElement<HTMLSpanElement>('.form__errors', container);

		// Устанавливаем слушатели на все поля ввода
		this.inputList.forEach(input => {
			input.addEventListener('input', () => {
				this.events.emit(AppEvents.ORDER_UPDATE, { key: input.name, value: input.value });
			});
		});

		// Эмитим событие отправки формы
		this.container.addEventListener('submit', (evt: Event) => {
			evt.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	// Методы только для отображения состояния на основе данных из модели
	setSubmitEnabled(enabled: boolean) {
		this.setDisabled(this._submit, !enabled);
	}

	showError(message: string) {
		this.setText(this._error, message);
	}

	updateErrors(errors: IFormErrors): void {
		// Собираем все ошибки в одну строку и отображаем
		const errorMessages = Object.values(errors).filter(Boolean);
		this.showError(errorMessages.join('; '));
		
		// Управляем состоянием кнопки на основе наличия ошибок
		const hasErrors = errorMessages.length > 0;
		this.setSubmitEnabled(!hasErrors);
	}

	clear(): void {
		this.container.reset();
	}

	emitInput(): void {
		this.events.emit(`${this.container.name}:input`);
	}

	render(data?: Partial<T>): HTMLElement {
		if (data) {
			Object.assign(this, data);
		}
		return this.container;
	}
}