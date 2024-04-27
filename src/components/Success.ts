import {Component} from "./base/Component";
import {ensureElement} from "../utils/utils";

//Интерфейс данных окна успешной покупки
interface ISuccess {
    description: number;
}

interface ISuccessActions {
    onClick: (event: MouseEvent) => void;
}

//Класс, описывающий отображение окна успешной покупки
export class Success extends Component<ISuccess> {
    protected _description: HTMLParagraphElement;
    protected _close: HTMLElement;

    constructor(protected blockName: string, container: HTMLElement, actions: ISuccessActions) {
        super(container);
        
        this._description = ensureElement<HTMLParagraphElement>(`.${blockName}__description`, this.container)
        this._close = ensureElement<HTMLElement>(`.${blockName}__close`, this.container);

        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }

    set description (value: number) {
        this.setText(this._description, `Списано ${value} синапсов`);
    }
}