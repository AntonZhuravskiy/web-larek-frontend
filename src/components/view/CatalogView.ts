import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { AppEvents } from "../../types";
import { CardView } from "./CardView";

const categories: Record<string, string> = {
	'софт-скил': 'card__category_soft',
	'другое': 'card__category_other',
	'дополнительное': 'card__category_additional',
	'кнопка': 'card__category_button',
	'хард-скил': 'card__category_hard',
};

export class CatalogView<T> extends CardView<T> {
	protected _category: HTMLSpanElement;
	protected _image: HTMLImageElement;
	
	constructor(container: HTMLElement, events: IEvents) {
		super(container, events);
		
		this._category = ensureElement<HTMLSpanElement>(
			'.card__category',
			container
		);
		
		this._image = ensureElement<HTMLImageElement>('.card__image', container);
		
		this.container.addEventListener('click', () =>
			this.events.emit(AppEvents.PRODUCT_SELECT, { id: this.id })
		);
	}

	set image(value: string) {
		this.setImage(this._image, value);
	}

	set category(value: string) {
		this.toggleCategoryClass(value);
		this.setText(this._category, value);
	}

	get category(): string {
		return this._category.textContent;
	}

	toggleCategoryClass(value: string): void {
		if (value in categories) {
			const classModifier = categories[value];
			this.toggleClass(this._category, classModifier, true);
		}
	}
}