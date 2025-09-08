import { IEvents } from '../base/events';

export abstract class CommonModel<T> {
	protected events: IEvents;
	
	constructor(data: Partial<T>, events: IEvents) {
		this.events = events;
		Object.assign(this, data);
	}

	emitChanges(event: string, data?: object) {
		this.events.emit(event, data ?? {});
	}
}
