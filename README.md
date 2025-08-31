
# WebLarek - Интернет-магазин цифровых товаров

## Описание проекта

WebLarek - это одностраничное приложение (SPA) интернет-магазина, реализованное на TypeScript. Проект демонстрирует современный подход к разработке фронтенд-приложений с использованием компонентной архитектуры, строгой типизации и паттерна Наблюдатель для управления состоянием.

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
│   └── base/         # Базовые компоненты приложения
├── pages/            # HTML-страницы
├── scss/             # Глобальные стили
├── types/            # TypeScript типы и интерфейсы
├── utils/            # Вспомогательные утилиты
└── vendor/           # Сторонние ресурсы
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

### Модель данных (Model Layer)

#### 1. Класс `BasketModel` (`components/base/basketModel.ts`)
**Назначение:** Управление состоянием корзины покупок.
**Программный интерфейс:**
```typescript
class BasketModel {
  constructor(events: EventEmitter)
  addProduct(product: IProduct): void
  removeProduct(productId: string): void
  clear(): void
  getState(): BasketState
  isEmpty(): boolean
}
```

#### 2. Класс `App` (`components/base/app.ts`) - Presenter
**Назначение:** Главный координатор приложения, связывает Model и View слои.
**Программный интерфейс:**
```typescript
class App {
  constructor()
  getProducts(): IProduct[]
  getBasketState(): BasketState
  getEventEmitter(): EventEmitter
}
```

### Представление (View Layer)

#### 1. Класс `Card` / `CardPreview` (`components/base/card.ts`)
**Назначение:** Отображение карточек товаров.
**Программный интерфейс:**
```typescript
class Card {
  constructor(container: HTMLElement, actions?: ICardActions)
  render(data: Partial<IProduct>): HTMLElement
  // Setters для свойств карточки
}
```

#### 2. Класс `Basket` (`components/base/basket.ts`)
**Назначение:** Отображение корзины покупок.
**Программный интерфейс:**
```typescript
class Basket {
  constructor(container: HTMLElement, events?: EventEmitter)
  render(data: { items: IBasketItem[], total: number }): HTMLElement
}
```

#### 3. Класс `Modal` (`components/base/modal.ts`)
**Назначение:** Управление модальными окнами.
**Программный интерфейс:**
```typescript
class Modal {
  constructor(selector: string, events?: EventEmitter)
  open(): void
  close(): void
  set content(value: HTMLElement)
}
```

#### 4. Классы форм (`components/base/order.ts`, `components/base/contacts.ts`)
**Назначение:** Валидация и обработка форм заказа.

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

### Схема взаимодействия

```
[View Components] → [Events] → [App (Presenter)] → [BasketModel] → [Events] → [View Components]
       ↑                     ↓                     ↓                     ↓
       └──[DOM Events]───[EventEmitter]←─[API Calls]←─[Api Client]←──────┘
```

### Последовательность работы

1. **Инициализация:**
   - `App` создает `EventEmitter`, `Api`, `BasketModel`
   - Загружает товары через `Api.get()`
   - Генерирует событие `AppEvents.PRODUCTS_LOADED`

2. **Добавление в корзину:**
   - Пользователь кликает на карточку товара
   - `Card` генерирует событие `AppEvents.CARD_ADD`
   - `App` обрабатывает событие, вызывает `BasketModel.addProduct()`
   - `BasketModel` обновляет состояние, генерирует `AppEvents.BASKET_UPDATED`
   - Все подписчики (header, модальное окно) обновляют UI

3. **Оформление заказа:**
   - Пользователь заполняет формы `OrderForm` и `ContactsForm`
   - Формы валидируют данные и генерируют события
   - `App` собирает данные, создает объект заказа
   - Отправляет заказ через `Api.post()`
   - Показывает экран успеха

## Принципы разработки

### Соблюденные принципы SOLID
- **Single Responsibility:** Каждый класс имеет одну четкую ответственность
- **Open/Closed:** Компоненты открыты для расширения, закрыты для модификации
- **Dependency Inversion:** Высокоуровневые модули не зависят от низкоуровневых

### Паттерны проектирования
- **Observer:** Реализован через `EventEmitter` для слабой связности компонентов
- **Template Method:** Базовые компоненты определяют структуру, наследники реализуют специфику
- **Facade:** `App` класс предоставляет простой интерфейс к сложной системе

### Слабая связность
Компоненты взаимодействуют исключительно через события, что обеспечивает:
- Легкую тестируемость
- Простое расширение функциональности
- Возможность замены компонентов без изменения кода

---

**Технический стек:** TypeScript, Webpack 5, SCSS, ESLint, Prettier
**Архитектура:** MVP + Event-Driven
**Подход:** Компонентно-ориентированная разработка со строгой типизацией



Размещение в сети  : https://github.com/AntonZhuravskiy/web-larek-frontend.git