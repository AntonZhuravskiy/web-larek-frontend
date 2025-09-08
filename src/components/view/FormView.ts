import { IFormValidation } from '../../types';
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

		this.container.addEventListener('input', () => {
			this.emitInput();
		});

		this.container.addEventListener('submit', (evt: Event) => {
			evt.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	set valid(value: boolean) {
		this.setDisabled(this._submit, !value);
	}

	get valid(): boolean {
		return this.inputList.every((item) => item.value.length > 0);
	}

	set error(value: string) {
		this.setText(this._error, value);
	}

	clear(): void {
		this.container.reset();
	}

	emitInput(): void {
		this.events.emit(`${this.container.name}:input`);
	}

	render(data?: Partial<T> & IFormValidation): HTMLElement {
		const { valid, ...inputs } = data;
		super.render({ valid });
		Object.assign(this, inputs);
		return this.container;
	}
}
