import { FormErrors, IAppState, IOrder, IOrderForm, IProductItem } from "../types";
import { Model } from "./base/Model";

export type CatalogChangeEvent = {
    catalog: IProductItem[];
}

//Модель данных состояния приложения
export class AppState extends Model<IAppState> {
    catalog: IProductItem[];
    basket: IProductItem[] = [];
    order: IOrder = {
        items: [],
        total: null,
        address: "",
        payment: "",
        email: "",
        phone: ""
    }
    formErrors: FormErrors = {};

    addToBasket(item: IProductItem) {
        this.basket.push(item);
    }

    getBasketAmount() {
        return this.basket.length;
    }

    removeFromBasket(id: string) {
        this.basket = this.basket.filter(item => item.id !== id);
    }

    resetIndexes() {
        this.basket.forEach( (item, index) => {
            item.index = index + 1;
        })
    }

    resetBasket() {
        this.basket.length = 0;
    }

    resetOrder() {
        this.order = {
            items: [],
            total: null,
            address: "",
            payment: "",
            email: "",
            phone: ""
        }
    }

    setItems() {
        const ItemsWithPrice = this.basket.map( (item) => {
            if (item.price !== null) {
                return item.id;
            }

            return undefined;
        })
        
        this.order.items = ItemsWithPrice.filter( (item) => {
            return item !== undefined;
        })
    }

    setCatalog(items: IProductItem[]) {
        this.catalog = items;
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    getBasketTotalPrice() {
        return this.basket.reduce((a, c) => a + c.price, 0);
    }

    resetSelected() {
        this.catalog.forEach( card => card.selected = false);
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateContacts()) {
            this.events.emit('contacts:ready', this.order);
        }

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.payment) {
            errors.payment = 'Необходимо выбрать способ оплаты';
        }
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес доставки';
        }
        this.formErrors = errors;
        this.events.emit('orderFormErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateContacts() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать электронную почту';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать номер телефона';
        }
        this.formErrors = errors;
        this.events.emit('contactsFormErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}

