import { IProduct, IFormErrors, AppEvents } from '../../types';
import { CommonModel } from './CommonModel';
import { IEvents } from '../base/events';

export interface IProductValidation {
	valid: boolean;
	state: boolean;
}

export class ProductModel extends CommonModel<IProduct> implements IProduct {
	protected _id: string;
	protected _title: string;
	protected _description: string;
	protected _category: string;
	protected _price: number;
	protected _image: string;
	protected _inBasket: boolean = false;

	constructor(data: Partial<IProduct>, events: IEvents) {
		super(data, events);
		this._id = data.id || '';
		this._title = data.title || '';
		this._description = data.description || '';
		this._category = data.category || '';
		this._price = data.price || 0;
		this._image = data.image || '';
	}

	get id(): string {
		return this._id;
	}

	set id(value: string) {
		this._id = value;
	}

	get title(): string {
		return this._title;
	}

	set title(value: string) {
		this._title = value;
	}

	get description(): string {
		return this._description;
	}

	set description(value: string) {
		this._description = value;
	}

	get category(): string {
		return this._category;
	}

	set category(value: string) {
		this._category = value;
	}

	get price(): number {
		return this._price;
	}

	set price(value: number) {
		this._price = value;
		this.validate();
	}

	get image(): string {
		return this._image;
	}

	set image(value: string) {
		this._image = value;
	}

	get inBasket(): boolean {
		return this._inBasket;
	}

	set inBasket(value: boolean) {
		this._inBasket = value;
		this.validate();
	}

	setData(field: string, value: any): void {
		switch (field) {
			case 'id':
				this._id = value;
				break;
			case 'title':
				this._title = value;
				break;
			case 'description':
				this._description = value;
				break;
			case 'category':
				this._category = value;
				break;
			case 'price':
				this._price = value;
				break;
			case 'image':
				this._image = value;
				break;
			case 'inBasket':
				this._inBasket = value;
				break;
		}
		this.validate();
	}

	validate(): void {
		const errors: IFormErrors = {};
		
		// Валидация цены - товар доступен для покупки, если у него есть цена
		const valid = Boolean(this._price);
		if (!valid) {
			errors.price = 'Товар недоступен для покупки';
		}
		
		// Валидация состояния - товар можно добавить в корзину, если его там еще нет
		const state = !this._inBasket;
		if (!state) {
			errors.state = 'Товар уже в корзине';
		}
		
		// Всегда эмитируем событие валидации с результатами
		this.events.emit(AppEvents.PRODUCT_VALIDATION, {
			id: this._id,
			valid,
			state,
			errors
		});
	}

	// Получить валидацию без эмиссии событий
	getValidation(): IProductValidation {
		const valid = Boolean(this._price);
		const state = !this._inBasket;
		return { valid, state };
	}

	// Проверить, можно ли добавить товар в корзину
	canAddToBasket(): boolean {
		const { valid, state } = this.getValidation();
		return valid && state;
	}

	// Получить данные продукта
	getProductData(): IProduct {
		return {
			id: this._id,
			title: this._title,
			description: this._description,
			category: this._category,
			price: this._price,
			image: this._image,
		};
	}

	// Получить текст кнопки на основе состояния продукта
	getButtonText(): string {
		const { valid, state } = this.getValidation();
		
		if (!valid) {
			return 'Недоступен';
		} else if (!state) {
			return 'Уже в корзине';
		} else {
			return 'В корзину';
		}
	}

	// Проверить, должна ли кнопка быть отключена
	isButtonDisabled(): boolean {
		const { valid, state } = this.getValidation();
		return !valid || !state;
	}
}

