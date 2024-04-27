import './scss/styles.scss';

import { AppState, CatalogChangeEvent } from './components/AppData';
import { Card } from './components/Card';
import { Page } from './components/Page';
import { Api, ApiListResponse } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Basket, BasketItem } from './components/Basket';
import { Modal } from './components/common/Modal';
import { IOrderForm, IProductItem } from './types';
import { API_URL} from './utils/constants';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Contacts, Order } from './components/Order';
import { Success } from './components/Success'

const api = new Api(API_URL);
const events = new EventEmitter();

// Шаблоны темплейтов
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success('order-success', cloneTemplate(successTemplate), {
    onClick: () => {
        events.emit('modal:close')
        modal.close()
    }
});

// Модель данных приложения
const appData = new AppState({}, events);

// Изменились элементы магазина
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            id: item.id,
            image: item.image,
            title: item.title,
            category: item.category,
            price: item.price,
        });
    });
});

// Открыть модальное окно с информацией о карточке
events.on('card:select', (item: IProductItem) => {
    const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
        onClick: () => events.emit('card:toBasket', item)
    });

    modal.render({
        content: card.render({
            id: item.id,
            image: item.image,
            title: item.title,
            category: item.category,
            price: item.price,
            description: item.description,
            selected: item.selected
        })
    });
});

// Добавление товара в корзину
events.on('card:toBasket', (item: IProductItem) => {
    item.selected = true;
    appData.addToBasket(item);
    page.counter = appData.getBasketAmount();
    modal.close();
});

//Удаление товара из корзины
events.on('basket:delete', (item: IProductItem) => {
    item.selected = false;
    appData.removeFromBasket(item.id);
    basket.price = appData.getBasketTotalPrice();
    page.counter = appData.getBasketAmount();
    
    if(!appData.basket.length) {
        basket.render({
            items: createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }),
        })
    } else {
        basket.resetIndexes();
    }
});

// Открыть корзину с товарами
events.on('basket:open', () => {
    const basketList = appData.basket.map( (item, index) => {
        const basketItem = new BasketItem(
            'card',
            cloneTemplate(cardBasketTemplate),
            { onClick: () => events.emit('basket:delete', item)}
        );
        return basketItem.render({
            index: index + 1,
            title: item.title,
            price: item.price,
        })
        
    });
    
    modal.render({
        content: basket.render({
            items: basketList,
            price: appData.getBasketTotalPrice(),
        }),
    });
});

// Открыть форму заказа
events.on('order:open', () => {
    modal.render({
        content: order.render({
            address: '',
            valid: false,
            errors: []
        })
    });
});

// Изменилось состояние валидации формы оплаты и доставки
events.on('orderFormErrors:change', (errors: Partial<IOrderForm>) => {
    const { payment, address } = errors;
    order.valid = !payment && !address;
    order.errors = Object.values({payment, address}).filter(i => !!i).join(' | ');
});

// Изменилось состояние валидации формы контактной информации
events.on('contactsFormErrors:change', (errors: Partial<IOrderForm>) => {
    const { email, phone } = errors;
    contacts.valid = !email && !phone;
    contacts.errors = Object.values({email, phone}).filter(i => !!i).join(' | ');
});

// Изменилось состояние формы
events.on(/^(order|contacts)\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});


//Форма способа оплаты и доставки заполнена
events.on('order:submit', () => {
    appData.setItems();
    appData.order.total = appData.getBasketTotalPrice();

    modal.render({
        content: contacts.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    });
});

//Форма контактной информации заполнена
events.on('contacts:submit', () => {
    api.post('/order', appData.order)
        .then((result : ApiListResponse<string>) => {

        appData.resetBasket();
        appData.resetOrder();
        appData.resetSelected();
        page.counter = 0;
        modal.render({
            content: success.render({
                description: result.total,
            })
        });
    })
        .catch(err => {
        console.error(err);
    });
})

// Блокируем прокрутку страницы если открыто модальное окно
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
    appData.resetOrder();
    order.resetOrderForm();
    order.resetOrderButtons();
});

// Получаем лоты с сервера
api.get('/product')
    .then((res: ApiListResponse<IProductItem>) => {
        appData.setCatalog(res.items);
    })
    .catch(err => {
        console.error(err);
    });
