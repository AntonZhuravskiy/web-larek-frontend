import { ProductPreviewData, AppEvents } from '../../types';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';
import { CatalogView } from './CatalogView';

export class ProductView extends CatalogView<ProductPreviewData> {
	protected button: HTMLButtonElement;
	protected _description: HTMLParagraphElement;

	constructor(container: HTMLElement, events: IEvents) {
		super(container, events);

		this._description = ensureElement<HTMLParagraphElement>(
			'.card__text',
			container
		);

		this.button = ensureElement<HTMLButtonElement>('.card__button', container);

		this.button.addEventListener('click', () => {
			this.events.emit(AppEvents.BASKET_ADD_ITEM, { id: this.id });
		});
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	set valid(state: boolean) {
		this.setDisabled(this.button, !state);
	}

	get valid(): boolean {
		return !this.button.disabled;
	}

	set state(state: boolean) {
		if (this.valid) {
			this.setDisabled(this.button, !state);
		}
	}
}
