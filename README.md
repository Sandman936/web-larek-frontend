# Проектная работа: "WEB-ларёк"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Документация

В проекте используется шаблон проектирования Model-View-Presenter.
Проект разделен на слои:

- Слой данных (Model) представлен компонентом AppData и вспомогательным компонетом Model.

- Слой отображения (View) представлен компонентами Basket, Card, Order , Page, Success и вспомогательными компонентами Component, Form, Modal.

- Слой представления (Presenter) представлен в файле index.ts ввиду простоты приложения. Компонент api и events также является частью слоя представления.

### Интерфейсы и типы данных с которыми работает приложение

```TypeScript
//Тип возможных категорий товара
type ProductCategory = {
    "софт-скил" : string;
    "другое" : string;
    "дополнительное" : string;
    "кнопка" : string;
    "хард-скил" : string;
}

//Интерфейс описания товара в магазине
interface IProductItem {
    id: string; //Идентификатор товара
    description: string; //Описание товара
    image: string; //Изображение товара
    title: string; //Название товара
    category: string; //Категория товара
    price: number | null; //Стоимость товара
    selected: boolean; //Состояние добавления в корзину
}

/*Интерфейс описания работы состояния приложения.
Описывает какие данные может хранить приложение и методы для работы с ними
*/
interface IAppState {
    catalog: IProductItem[]; //Массив товаров магазина
    basket: IProductItem[]; //Корзина с массивом добавленных товаров
    order: IOrder; //Данные для оформления заказа
    formErrors: FormErrors; //Ошибки при заполнении форм

    addToBasket(item: IProductItem): void; // Метод для добавления товара в корзину

    getBasketAmount(): number; // Метод для получения количества товаров в корзине

    removeFromBasket(id: string): void; // Метод для удаления товара из корзины

    resetBasket(): void; // Метод для очистки корзины

    resetOrder(): void; // Метод для удаления данных для оформления заказа

    setItems(): void; // Метод для передачи id товаров из корзины в поле items данных оформления заказа order

    setCatalog(items: IProductItem[]): void; // Метод преобразования полученных с сервера карточек товаров

    getBasketTotalPrice(): number; //Метод для получения общей стоимости товаров в корзине

    resetSelected(): void; //Снять у всех карточек состояния добавления в корзину

    setOrderField(field: keyof IOrderForm, value: string): void; //Метод для установки значений из форм в данные оформления заказа

    validateOrder(): boolean; //Валидация способа оплаты и адреса

    validateContacts(): boolean; //Валидация контактной информации
}

//Интерфейс для форм оформления заказа
interface IOrderForm {
    payment: string;
    address: string;
    email: string;
    phone: string;
}

//Интерфейс для данных оформления заказа
interface IOrder {
    items: string[]; //Массив из id оформляемых к покупке товаров
    total: number; // Итоговая цена оформляемых к покупке товаров
    payment: string; // Способ оплаты
    address: string; // Адрес доставки
    email: string; // Почта клиента
    phone: string; // Телефон клиента
}

//Тип ошибок валидации форм
type FormErrors = Partial<Record<keyof IOrderForm, string>>;

//Интерфейс данных корзины
interface IBasketView {
    items: HTMLElement[] | HTMLParagraphElement; //DOM элементы товаров находящихся в окне корзине
    price: number; //Цена всех товаров в корзине
}

//Интерфейс данных товара в корзине
interface IBasketItem extends IProductItem {
    id: string; //Идентификатор товара в корзине
    index: number; //Порядковый номер товара в корзине
}

//Интерфейс данных карточки товара
interface ICard {
    id: string; //Идентификатор карточки товара
    description: string; //Описание карточки товара
    image: string; //Изображение карточки товара
    title: string; //Название карточки товара 
    category: string; //Категория карточки товара
    price: number | null; //Цена карточки товара
    selected: boolean; //Состояние добавления карточки товара в корзину
}

//Интерфейс данных страницы приложения
interface IPage {
    counter: number; //Количество товаров в корзине
    catalog: HTMLElement[]; //Dom элементы карточек товаров
    locked: boolean; //Состояние блокировки прокрутки страницы
}

//Интерфейс данных окна успешной покупки
interface ISuccess {
    description: number; //Итоговая потраченная сумма
}
```

### Модели данных и классов отображения приложения

```TypeScript
/**
 * Базовая модель, чтобы можно было отличить ее от простых объектов с данными
 */
abstract class Model<T> {
    //Конструктор принимает объект данных и событие
    constructor(data: Partial<T>, protected events: IEvents);

    //Метод вызывает событие
    emitChanges(event: string, payload?: object);
}

//Модель данных состояния приложения
class AppState extends Model<IAppState> {
    catalog: IProductItem[]; //Массив товаров магазина
    basket: IProductItem[] = []; //Массив товаров в корзине
    order: //Данные оформления заказа
        IOrder = {
            items: [], //Массив товаров к покупе
            total: null, //Итоговая стоимость товаров к покупке
            address: "", //Адрес клиента
            payment: "", //Способ оплаты товара
            email: "", //Почта клиента
            phone: "" //Телефон клиента
    }
    formErrors: FormErrors = {}; //Ошибки валидации форм

    addToBasket(item: IProductItem): void; // Метод для добавления товара в корзину, принимает объект с данными товара

    getBasketAmount(): number; // Метод для получения количества товаров в корзине

    removeFromBasket(id: string): void; // Метод для удаления товара из корзины, принимает id товара

    resetBasket(): void; // Метод для очистки корзины

    resetOrder(): void; // Метод для удаления данных для оформления заказа

    setItems(): void; // Метод для передачи id товаров из корзины в поле items данных оформления заказа order

    setCatalog(items: IProductItem[]): void; // Метод преобразования полученных с сервера карточек товаров, принимает массив товаров

    getBasketTotalPrice(): number; //Метод для получения общей стоимости товаров в корзине

    resetSelected(): void; //Снять у всех карточек состояния добавления в корзину

    setOrderField(field: keyof IOrderForm, value: string): void; //Метод для установки значений из форм в данные оформления заказа, принимает имя формы и значение

    validateOrder(): boolean; //Валидация способа оплаты и адреса

    validateContacts(): boolean; //Валидация контактной информации

    resetIndexes() //Метод, обновляет порядковые номера элементов массива корзины
}

/**
 * Базовый компонент
 */
abstract class Component<T> {
    //Конструктор принимает контейнер
    protected constructor(protected readonly container: HTMLElement)

    // Инструментарий для работы с DOM в дочерних компонентах

    // Переключить класс
    toggleClass(element: HTMLElement, className: string, force?: boolean)

    // Установить текстовое содержимое
    protected setText(element: HTMLElement, value: unknown)

    // Сменить статус блокировки
    setDisabled(element: HTMLElement, state: boolean)

    // Скрыть
    protected setHidden(element: HTMLElement)

    // Показать
    protected setVisible(element: HTMLElement)

    // Установить изображение с алтернативным текстом
    protected setImage(element: HTMLImageElement, src: string, alt?: string)

    // Вернуть корневой DOM-элемент
    render(data?: Partial<T>): HTMLElement
}

//Класс, описывающий корзину с товарами
class Basket extends Component<IBasketView> {
    //Параметры, хранящие ссылки на DOM элементы корзины
    protected _list: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    //Конструктор принимает контейнер, событие и сохраняет ссылки в параметры класса и вешает слушатель на кнопку
    constructor(container: HTMLElement, protected events: EventEmitter)

    set items(items: HTMLElement[]) //Сеттер, принимает массив DOM элементов и размещает их в корзине

    set price(price: number) //Сеттер, устанавливает значение итоговой стоимости товаров в корзине
}

//Класс, описывающий элемент корзины с товарами
class BasketItem extends Component<IBasketItem> {
    //Параметры, хранящие ссылки на DOM элементы товара в корзине
    protected _index: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    //Конструктор принимает название блока, контейнер, событие и сохраняет ссылки в параметры класса и вешает слушатель на кнопку
    constructor(protected blockName: string, container: HTMLElement, protected events: IBasketItemActions)

    set index(value: number)//Сеттер, устанавливает порядковый номер товара в корзине, принимает число

    set title(value: string)//Сеттер, устанавливает название товара в корзине, принимает строку

    set price(price: number)//Сеттер, устанавливает цену товара в корзине, принимает число
}

//Класс, описывающий карточку товара
class Card extends Component<ICard> {
    //Параметры, хранящие ссылки на DOM элементы карточки
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    //Конструктор принимает название блока, контейнер, событие и сохраняет ссылки в параметры класса и вешает слушатель на кнопку
    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions)

    set id(value: string)//Сеттер, устанавливает идентификатор карточки, принимает строку

    get id(): string//Геттер, получает значение идентификатора карточки

    set title(value: string)//Сеттер, устанавливает название карточки, принимает строку

    get title(): string//Геттер, получает значение названия карточки

    set image(value: string)//Сеттер, устанавливает картинку карточки

    set price(value: number | null)//Сеттер, устанавливает цену карточки

    set category(value: string)//Сеттер, устанвливает категорию карточки

    set selected(value: boolean)//Сеттер, устанвливает состояние добавления карточки в корзину
}

//Класс, описывающий подробную информацию о карточке
class CardPreview extends Card {
    //Ссылка на DOM элемент описания
    protected _description: HTMLParagraphElement;

    //Конструктор принимает контейнер, событие и сохраняет ссылку в параметр класса и вешает слушатель на кнопку
    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions)

    set description(value: string)//Сеттер, устанавливает описание карточки
}

//Класс, описывающий форму заказа
class Form<T> extends Component<IFormState> {
    //Параметры, хранящие ссылки на DOM элементы формы
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    //Конструктор принимает контейнер, событие и сохраняет ссылки в параметры класса и вешает слушатель на кнопку
    constructor(protected container: HTMLFormElement, protected events: IEvents)

    protected onInputChange(field: keyof T, value: string)//Метод, принимает имя формы и значение, активирует событие изменения поля и передает объект

    set valid(value: boolean)//Сеттер, меняет состояние кнопки отправки формы

    set errors(value: string)//Сеттер, устанавливает текст ошибки в форме

    render(state: Partial<T> & IFormState)//Создает разметку формы из полученных данных
}

//Класс, описывающий форму способа оплаты и адрес
class Order extends Form<IOrderForm> {
    //Ссылка на DOM элемент кнопок формы
    protected _card: HTMLButtonElement;
    protected _cash: HTMLButtonElement;

    //Конструктор принимает контейнер, событие и сохраняет ссылки в параметры класса и вешает слушатели на кнопки
    constructor(protected container: HTMLFormElement, protected events: IEvents)

    resetOrderForm()//Метод, очищает поля ввода формы

    resetOrderButtons()//Метод, убирает выделение с выбранных кнопок формы
}

//Класс, описывающий отображение страницы магазина
class Page extends Component<IPage> {
    //Параметры, хранящие ссылки на DOM элементы страницы
    protected _counter: HTMLElement;
    protected _catalog: HTMLElement;
    protected _wrapper: HTMLElement;
    protected _basket: HTMLElement;

    //Конструктор принимает контейнер, событие и сохраняет ссылки в параметры класса
    constructor(container: HTMLElement, protected events: IEvents)

    set counter(value: number)//Сеттер, устанавливает значение в счетчик товаров в корзине, принимает число

    set catalog(items: HTMLElement[])//Сеттер, добавляет разметку карточек на страницу, принмает массив DOM элементов

    set locked(value: boolean)//Сеттер, устанавливает состояние блокировки прокрутки страницы
}

//Класс, описывающий отображение окна успешной покупки
class Success extends Component<ISuccess> {
    //Параметры, хранящие ссылки на DOM элементы
    protected _description: HTMLParagraphElement;
    protected _close: HTMLElement;

    //Конструктор принимает название блока, контейнер, событие и сохраняет ссылки в параметры класса
    constructor(protected blockName: string, container: HTMLElement, actions: ISuccessActions)

    set description (value: number)//Сеттер, устанавливает описание в окне успешной покупки
}

//Класс для взаимодействия с сервером
class Api {
    readonly baseUrl: string;//Базовый адрес для обращения к серверу
    protected options: RequestInit;//Опции для добавления параметров в заголовки

    //Конструктор принимает адрес для обращения к серверу и опции для добавления параметров в заголовки
    constructor(baseUrl: string, options: RequestInit = {})

    protected handleResponse(response: Response): Promise<object>// Обработка ответа от сервера

    get(uri: string)//Метод для GET запроса на сервер

    post(uri: string, data: object)//Метод для POST запроса на сервер
}

/**
 * Брокер событий, вспомогательный класс
 */
class EventEmitter implements IEvents {
    _events: Map<EventName, Set<Subscriber>>;

    //Создает экземпляр слушателя и помещает его в параметр
    constructor()

    on<T extends object>(eventName: EventName, callback: (event: T) => void)//Вешает слушатель на событие, принимает название события и функцию колбэк

    off(eventName: EventName, callback: Subscriber)//Снимает слушатель события, принимает название события и функцию колбэк

    emit<T extends object>(eventName: string, data?: T)//Активирует событие, принимает название события и объект данных
}

```
