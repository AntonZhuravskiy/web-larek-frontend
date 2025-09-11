import { IContactInfo } from '../../types';
import { IEvents } from '../base/events';
import { FormView } from './FormView';

export class ContactsView extends FormView<IContactInfo> {
	protected emailInput: HTMLInputElement;
	protected phoneInput: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this.emailInput = this.container.elements.namedItem(
			'email'
		) as HTMLInputElement;

		this.phoneInput = this.container.elements.namedItem(
			'phone'
		) as HTMLInputElement;
	}

	get email(): string {
		return this.emailInput.value;
	}

	get phone(): string {
		return this.phoneInput.value;
	}
}
