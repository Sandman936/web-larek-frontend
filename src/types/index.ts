export type ProductCategory = {
    "софт-скил" : string;
    "другое" : string;
    "дополнительное" : string;
    "кнопка" : string;
    "хард-скил" : string;
}

export interface IProductItem {
    id: string;
    index: number;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
    selected: boolean;
}

export interface IAppState {
    catalog: IProductItem[];
    basket: IProductItem[];
    order: IOrder;
    formErrors: FormErrors;

    addToBasket(item: IProductItem): void;

    getBasketAmount(): number;

    removeFromBasket(id: string): void;

    resetBasket(): void;

    resetOrder(): void;

    setItems(): void;

    setCatalog(items: IProductItem[]): void;

    getBasketTotalPrice(): number;

    resetSelected(): void;

    setOrderField(field: keyof IOrderForm, value: string): void;

    validateOrder(): boolean;

    validateContacts(): boolean;
}

export interface IOrderForm {
    payment: string;
    address: string;
    email: string;
    phone: string;
}

export interface IOrder {
    items: string[];
    total: number;
    payment: string;
    address: string;
    email: string;
    phone: string;
}

export type FormErrors = Partial<Record<keyof IOrderForm, string>>;