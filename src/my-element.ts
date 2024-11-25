import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

interface TodoItem {
  title: string;
  completed: boolean;
  id: string;
}

@customElement("my-element")
export class MyElement extends LitElement {
  @property({ type: Array })
  private _list: TodoItem[] = JSON.parse(
    localStorage.getItem("todo-list") || "[]"
  ).map((item: Omit<TodoItem, "id">) => ({
    ...item,
    id: crypto.randomUUID(),
  }));

  @query("#todoInput")
  private _todoInput!: HTMLInputElement;

  private debounce(func: Function, wait: number) {
    let timeout: number | undefined;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
  }

  render() {
    const sortedList = [...this._list].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });

    return html`
      <div class="todo-container">
        <h1>My Todo List</h1>
        <div class="todo-input">
          <input type="text" id="todoInput" placeholder="Add a new task..." />
          <button @click=${this._handleAddTodo}>Add</button>
        </div>

        <h2>Tasks</h2>
        <ul class="todo-list">
          ${sortedList.map((item) => {
            return html`
              <li>
                <input
                  type="checkbox"
                  ?checked=${item.completed}
                  @change=${() => this.debouncedCheckTodo(item.id)}
                  key=${item.id}
                  ?completed=${item.completed}
                  class="checkbox-input"
                />
                <span class="${item.completed ? "completed" : ""}"
                  >${item.title}</span
                >
                <button
                  class="delete-btn"
                  @click=${() => this._handleDeleteTodo(item.id)}
                >
                  ×
                </button>
              </li>
            `;
          })}
        </ul>
      </div>
    `;
  }

  private debouncedCheckTodo = this.debounce((id: string) => {
    this._handleCheckedTodo(id);
  }, 300);

  private _handleCheckedTodo(id: string) {
    const newList = this._list.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          completed: !item.completed,
        };
      }
      return item;
    });

    this._list = newList;
    localStorage.setItem("todo-list", JSON.stringify(this._list));
  }

  private _handleAddTodo() {
    const value = this._todoInput.value;
    if (!value) return;

    this._list = [
      ...this._list,
      {
        title: value,
        completed: false,
        id: crypto.randomUUID(),
      },
    ];
    localStorage.setItem("todo-list", JSON.stringify(this._list));
    this._todoInput.value = "";
  }

  private _handleDeleteTodo(id: string) {
    this._list = this._list.filter((item) => item.id !== id);
    localStorage.setItem("todo-list", JSON.stringify(this._list));
  }

  static styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 2rem;
      font-family: "Inter", system-ui, sans-serif;
    }

    .todo-container {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      padding: 2.5rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: container-enter 0.6s ease-out;
    }

    @keyframes container-enter {
      0% {
        opacity: 0;
        transform: translateY(20px) scale(0.96);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .todo-container:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    }

    h1 {
      color: #1a202c;
      text-align: center;
      margin-bottom: 2.5rem;
      font-size: 3rem;
      font-weight: 700;
      letter-spacing: -0.5px;
      animation: title-enter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes title-enter {
      0% {
        opacity: 0;
        transform: translateY(-20px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    h2 {
      color: #2d3748;
      font-size: 1.5rem;
      margin: 2rem 0 1rem;
      font-weight: 600;
    }

    .todo-input {
      display: flex;
      gap: 1rem;
      margin-bottom: 2.5rem;
      animation: input-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s
        backwards;
    }

    @keyframes input-enter {
      0% {
        opacity: 0;
        transform: translateX(-20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    input[type="text"] {
      flex: 1;
      padding: 1rem 1.2rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: #1a202c;
      background-color: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #646cff;
      box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.2);
      transform: scale(1.02);
    }

    input[type="text"]::placeholder {
      color: #a0aec0;
    }

    button {
      background: #646cff;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 1rem 1.8rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(100, 108, 255, 0.2);
    }

    button:hover {
      background: #535bf2;
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 16px rgba(100, 108, 255, 0.3);
    }

    button:active {
      transform: scale(0.95);
    }

    .todo-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      display: flex;
      align-items: center;
      padding: 1.2rem;
      border-bottom: 1px solid #edf2f7;
      gap: 1.2rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: list-item-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)
        backwards;
      animation-delay: calc(var(--index, 0) * 100ms);
    }

    @keyframes list-item-enter {
      0% {
        opacity: 0;
        transform: translateX(-20px) scale(0.8);
      }
      100% {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    li:hover {
      background-color: #f7fafc;
      transform: translateX(4px) scale(1.01);
    }

    li:last-child {
      border-bottom: none;
    }

    input[type="checkbox"] {
      width: 1.4rem;
      height: 1.4rem;
      border: 2px solid #646cff;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    input[type="checkbox"]:checked {
      background-color: #646cff;
      border-color: #646cff;
      animation: checkbox-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes checkbox-pop {
      0% {
        transform: scale(1) rotate(0deg);
      }
      50% {
        transform: scale(1.3) rotate(10deg);
      }
      100% {
        transform: scale(1) rotate(0deg);
      }
    }

    span {
      flex: 1;
      color: #2d3748;
      font-size: 1.1rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .completed {
      color: #a0aec0;
      text-decoration: line-through;
      transform: scale(0.98);
      opacity: 0.8;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .delete-btn {
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 8px;
      width: 2.2rem;
      height: 2.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      padding: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .delete-btn:hover {
      background: #dc2626;
      transform: rotate(90deg) scale(1.1);
    }

    .delete-btn:active {
      transform: scale(0.9);
    }

    @media (max-width: 640px) {
      :host {
        padding: 1rem;
      }

      .todo-container {
        padding: 1.5rem;
      }

      h1 {
        font-size: 2rem;
      }

      .todo-input {
        flex-direction: column;
      }

      button {
        width: 100%;
      }
    }
  `;
}
