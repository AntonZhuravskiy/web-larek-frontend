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
		this.inputList.forEach((input) => {
			input.addEventListener('input', () => {
				this.events.emit(AppEvents.ORDER_UPDATE, {
					field: input.name,
					value: input.value,
				});
			});
		});

		this.container.addEventListener('submit', (evt: Event) => {
			evt.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	set error(value: string) {
		this.setText(this._error, value);
	}

	updateErrors(errorText: string, hasErrors: boolean): void {
		// Только отрисовка - никакой логики
		this.error = errorText;
		this.setDisabled(this._submit, hasErrors);
	}

	clear(): void {
		this.container.reset();
	}

	emitInput(): void {
		this.events.emit(`${this.container.name}:input`);
	}

	render(data?: Partial<T> & IFormValidation): HTMLElement {
		const { valid, ...inputs } = data || {};
		// Если передан параметр valid, устанавливаем состояние кнопки
		if (typeof valid === 'boolean') {
			this.setDisabled(this._submit, !valid);
		}
		Object.assign(this, inputs);
		return this.container;
	}
}
