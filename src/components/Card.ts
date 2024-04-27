import { cardCategory } from "../utils/constants";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

//Интерфейс данных карточки товара
export interface ICard {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
    selected: boolean;
}

//Класс, описывающий карточку товара
export class Card extends Component<ICard> {
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._button = container.querySelector(`.${blockName}__button`);
        this._category = container.querySelector(`.${blockName}__category`);
        this._price = container.querySelector(`.${blockName}__price`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title);
    }

    set price(value: number | null)  {
        this.setText(this._price, String(
            value > 0
                ? value + ' синапсов'
                : 'бесценно'
            )
        )
    }

    set category(value: string) {
        this._category.classList.add(cardCategory[value as keyof typeof cardCategory]);
        this.setText(this._category, value);
    }

    set selected(value: boolean) {
        this._button.disabled = value;
    }
}

//Класс, описывающий подробное описание карточки
export class CardPreview extends Card {
    protected _description: HTMLParagraphElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(blockName, container, actions);
        this._description = container.querySelector(`.${this.blockName}__text`);
    }

    set description(value: string) {
        this.setText(this._description, value);
    }
}