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

	// Методы только для управления UI состоянием на основе данных из модели
	setButtonEnabled(enabled: boolean) {
		this.setDisabled(this.button, !enabled);
	}

	setButtonState(available: boolean) {
		this.setDisabled(this.button, !available);
	}
}
