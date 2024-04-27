import { IProductItem } from "../types";
import { createElement, ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { EventEmitter } from "./base/events";

//Интерфейс данных корзины
interface IBasketView {
    items: HTMLElement[] | HTMLParagraphElement;
    price: number;
}

//Класс, описывающий корзину с товарами
export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._price = this.container.querySelector('.basket__price');
        this._button = this.container.querySelector('.basket__button');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }

        this.items = [];
    }

    set items(items: HTMLElement[]) {
        if (items.length) {
            this._list.replaceChildren(...items);
            this._button.disabled = false;
        } else {
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
            this._button.disabled = true;
        }
    }

    set price(price: number) {
        this.setText(this._price, `${price} синапсов`);

        if (price < 1) {
            this._button.disabled = true;
        }
    }
}

//Интерфейс товара в корзине
interface IBasketItem extends IProductItem {
    id: string;
}

export interface IBasketItemActions {
    onClick: (event: MouseEvent) => void;
}

//Класс, описывающий элемент корзины с товарами
export class BasketItem extends Component<IBasketItem> {
    protected _index: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, protected events: IBasketItemActions) {
        super(container);

        this._index = this.container.querySelector('.basket__item-index');
        this._title = this.container.querySelector(`.${blockName}__title`);
        this._price = this.container.querySelector(`.${blockName}__price`);
        this._button = this.container.querySelector(`.${blockName}__button`);

        if (this._button) {
            this._button.addEventListener('click', (event) => {
                this.container.remove();
                events?.onClick(event);
            });
        }
        
    }

    set index(value: number) {
        this.setText(this._index, value);
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(price: number) {
        if (price > 0) {
            this.setText(this._price, `${price} синапсов`);
        } else {
            this.setText(this._price, `Бесценно`);
        }
    }
}