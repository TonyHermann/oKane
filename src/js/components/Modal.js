export const Modal = class {
  
    constructor(title, content, eventHandlers = {}) {
        this.title = title;
        this.content = content;
        this.modal = null;
        this.overlay = null;
        this.id = `modal-${Date.now()}`;
        this.eventHandlers = eventHandlers;
    }

    create() {

        this.overlay = document.createElement("div");
        this.overlay.classList.add("modal-overlay");
        $("html").appendChild(this.overlay);

        const modalXP = `
        <div class="title-bar">
          <div class="title-bar-text">${this.title}</div>
          <div class="title-bar-controls">
            <button aria-label="Minimize"></button>
            <button aria-label="Maximize"></button>
            <button aria-label="Close" class='closeBtnXP'></button>
          </div>
        </div>
        <div class="window-body">
          ${this.content}
        </div>
        `;

        this.modal = document.createElement("div");
        this.modal.classList.add('modal', 'window');
        this.modal.id = this.id;
        this.modal.innerHTML = modalXP;
        
        $("html").appendChild(this.modal);
        
        this.modal.querySelector(".closeBtnXP").addEventListener("click", () => {
            this.close();
        });

        this.addEventListeners();
    };

    addEventListeners() {
      for (let event in this.eventHandlers) {
          const element = this.modal.querySelector(`#${event}`);
          if (element) {
              element.addEventListener("click", this.eventHandlers[event]);
          }
      }
    }

    close() {
        if (this.modal) {
            this.modal.remove(); // Eliminar el modal del DOM
        }
        if (this.overlay) {
          this.overlay.remove();
        }
    };

}
