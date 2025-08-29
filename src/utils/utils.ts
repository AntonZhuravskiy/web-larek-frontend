export function ensureAllElements<T extends HTMLElement>(selector: string, context: HTMLElement = document as unknown as HTMLElement): T[] {
    return Array.from(context.querySelectorAll(selector)) as T[];
}

export function ensureElement<T extends HTMLElement>(selector: string, context?: HTMLElement): T {
    const elements = ensureAllElements<T>(selector, context);
    if (elements.length > 1) {
        console.warn(`selector ${selector} return more then one element`);
    }
    if (elements.length === 0) {
        throw new Error(`selector ${selector} return nothing`);
    }
    return elements[0];
}

export function cloneTemplate<T extends HTMLElement>(templateId: string): T {
    const template = document.getElementById(templateId) as HTMLTemplateElement;
    if (!template) {
        throw new Error(`Template ${templateId} not found`);
    }
    return template.content.firstElementChild?.cloneNode(true) as T;
}