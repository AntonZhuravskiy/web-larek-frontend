# Web Larek - Интернет-магазин цифровых товаров

## Описание проекта

Web Larek - это одностраничное приложение (SPA) интернет-магазина цифровых товаров, построенное на TypeScript с использованием архитектурного паттерна **MVP (Model-View-Presenter)** и событийно-ориентированной архитектуры для обеспечения слабой связанности компонентов.

## Инструкция по запуску

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run start
```
Приложение будет доступно по адресу: `http://localhost:8080`

### Сборка для production

```bash
npm run build
```

### Дополнительные команды

```bash
npm run lint          # Проверка кода линтером
npm run lint:fix      # Автоматическое исправление ошибок
npm run format        # Форматирование кода Prettier
npm run deploy        # Деплой на GitHub Pages
```

## Архитектура проекта

Проект использует архитектурный паттерн **MVP (Model-View-Presenter)** с элементами **Event-Driven Architecture**.

### Структура проекта
```
src/
├── components/
│   ├── base/            # Базовые компоненты (API, EventEmitter)
│   ├── model/           # Модели данных (Model слой)
│   └── view/            # Представления (View слой)
├── types/               # TypeScript типы и интерфейсы
├── utils/               # Вспомогательные утилиты
├── scss/                # Стили приложения
└── index.ts             # Presenter слой (главная логика приложения)
```

## Детальное описание компонентов

### Базовые компоненты

#### 1. Класс `Api` (`components/base/api.ts`)
**Назначение:** Универсальный HTTP-клиент для взаимодействия с backend API.

**Поля:**
- `baseUrl: string` - базовый URL API
- `options: RequestInit` - опции HTTP-запросов

**Методы:**
- `constructor(baseUrl: string, options?: RequestInit)` - инициализация клиента
- `get<T>(uri: string): Promise<T>` - GET-запрос
- `post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>` - POST/PUT/DELETE запрос
- `protected handleResponse<T>(response: Response): Promise<T>` - обработка ответов сервера

#### 2. Класс `ApiClient` (`components/base/apiClient.ts`)
**Назначение:** Специализированный клиент для работы с API магазина.

**Наследует:** `Api`

**Поля:**
- `cdn: string` - базовый URL для CDN изображений

**Методы:**
- `fetchProducts(): Promise<IProduct[]>` - получение списка товаров
- `fetchProduct(id: string): Promise<IProduct>` - получение товара по ID
- `createOrder(order: IOrderRequest): Promise<IOrderResponse>` - создание заказа

#### 3. Класс `EventEmitter` (`components/base/events.ts`)
**Назначение:** Реализация паттерна Наблюдатель для управления событиями.

**Поля:**
- `_events: Map<EventName, Set<Subscriber>>` - карта событий и подписчиков

**Методы:**
- `on<T>(event: EventName, callback: (data: T) => void): void` - подписка на событие
- `off(eventName: EventName, callback: Subscriber): void` - отписка от события
- `emit<T>(eventName: string, data?: T): void` - генерация события
- `onAll(callback: (event: EmitterEvent) => void): void` - подписка на все события
- `offAll(): void` - отписка от всех событий

### Слой модели (Model Layer)

#### 1. Класс `CommonModel<T>` (`model/CommonModel.ts`)
**Назначение:** Базовый класс для всех моделей.

**Поля:**
- `events: IEvents` - экземпляр EventEmitter для генерации событий

**Методы:**
- `constructor(data: Partial<T>, events: IEvents)` - инициализация модели
- `emitChanges(event: string, data?: object): void` - генерация события изменения

#### 2. Класс `CatalogModel` (`model/CatalogModel.ts`)
**Назначение:** Управление данными каталога товаров.

**Наследует:** `CommonModel<IProductList>`

**Поля:**
- `_items: IProduct[]` - массив товаров

**Методы:**
- `set items(list: IProduct[])` - установка списка товаров с генерацией события
- `get items(): IProduct[]` - получение списка товаров
- `getId(id: string): IProduct | undefined` - получение товара по ID

#### 3. Класс `BasketModel` (`model/BasketModel.ts`)
**Назначение:** Управление состоянием корзины покупок.

**Наследует:** `CommonModel<IProductList>`

**Поля:**
- `_items: IProduct[]` - массив товаров в корзине

**Методы:**
- `add(item: IProduct): void` - добавление товара в корзину
- `remove(id: string): void` - удаление товара из корзины
- `clear(): void` - очистка корзины
- `get total(): number` - расчет общей суммы
- `get length(): number` - получение количества товаров
- `check(id: string): boolean` - проверка наличия товара в корзине
- `getIdList(): string[]` - получение списка ID товаров

#### 4. Класс `OrderModel` (`model/OrderModel.ts`)
**Назначение:** Управление данными заказа.

**Наследует:** `CommonModel<IOrder>`

**Поля:**
- `_payment: PaymentMethod` - способ оплаты
- `_address: string` - адрес доставки
- `_email: string` - email покупателя
- `_phone: string` - телефон покупателя
- `_total: number` - общая сумма заказа
- `_items: string[]` - список ID товаров

**Методы:**
- `setDelivery(delivery: IDeliveryInfo): void` - установка данных доставки
- `setContacts(contacts: IContactInfo): void` - установка контактных данных
- `setOrderItems(orderItems: IOrderItems): void` - установка товаров заказа
- `readyОrder(): IOrderRequest` - получение готового объекта заказа

### Слой представления (View Layer)

#### 1. Класс `CommonView<T>` (`view/CommonView.ts`)
**Назначение:** Базовый класс для всех представлений.

**Поля:**
- `container: HTMLElement` - DOM-контейнер компонента

**Методы:**
- `setImage(element: HTMLImageElement, src: string, alt?: string): void` - установка изображения
- `setText(element: HTMLElement, value: unknown): void` - установка текста
- `setDisabled(element: HTMLElement, state: boolean): void` - управление состоянием disabled
- `toggleClass(element: HTMLElement, className: string, force?: boolean): void` - переключение CSS-класса
- `render(data?: Partial<T>): HTMLElement` - отрисовка компонента

#### 2. Класс `CardView<T>` (`view/CardView.ts`)
**Назначение:** Базовое представление карточки товара.

**Наследует:** `CommonView<T>`

**Поля:**
- `_title: HTMLElement` - элемент заголовка
- `_price: HTMLElement` - элемент цены
- `id: string` - идентификатор товара

**Методы:**
- `set title(value: string)` - установка заголовка
- `set price(value: number)` - установка цены

#### 3. Класс `CatalogView<T>` (`view/CatalogView.ts`)
**Назначение:** Представление карточки товара в каталоге.

**Наследует:** `CardView<T>`

**Дополнительные поля:**
- `_category: HTMLSpanElement` - элемент категории
- `_image: HTMLImageElement` - элемент изображения

**Дополнительные методы:**
- `set image(value: string)` - установка изображения
- `set category(value: string)` - установка категории
- `toggleCategoryClass(value: string): void` - переключение CSS-класса категории

#### 4. Класс `ProductView` (`view/ProductView.ts`)
**Назначение:** Расширенное представление товара для превью.

**Наследует:** `CatalogView<ProductPreviewData>`

**Дополнительные поля:**
- `button: HTMLButtonElement` - кнопка действия
- `_description: HTMLParagraphElement` - элемент описания

**Дополнительные методы:**
- `set description(value: string)` - установка описания
- `set valid(state: boolean)` - управление доступностью кнопки
- `set state(state: boolean)` - управление состоянием товара

#### 5. Класс `BasketView` (`view/BasketView.ts`)
**Назначение:** Представление корзины покупок.

**Наследует:** `CommonView<IBasketView>`

**Поля:**
- `button: HTMLButtonElement` - кнопка оформления заказа
- `_list: HTMLElement` - список товаров
- `_price: HTMLSpanElement` - элемент общей суммы

**Методы:**
- `set price(value: number)` - установка общей суммы
- `set valid(state: boolean)` - управление доступностью кнопки
- `set list(items: HTMLElement[])` - установка списка товаров

#### 6. Класс `BasketCardView` (`view/BasketView.ts`)
**Назначение:** Представление товара в корзине.

**Наследует:** `CardView<BasketProductCard>`

**Дополнительные поля:**
- `button: HTMLButtonElement` - кнопка удаления
- `_index: HTMLSpanElement` - элемент номера позиции

**Дополнительные методы:**
- `set index(value: number)` - установка номера позиции

#### 7. Класс `ModalView` (`view/ModalView.ts`)
**Назначение:** Управление модальными окнами.

**Наследует:** `CommonView<IModalView>`

**Поля:**
- `_content: HTMLElement` - элемент содержимого
- `_closeButton: HTMLButtonElement` - кнопка закрытия

**Методы:**
- `set content(value: HTMLElement)` - установка содержимого
- `open(): void` - открытие модального окна
- `close(): void` - закрытие модального окна

#### 8. Класс `FormView<T>` (`view/FormView.ts`)
**Назначение:** Базовый класс для форм.

**Наследует:** `CommonView<IFormValidation>`

**Поля:**
- `_submit: HTMLButtonElement` - кнопка отправки
- `_errors: HTMLElement` - элемент отображения ошибок

**Методы:**
- `set valid(value: boolean)` - управление валидностью формы
- `set errors(value: string)` - установка текста ошибок
- `clear(): void` - очистка формы

#### 9. Класс `OrderView` (`view/OrderView.ts`)
**Назначение:** Представление формы заказа (доставка).

**Наследует:** `FormView<IDeliveryInfo>`

**Дополнительные поля:**
- `_card: HTMLButtonElement` - кнопка оплаты картой
- `_cash: HTMLButtonElement` - кнопка оплаты наличными
- `_address: HTMLInputElement` - поле ввода адреса

**Дополнительные методы:**
- `set payment(name: string)` - установка способа оплаты
- `set address(value: string)` - установка адреса
- `get payment(): PaymentMethod` - получение способа оплаты
- `get address(): string` - получение адреса

#### 10. Класс `ContactsView` (`view/ContactsView.ts`)
**Назначение:** Представление формы контактов.

**Наследует:** `FormView<IContactInfo>`

**Дополнительные поля:**
- `_phone: HTMLInputElement` - поле ввода телефона
- `_email: HTMLInputElement` - поле ввода email

**Дополнительные методы:**
- `set phone(value: string)` - установка телефона
- `set email(value: string)` - установка email
- `get phone(): string` - получение телефона
- `get email(): string` - получение email

#### 11. Класс `SuccessView` (`view/SuccessView.ts`)
**Назначение:** Представление экрана успешного заказа.

**Наследует:** `CommonView<ISuccessView>`

**Поля:**
- `description: HTMLParagraphElement` - элемент описания
- `button: HTMLButtonElement` - кнопка закрытия

**Методы:**
- `set total(value: number)` - установка общей суммы заказа

#### 12. Класс `Page` (`view/Page.ts`)
**Назначение:** Управление основными элементами страницы.

**Наследует:** `CommonView<IPageView>`

**Поля:**
- `_counter: HTMLSpanElement` - счетчик корзины
- `_basketButton: HTMLElement` - кнопка корзины
- `_catalog: HTMLElement` - контейнер каталога
- `_wrapper: HTMLDivElement` - обертка страницы

**Методы:**
- `set catalog(items: HTMLElement[])` - установка элементов каталога
- `set counter(value: string)` - установка счетчика корзины
- `lock(state: boolean): void` - блокировка/разблокировка страницы

### Вспомогательные утилиты (`utils/utils.ts`)

**Методы:**
- `ensureElement<T extends HTMLElement>(selector: string, context?: HTMLElement): T` - гарантированное получение DOM-элемента
- `cloneTemplate<T extends HTMLElement>(templateId: string): T` - клонирование HTML-шаблона

### Константы (`utils/constants.ts`)

**Поля:**
- `CDN_URL: string` - базовый URL для CDN изображений
- `API_URL: string` - базовый URL API

## Типы данных (`types/index.ts`)

### Базовые сущности
```typescript
interface IProduct {
  id: string
  title: string
  price: number
  description: string
  category: string
  image: string
}

interface IProductList {
  items: IProduct[]
}

type ProductId = Pick<IProduct, 'id'>

type ProductCard = Omit<IProduct, 'description'>

type ProductPreviewData = IProduct & {
  valid: boolean
  state: boolean
}

type BasketProductCard = Omit<IProduct, 'description' | 'category' | 'image'> & {
  index: number
}
```

### Данные форм
```typescript
interface IDeliveryInfo {
  payment: PaymentMethod
  address: string
}

interface IContactInfo {
  email: string
  phone: string
}

interface IOrderItems {
  total: number
  items: string[]
}

type IOrderRequest = IDeliveryInfo & IContactInfo & IOrderItems

interface IOrder extends IOrderRequest {
  readyОrder(): IOrderRequest
  setDelivery(delivery: IDeliveryInfo): void
  setContacts(contacts: IContactInfo): void
  setOrderItems(orderItems: IOrderItems): void
}

interface IOrderResponse {
  id: string
  total: number
}

type PaymentMethod = 'card' | 'cash'
```

### События приложения
```typescript
enum AppEvents {
  // Каталог и товары
  CATALOG_CHANGED = 'catalog:items-changed',
  PRODUCT_SELECT = 'card:select',
  
  // Корзина
  BASKET_OPEN = 'basket:open',
  BASKET_ADD_ITEM = 'basket:add',
  BASKET_REMOVE_ITEM = 'basket:remove',
  BASKET_CHANGED = 'basket:items-changed',
  
  // Оформление заказа
  ORDER_START = 'order:open',
  ORDER_DELIVERY_INPUT = 'order:input',
  ORDER_DELIVERY_SUBMIT = 'order:submit',
  ORDER_DELIVERY_CHANGED = 'order:delivery-changed',
  ORDER_CONTACTS_INPUT = 'contacts:input',
  ORDER_CONTACTS_SUBMIT = 'contacts:submit',
  ORDER_CONTACTS_CHANGED = 'order:contacts-changed',
  ORDER_ITEMS_CHANGED = 'order:items-changed',
  
  // Завершение заказа
  ORDER_SUCCESS_CLOSE = 'success:submit',
  
  // Модальные окна
  MODAL_OPEN = 'modal:open',
  MODAL_CLOSE = 'modal:close',
}
```

### Интерфейсы представлений
```typescript
interface IPageView {
  catalog: HTMLElement[]
  counter: number
}

interface IModalView {
  content: HTMLElement
}

interface IBasketView {
  list: HTMLElement[]
  valid: boolean
  price: number
}

interface IFormValidation {
  valid: boolean
}

interface IForm extends IFormValidation {
  render(data?: IFormValidation): HTMLElement
}

interface ISuccessView {
  total: number
}
```

### API интерфейсы
```typescript
interface IApiClient {
  fetchProducts(): Promise<IProduct[]>
  fetchProduct(id: string): Promise<IProduct>
  createOrder(order: IOrderRequest): Promise<IOrderResponse>
}

interface ApiListResponse<Type> {
  total: number
  items: Type[]
}

type ApiPostMethods = 'POST' | 'PUT' | 'DELETE'
```

## Взаимодействие компонентов

### Архитектура MVP

```
┌─────────────────┐    События    ┌──────────────────┐    Данные    ┌─────────────────┐
│                 │ ──────────────→│                  │ ────────────→│                 │
│  View Layer     │                │  Presenter       │              │  Model Layer    │
│  (Представления)│                │  (index.ts)      │              │  (Модели)       │
│                 │←─────────────── │                  │←─────────────│                 │
└─────────────────┘   DOM Updates  └──────────────────┘   События    └─────────────────┘
         ↑                                   ↓
         │                                   │
         └────────── DOM События ────────────┘
```

### Принципы взаимодействия

1. **Model слой** содержит только данные и бизнес-логику
2. **View слой** работает только с DOM-элементами и пользовательским интерфейсом
3. **Presenter** (index.ts) координирует взаимодействие через EventEmitter
4. Все слои взаимодействуют только через события (слабая связанность)
5. Модели генерируют события при изменении данных
6. Представления генерируют события при пользовательских действиях

### Последовательность работы

1. **Инициализация:**
   - Presenter создает `EventEmitter`, `ApiClient`, все модели и представления
   - Загружает товары через `ApiClient.fetchProducts()`
   - Сохраняет данные в `CatalogModel`
   - Генерирует событие `AppEvents.CATALOG_CHANGED`
   - Обновляет каталог на странице

2. **Выбор товара:**
   - Пользователь кликает на карточку товара
   - `CatalogView` генерирует событие `AppEvents.PRODUCT_SELECT`
   - Presenter обрабатывает событие, получает данные товара из `CatalogModel`
   - Открывает модальное окно с `ProductView`

3. **Добавление в корзину:**
   - Пользователь кликает "В корзину" в `ProductView`
   - Генерируется событие `AppEvents.BASKET_ADD_ITEM`
   - Presenter вызывает `BasketModel.add()`
   - `BasketModel` обновляет состояние и генерирует `AppEvents.BASKET_CHANGED`
   - Обновляется счетчик корзины на странице

4. **Оформление заказа:**
   - Пользователь открывает корзину (`AppEvents.BASKET_OPEN`)
   - Заполняет `OrderView` (данные доставки)
   - Заполняет `ContactsView` (контактные данные)
   - Формы валидируют данные и генерируют события
   - Presenter собирает данные через `OrderModel`
   - Отправляет заказ через `ApiClient.createOrder()`
   - Показывает `SuccessView` с результатом

## Принципы разработки

### Соблюденные принципы SOLID
- **Single Responsibility:** Каждый класс имеет одну четкую ответственность
- **Open/Closed:** Компоненты открыты для расширения, закрыты для модификации  
- **Liskov Substitution:** Наследуемые классы могут заменять базовые
- **Interface Segregation:** Интерфейсы разделены по функциональности
- **Dependency Inversion:** Высокоуровневые модули не зависят от низкоуровневых

### Архитектурные принципы MVP
- **Разделение ответственности:** Model, View, Presenter имеют четкие границы
- **Слабая связанность:** Взаимодействие только через события
- **Отсутствие DOM в моделях:** Модели работают только с данными
- **Отсутствие бизнес-логики в представлениях:** View только отображает данные

### Паттерны проектирования
- **MVP:** Основной архитектурный паттерн проекта
- **Observer:** Реализован через `EventEmitter` для событийной архитектуры
- **Template Method:** Базовые классы определяют общую структуру
- **Strategy:** Различные представления для разных контекстов

### Преимущества архитектуры
- **Тестируемость:** Каждый слой можно тестировать независимо
- **Масштабируемость:** Легко добавлять новые компоненты
- **Поддерживаемость:** Изменения в одном слое не влияют на другие
- **Переиспользуемость:** Компоненты можно использовать в других проектах
- **Читаемость:** Четкая структура и разделение ответственности

---

**Технический стек:** TypeScript, Webpack 5, SCSS, ESLint, Prettier  
**Архитектура:** MVP (Model-View-Presenter) + Event-Driven Architecture  
**Подход:** Слоевая архитектура со строгим разделением ответственности
**Размещение в сети:** [GitHub Repository](https://github.com/AntonZhuravskiy/web-larek-frontend.git)