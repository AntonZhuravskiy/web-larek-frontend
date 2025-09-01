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
    console.log(`Cloning template: ${templateId}`);
    const template = document.getElementById(templateId) as HTMLTemplateElement;
    if (!template) {
        console.error(`Template ${templateId} not found in DOM`);
        console.log('Available templates:', Array.from(document.querySelectorAll('template')).map(t => t.id));
        throw new Error(`Template ${templateId} not found`);
    }
    
    // Используем cloneNode(true) для глубокого клонирования всего содержимого
    const cloned = template.content.cloneNode(true) as DocumentFragment;
    const element = cloned.firstElementChild as T;
    
    if (!element) {
        console.error(`Template ${templateId} has no content or firstElementChild`);
        throw new Error(`Template ${templateId} content is empty`);
    }
    
    console.log(`Successfully cloned template ${templateId}:`, element);
    console.log(`Element classes: ${element.className}`);
    console.log(`Element tag: ${element.tagName}`);
    return element;
}