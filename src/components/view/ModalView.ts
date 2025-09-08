import { IModalView, AppEvents } from '../../types';
import { ensureElement } from '../../utils/utils';
import { CommonView } from './CommonView';
import { IEvents } from '../base/events';

export class ModalView extends CommonView<IModalView> {
	protected events: IEvents;
	protected _content: HTMLElement;
	protected _closeButton: HTMLButtonElement;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);

		this.events = events;

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);

		this._content = ensureElement<HTMLDivElement>('.modal__content', container);

		this._closeButton.addEventListener('click', () => this.close());

		this.container.addEventListener('mousedown', (evt: MouseEvent) => {
			const target = evt.target as HTMLElement;
			if (target.classList.contains('modal')) {
				this.close();
			}
		});
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	open() {
		this.toggleClass(this.container, 'modal_active', true);
		this.events.emit(AppEvents.MODAL_OPEN);
	}

	close() {
		this.toggleClass(this.container, 'modal_active', false);
		this.events.emit(AppEvents.MODAL_CLOSE);
	}
}
