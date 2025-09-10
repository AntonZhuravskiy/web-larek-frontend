import { ensureAllElements, ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';
import { FormView } from './FormView';
import { IDeliveryInfo, AppEvents } from '../../types';

export class OrderView extends FormView<IDeliveryInfo> {
	protected buttonContainer: HTMLDivElement;
	protected onlineButton: HTMLButtonElement;
	protected cashButton: HTMLButtonElement;
	protected addressInput: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this.buttonContainer = ensureElement<HTMLDivElement>(
			'.order__buttons',
			container
		);

		[this.onlineButton, this.cashButton] = ensureAllElements<HTMLButtonElement>(
			'.button_alt',
			container
		);

		this.addressInput = this.container.elements.namedItem(
			'address'
		) as HTMLInputElement;

		// Устанавливаем слушатели на кнопки способа оплаты
		[this.onlineButton, this.cashButton].forEach(button => {
			button.addEventListener('click', () => {
				this.resetButtons();
				this.toggleClass(button, 'button_alt-active', true);
				this.events.emit(AppEvents.ORDER_UPDATE, {
					field: 'payment',
					value: button.name
				});
			});
		});

	}

	get address(): string {
		return this.addressInput.value;
	}

	get payment(): string {
		const buttonActive = this.getActiveButton();
		const result = buttonActive ? buttonActive.name : '';
		return result;
	}


	getActiveButton(): HTMLButtonElement | null {
		if (this.onlineButton.classList.contains('button_alt-active')) {
			return this.onlineButton;
		} else if (this.cashButton.classList.contains('button_alt-active')) {
			return this.cashButton;
		} else {
			return null;
		}
	}

	toggleCash(state = true): void {
		this.toggleClass(this.cashButton, 'button_alt-active', state);
	}

	toggleCard(state = true): void {
		this.toggleClass(this.onlineButton, 'button_alt-active', state);
	}

	resetButtons(): void {
		this.toggleCash(false);
		this.toggleCard(false);
	}

	clear(): void {
		super.clear();
		this.resetButtons();
	}
}
