import { IProduct } from '../types';

export class ProductModel {
    private products: IProduct[] = [];

    setProducts(products: IProduct[]): void {
        this.products = products;
    }

    getProducts(): IProduct[] {
        return [...this.products];
    }

    getProduct(id: string): IProduct | undefined {
        return this.products.find(product => product.id === id);
    }

    getAvailableProducts(): IProduct[] {
        return this.products.filter(product => product.price !== null);
    }

    isEmpty(): boolean {
        return this.products.length === 0;
    }
}
