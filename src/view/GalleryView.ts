import { ensureElement } from '../utils/utils';
import { IProduct } from '../types';

export class GalleryView {
    protected _container: HTMLElement;

    constructor(selector: string) {
        console.log(`GalleryView: Looking for element with selector: ${selector}`);
        try {
            this._container = ensureElement<HTMLElement>(selector);
            console.log('GalleryView: Container found:', this._container);
        } catch (error) {
            console.error(`GalleryView: Failed to find element ${selector}:`, error);
            throw error;
        }
    }

    clear(): void {
        this._container.innerHTML = '';
    }

    addCard(cardElement: HTMLElement): void {
        console.log('Adding card to gallery:', cardElement);
        console.log('Card classes:', cardElement.className);
        console.log('Gallery container before append:', this._container.innerHTML.length);
        
        this._container.appendChild(cardElement);
        
        console.log('Gallery container after append:', this._container.innerHTML.length);
        console.log('Gallery children count:', this._container.children.length);
    }

    render(products: IProduct[], renderCard: (product: IProduct) => HTMLElement): void {
        console.log('GalleryView.render called with products:', products.length);
        console.log('Gallery container before clear:', this._container.children.length);
        
        this.clear();
        console.log('Gallery container after clear:', this._container.children.length);
        
        products.forEach((product, index) => {
            console.log(`\n--- Rendering card ${index + 1}: ${product.title} ---`);
            try {
                const cardElement = renderCard(product);
                if (cardElement) {
                    console.log('Card element created successfully, classes:', cardElement.className);
                    this.addCard(cardElement);
                    console.log(`After adding card ${index + 1}, gallery children:`, this._container.children.length);
                } else {
                    console.error('renderCard returned null/undefined for product:', product);
                }
            } catch (error) {
                console.error('Error rendering card for product:', product, error);
            }
        });
        
        console.log('\n=== FINAL GALLERY STATE ===');
        console.log('Gallery children count after render:', this._container.children.length);
        console.log('Gallery innerHTML length:', this._container.innerHTML.length);
        console.log('Gallery HTML preview:', this._container.innerHTML.substring(0, 200) + '...');
    }
}
