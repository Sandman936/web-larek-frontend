import { IOrderForm } from "../types";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";

//Класс, описывающий форму способа оплаты и адрес
export class Order extends Form<IOrderForm> {
    protected _card: HTMLButtonElement;
    protected _cash: HTMLButtonElement;

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        super(container, events);

        this._card = this.container.elements.namedItem('card') as HTMLButtonElement;
        this._cash = this.container.elements.namedItem('cash') as HTMLButtonElement;

        this._card.addEventListener( 'click', () => {
            this._card.classList.add('button_alt-active');
            this._cash.classList.remove('button_alt-active');
            this.onInputChange('payment', 'card');
        });

        this._cash.addEventListener( 'click', () => {
            this._cash.classList.add('button_alt-active');
            this._card.classList.remove('button_alt-active');
            this.onInputChange('payment', 'cash');
        });
    }

    resetOrderForm() {
        this.container.reset();
    }

    resetOrderButtons() {
        this._card.classList.remove('button_alt-active');
        this._cash.classList.remove('button_alt-active');
    }
}

export class Contacts extends Form<IOrderForm> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }
}