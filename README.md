
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
├── common.blocks/     # SCSS-блоки по методологии БЭМ
├── components/
│   └── base/         # Базовые компоненты (API, EventEmitter)
├── model/            # Модели данных (Model слой)
├── view/             # Представления (View слой)
├── pages/            # HTML-страницы с шаблонами
├── scss/             # Глобальные стили
├── types/            # TypeScript типы и интерфейсы
├── utils/            # Вспомогательные утилиты
├── vendor/           # Сторонние ресурсы
└── index.ts          # Presenter слой (главная логика приложения)
```

### Базовый код

#### 1. Класс `Api` (`components/base/api.ts`)
**Назначение:** Универсальный HTTP-клиент для взаимодействия с backend API.
**Программный интерфейс:**
```typescript
class Api {
  constructor(baseUrl: string, options?: RequestInit)
  get<T>(uri: string): Promise<T>
  post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>
  protected handleResponse<T>(response: Response): Promise<T>
}
```

#### 2. Класс `EventEmitter` (`components/base/events.ts`)
**Назначение:** Реализация паттерна Наблюдатель для управления событиями.
**Программный интерфейс:**
```typescript
interface IEvents {
  on<T extends object>(event: EventName, callback: (data: T) => void): void
  emit<T extends object>(event: string, data?: T): void
  off(eventName: EventName, callback: Subscriber): void
}
```

### Слой модели (Model Layer)

Модели содержат только логику работы с данными, без операций с DOM.

#### 1. Класс `ProductModel` (`model/ProductModel.ts`)
**Назначение:** Управление данными продуктов.
**Программный интерфейс:**
```typescript
class ProductModel {
  setProducts(products: IProduct[]): void
  getProducts(): IProduct[]
  getProduct(id: string): IProduct | undefined
  getAvailableProducts(): IProduct[]
  isEmpty(): boolean
}
```

#### 2. Класс `BasketModel` (`model/BasketModel.ts`)
**Назначение:** Управление состоянием корзины покупок.
**Программный интерфейс:**
```typescript
class BasketModel {
  addProduct(product: IProduct): void
  removeProduct(productId: string): void
  clear(): void
  getState(): BasketState
  isEmpty(): boolean
  isProductInBasket(productId: string): boolean
}
```

#### 3. Класс `OrderModel` (`model/OrderModel.ts`)
**Назначение:** Управление данными заказа.
**Программный интерфейс:**
```typescript
class OrderModel {
  updateOrderData(data: Partial<IOrderForm>): void
  getOrderData(): Partial<IOrderForm>
  clear(): void
  isComplete(): boolean
  createOrder(items: string[], total: number): IOrder
}
```

### Слой представления (View Layer)

Представления работают только с DOM-элементами и их отображением.

#### 1. Класс `CardView` / `CardPreviewView` (`view/CardView.ts`)
**Назначение:** Отображение карточек товаров в галерее и модальных окнах.
**Программный интерфейс:**
```typescript
class CardView {
  constructor(container: HTMLElement, actions?: ICardActions)
  render(data: Partial<IProduct>): HTMLElement
  // Setters: title, price, image, category, buttonText
}

class CardPreviewView extends CardView {
  setInBasketState(): void
  setNotInBasketState(): void  
  setUnavailableState(): void
}
```

#### 2. Класс `BasketView` (`view/BasketView.ts`)
**Назначение:** Отображение корзины покупок.
**Программный интерфейс:**
```typescript
class BasketView {
  constructor(container: HTMLElement, events: IEvents)
  render(data: { items: IBasketItem[], total: number }): HTMLElement
}
```

#### 3. Класс `ModalView` (`view/ModalView.ts`)
**Назначение:** Управление модальными окнами.
**Программный интерфейс:**
```typescript
class ModalView {
  constructor(selector: string)
  open(): void
  close(): void
  render(data: IModalData): HTMLElement
}
```

#### 4. Класс `GalleryView` (`view/GalleryView.ts`)
**Назначение:** Отображение галереи товаров.
**Программный интерфейс:**
```typescript
class GalleryView {
  constructor(selector: string)
  render(products: IProduct[], renderCard: (product: IProduct) => HTMLElement): void
  clear(): void
}
```

#### 5. Классы форм (`view/OrderView.ts`, `view/ContactsView.ts`)
**Назначение:** Отображение и валидация форм заказа.
**Программный интерфейс:**
```typescript
class OrderFormView {
  constructor(container: HTMLElement, events: IEvents)
  render(): HTMLElement
  reset(): void
}

class ContactsFormView {
  constructor(container: HTMLElement, events: IEvents)  
  render(): HTMLElement
  reset(): void
}
```

#### 6. Класс `SuccessView` (`view/SuccessView.ts`)
**Назначение:** Отображение экрана успешного заказа.
**Программный интерфейс:**
```typescript
class SuccessView {
  constructor(container: HTMLElement, events: IEvents)
  render(data: { total: number }): HTMLElement
}
```

### Слой Presenter

Presenter реализован в `src/index.ts` и содержит всю логику приложения:

- Создание экземпляров моделей и представлений
- Настройка EventEmitter как шины событий  
- Обработка пользовательских действий через события
- Взаимодействие с API
- Координация работы между Model и View слоями

**Основные функции:**
```typescript
// Инициализация приложения
async function init(): Promise<void>

// Загрузка продуктов через API
async function loadProducts(): Promise<void>

// Настройка обработчиков событий
function setupEventListeners(): void

// Отрисовка продуктов в галерее
function renderProducts(products: IProduct[]): void

// Открытие модальных окон
function openProductModal(product: IProduct): void
function openBasketModal(): void
function openOrderModal(): void

// Отправка заказа
async function submitOrder(): Promise<void>
```

### Вспомогательные утилиты (`utils/utils.ts`)
```typescript
function ensureElement<T extends HTMLElement>(selector: string, context?: HTMLElement): T
function cloneTemplate<T extends HTMLElement>(templateId: string): T
```

## Типы данных

Основные типы определены в `src/types/index.ts`:

### Базовые сущности
```typescript
interface IProduct {
  id: string
  title: string
  price: number | null  // null = "Бесценно"
  category: string
  image: string
}

interface IBasketItem {
  product: IProduct
  quantity: number
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
```

### События приложения
```typescript
enum AppEvents {
  PRODUCTS_LOADED = 'products:loaded',
  BASKET_UPDATED = 'basket:updated',
  ORDER_CREATED = 'order:created',
  CARD_ADD = 'card:add',
  CARD_REMOVE = 'card:remove'
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



Размещение в сети  : https://github.com/AntonZhuravskiy/web-larek-frontend.git