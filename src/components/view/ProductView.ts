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
			this.events.emit(AppEvents.BASKET_ADD_ITEM, this.id);
		});
	}

	set description(value: string) {
		this.setText(this._description, value);
	}


	set state(state: boolean) {
		this.setDisabled(this.button, !state);
	}

	updateButton(text: string, disabled: boolean): void {
		this.setText(this.button, text);
		this.setDisabled(this.button, disabled);
	}
}
