# WebLarek - Интернет-магазин цифровых товаров

## Описание проекта

WebLarek - это одностраничное приложение (SPA) интернет-магазина, реализованное на TypeScript. Проект построен по архитектурному паттерну **MVP (Model-View-Presenter)** с использованием событийно-ориентированной архитектуры для обеспечения слабой связанности компонентов.

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
│   └── base/         # Базовые компоненты (API, EventEmitter)
├── model/            # Модели данных (Model слой)
├── view/             # Представления (View слой)
├── types/            # TypeScript типы и интерфейсы
├── utils/            # Вспомогательные утилиты
└── index.ts          # Presenter слой (главная логика приложения)
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

#### 2. Класс `EventEmitter` (`components/base/events.ts`)
**Назначение:** Реализация паттерна Наблюдатель для управления событиями.

**Поля:**
- `_events: Map<EventName, Set<Subscriber>>` - карта событий и подписчиков

**Методы:**
- `on<T>(event: EventName, callback: (data: T) => void): void` - подписка на событие
- `off(eventName: EventName, callback: Subscriber): void` - отписка от события
- `emit<T>(eventName: string, data?: T): void` - генерация события
- `onAll(callback: (event: EmitterEvent) => void): void` - подписка на все события
- `offAll(): void` - отписка от всех событий
- `trigger<T>(eventName: string, context?: Partial<T>): Function` - создание триггера события

### Слой модели (Model Layer)

#### 1. Класс `ProductModel` (`model/ProductModel.ts`)
**Назначение:** Управление данными продуктов.

**Поля:**
- `products: IProduct[]` - массив товаров

**Методы:**
- `setProducts(products: IProduct[]): void` - установка списка товаров
- `getProducts(): IProduct[]` - получение всех товаров
- `getProduct(id: string): IProduct | undefined` - получение товара по ID
- `getAvailableProducts(): IProduct[]` - получение доступных товаров (с ценой)
- `isEmpty(): boolean` - проверка пустоты списка товаров

#### 2. Класс `BasketModel` (`model/BasketModel.ts`)
**Назначение:** Управление состоянием корзины покупок.

**Поля:**
- `items: IBasketItem[]` - массив элементов корзины

**Методы:**
- `addProduct(product: IProduct): void` - добавление товара в корзину
- `removeProduct(productId: string): void` - удаление товара из корзины
- `clear(): void` - очистка корзины
- `getTotal(): number` - расчет общей суммы
- `getItems(): IBasketItem[]` - получение элементов корзины
- `getCount(): number` - получение количества товаров
- `getState(): BasketState` - получение полного состояния корзины
- `isEmpty(): boolean` - проверка пустоты корзины
- `isProductInBasket(productId: string): boolean` - проверка наличия товара в корзине

#### 3. Класс `OrderModel` (`model/OrderModel.ts`)
**Назначение:** Управление данными заказа и валидация форм.

**Поля:**
- `orderData: Partial<IOrderForm>` - данные формы заказа
- `_errors: FormErrors` - ошибки валидации

**Методы:**
- `constructor(events: IEvents)` - инициализация с подпиской на события
- `updateOrderData(data: { field: keyof IOrderForm, value: string }): void` - обновление данных заказа
- `updateContactsData(data: { field: keyof IOrderForm, value: string }): void` - обновление данных контактов
- `validateOrderForm(): void` - валидация формы заказа
- `validateContactsForm(): void` - валидация формы контактов
- `validateOrder(): void` - принудительная валидация заказа
- `validateContacts(): void` - принудительная валидация контактов
- `getOrderData(): Partial<IOrderForm>` - получение данных заказа
- `getErrors(): FormErrors` - получение ошибок валидации
- `isOrderValid(): boolean` - проверка валидности заказа
- `isContactsValid(): boolean` - проверка валидности контактов
- `isComplete(): boolean` - проверка полноты всех данных
- `clear(): void` - очистка данных заказа
- `createOrder(items: string[], total: number): IOrder` - создание объекта заказа

### Слой представления (View Layer)

#### 1. Класс `CardView` (`view/CardView.ts`)
**Назначение:** Базовое представление карточки товара.

**Поля:**
- `_container: HTMLElement` - DOM-контейнер карточки
- `_title: HTMLElement` - элемент заголовка
- `_price: HTMLElement` - элемент цены
- `_image: HTMLImageElement` - элемент изображения
- `_category: HTMLElement` - элемент категории
- `_button: HTMLButtonElement | null` - кнопка действия

**Методы:**
- `constructor(container: HTMLElement, actions?: ICardActions)` - инициализация карточки
- `onClick(handler: () => void): void` - установка обработчика клика
- `render(data: Partial<IProduct>): HTMLElement` - отрисовка карточки
- Сеттеры для установки свойств: `title`, `price`, `image`, `category`, `buttonText`

#### 2. Класс `CardPreviewView` (`view/CardView.ts`)
**Назначение:** Расширенное представление карточки для превью.

**Наследует:** `CardView`

**Дополнительные поля:**
- `_description: HTMLElement` - элемент описания товара

**Дополнительные методы:**
- `setInBasketState(): void` - установка состояния "в корзине"
- `setNotInBasketState(): void` - установка состояния "не в корзине"
- `setUnavailableState(): void` - установка состояния "недоступно"

#### 3. Класс `BasketView` (`view/BasketView.ts`)
**Назначение:** Представление корзины покупок.

**Поля:**
- `_container: HTMLElement` - DOM-контейнер корзины
- `_list: HTMLElement` - список элементов корзины
- `_total: HTMLElement` - элемент общей суммы
- `_button: HTMLButtonElement` - кнопка оформления заказа

**Методы:**
- `constructor(container: HTMLElement, events: IEvents)` - инициализация корзины
- `update(data: { items: HTMLElement[], total: number }): void` - обновление данных корзины
- `set items(items: IBasketItem[])` - установка элементов корзины
- `set total(value: number)` - установка общей суммы
- `render(data: { items: IBasketItem[], total: number }): HTMLElement` - отрисовка корзины
- `get container(): HTMLElement` - получение контейнера

#### 4. Класс `BasketItemView` (`view/BasketView.ts`)
**Назначение:** Представление элемента корзины.

**Поля:**
- `_container: HTMLElement` - DOM-контейнер элемента
- `_index: HTMLElement` - элемент индекса
- `_title: HTMLElement` - элемент названия товара
- `_price: HTMLElement` - элемента цены
- `_button: HTMLButtonElement` - кнопка удаления

**Методы:**
- `constructor(container: HTMLElement, actions?: { onClick: () => void })` - инициализация
- `render(item: IBasketItem, index: number): HTMLElement` - отрисовка элемента
- Сеттеры: `index`, `title`, `price`

#### 5. Класс `ModalView` (`view/ModalView.ts`)
**Назначение:** Управление модальными окнами.

**Поля:**
- `_modal: HTMLElement` - DOM-элемент модального окна
- `_content: HTMLElement` - элемент содержимого
- `_closeButton: HTMLElement` - кнопка закрытия

**Методы:**
- `constructor(selector: string)` - инициализация по селектору
- `set content(value: HTMLElement)` - установка содержимого
- `open(): void` - открытие модального окна
- `close(): void` - закрытие модального окна
- `render(data: IModalData): HTMLElement` - отрисовка модального окна

#### 6. Класс `GalleryView` (`view/GalleryView.ts`)
**Назначение:** Представление галереи товаров.

**Поля:**
- `_container: HTMLElement` - DOM-контейнер галереи

**Методы:**
- `constructor(selector: string)` - инициализация по селектору
- `clear(): void` - очистка галереи
- `addCard(cardElement: HTMLElement): void` - добавление карточки
- `render(products: IProduct[], renderCard: (product: IProduct) => HTMLElement): void` - отрисовка галереи

#### 7. Класс `OrderFormView` (`view/OrderView.ts`)
**Назначение:** Представление формы заказа.

**Поля:**
- `_container: HTMLElement` - DOM-контейнер формы
- `_paymentButtons: HTMLButtonElement[]` - кнопки выбора оплаты
- `_addressInput: HTMLInputElement` - поле ввода адреса
- `_submitButton: HTMLButtonElement` - кнопка отправки
- `_errorsElement: HTMLElement` - элемент отображения ошибок
- `_form: HTMLFormElement` - элемент формы

**Методы:**
- `constructor(container: HTMLElement, events: IEvents)` - инициализация формы
- `updateErrors(errors: Record<string, string>): void` - обновление ошибок валидации
- `setAddress(value: string): void` - установка значения адреса
- `setPayment(value: 'online' | 'cash'): void` - установка способа оплаты
- `render(): HTMLElement` - отрисовка формы
- `reset(): void` - сброс формы
- `get container(): HTMLElement` - получение контейнера

#### 8. Класс `ContactsFormView` (`view/ContactsView.ts`)
**Назначение:** Представление формы контактов.

**Поля:**
- `_container: HTMLElement` - DOM-контейнер формы
- `_emailInput: HTMLInputElement` - поле ввода email
- `_phoneInput: HTMLInputElement` - поле ввода телефона
- `_submitButton: HTMLButtonElement` - кнопка отправки
- `_errorsElement: HTMLElement` - элемент отображения ошибок
- `_form: HTMLFormElement` - элемент формы

**Методы:**
- `constructor(container: HTMLElement, events: IEvents)` - инициализация формы
- `updateErrors(errors: Record<string, string>): void` - обновление ошибок валидации
- `setEmail(value: string): void` - установка значения email
- `setPhone(value: string): void` - установка значения телефона
- `render(): HTMLElement` - отрисовка формы
- `reset(): void` - сброс формы
- `get container(): HTMLElement` - получение контейнера

#### 9. Класс `SuccessView` (`view/SuccessView.ts`)
**Назначение:** Представление экрана успешного заказа.

**Поля:**
- `_container: HTMLElement` - DOM-контейнер
- `_description: HTMLElement` - элемент описания
- `_closeButton: HTMLButtonElement` - кнопка закрытия

**Методы:**
- `constructor(container: HTMLElement, events: IEvents)` - инициализация
- `set total(value: number)` - установка общей суммы
- `render(data: { total: number }): HTMLElement` - отрисовка экрана успеха

#### 10. Класс `Page` (`view/Page.ts`)
**Назначение:** Управление основными элементами страницы.

**Поля:**
- `basketCounter: HTMLElement` - счетчик корзины
- `basketButton: HTMLElement` - кнопка корзины

**Методы:**
- `constructor()` - инициализация элементов страницы
- `updateBasketCounter(count: number): void` - обновление счетчика корзины

### Вспомогательные утилиты (`utils/utils.ts`)

**Методы:**
- `ensureElement<T extends HTMLElement>(selector: string, context?: HTMLElement): T` - гарантированное получение DOM-элемента
- `cloneTemplate<T extends HTMLElement>(templateId: string): T` - клонирование HTML-шаблона

### Константы (`utils/constants.ts`)

**Поля:**
- `CDN_URL: string` - базовый URL для CDN изображений

## Типы данных (`types/index.ts`)

### Базовые сущности
```typescript
interface IProduct {
  id: string
  title: string
  price: number | null  // null = "Бесценно"
  description?: string
  category: string
  image: string
}

interface IBasketItem {
  product: IProduct
  quantity: number
}

interface BasketState {
  items: IBasketItem[]
  total: number
  count: number
}
```

### Данные форм
```typescript
interface IOrderForm {
  payment: 'online' | 'cash'
  address: string
  email: string
  phone: string
}

interface IOrder extends IOrderForm {
  items: string[]  // Array of product IDs
  total: number
}

type FormErrors = Partial<Record<keyof IOrderForm, string>>
```

### События приложения
```typescript
enum AppEvents {
  PRODUCTS_LOADED = 'products:loaded',
  BASKET_UPDATED = 'basket:updated',
  ORDER_CREATED = 'order:created',
  MODAL_OPEN = 'modal:open',
  MODAL_CLOSE = 'modal:close',
  CARD_SELECT = 'card:select',
  CARD_ADD = 'card:add',
  CARD_REMOVE = 'card:remove'
}

interface CardAddEvent {
  product: IProduct
}

interface CardRemoveEvent {
  productId: string
}

interface BasketUpdatedEvent {
  items: IBasketItem[]
  total: number
  count: number
}
```

### Интерфейсы компонентов
```typescript
interface ICardActions {
  onClick: (event: MouseEvent) => void
}

interface IBasketView {
  items: HTMLElement[]
  total: number
}

interface IModalData {
  content: HTMLElement
}
```

### Ответы API
```typescript
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

1. **Model слой** содержит только данные и логику их обработки
2. **View слой** работает только с DOM-элементами
3. **Presenter** координирует взаимодействие через EventEmitter
4. Все слои взаимодействуют только через события (слабая связанность)

### Последовательность работы

1. **Инициализация:**
   - Presenter создает `EventEmitter`, `Api`, все модели
   - Загружает товары через `Api.get()`
   - Сохраняет данные в `ProductModel`
   - Генерирует событие `AppEvents.PRODUCTS_LOADED`

2. **Добавление в корзину:**
   - Пользователь кликает на карточку товара
   - `CardView` генерирует событие `AppEvents.CARD_ADD`
   - Presenter обрабатывает событие, вызывает `BasketModel.addProduct()`
   - `BasketModel` обновляет состояние
   - Presenter генерирует `basket:updated` 
   - Все подписчики обновляют UI

3. **Оформление заказа:**
   - Пользователь заполняет `OrderFormView` и `ContactsFormView`
   - Формы валидируют данные и генерируют события
   - Presenter собирает данные через `OrderModel`
   - Отправляет заказ через `Api.post()`
   - Показывает `SuccessView`

## Принципы разработки

### Соблюденные принципы SOLID
- **Single Responsibility:** Каждый класс имеет одну четкую ответственность
- **Open/Closed:** Компоненты открыты для расширения, закрыты для модификации  
- **Dependency Inversion:** Высокоуровневые модули не зависят от низкоуровневых

### Архитектурные принципы MVP
- **Разделение ответственности:** Model, View, Presenter имеют четкие границы
- **Слабая связанность:** Взаимодействие только через события
- **Отсутствие DOM в моделях:** Модели работают только с данными
- **Отсутствие бизнес-логики в представлениях:** View только отображает данные

### Паттерны проектирования
- **MVP:** Основной архитектурный паттерн проекта
- **Observer:** Реализован через `EventEmitter` для событийной архитектуры
- **Template Method:** Базовые компоненты определяют структуру

### Преимущества архитектуры
- **Тестируемость:** Каждый слой можно тестировать независимо
- **Масштабируемость:** Легко добавлять новые компоненты
- **Поддерживаемость:** Изменения в одном слое не влияют на другие
- **Переиспользуемость:** Компоненты можно использовать в других проектах

---

**Технический стек:** TypeScript, Webpack 5, SCSS, ESLint, Prettier  
**Архитектура:** MVP (Model-View-Presenter) + Event-Driven Architecture  
**Подход:** Слоевая архитектура со строгим разделением ответственности

**Размещение в сети:** [GitHub Repository](https://github.com/AntonZhuravskiy/web-larek-frontend.git)