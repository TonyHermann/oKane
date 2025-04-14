

class Modal {
    constructor(title, content) {
        this.title = title;
        this.content = content;
        this.modal = null;
    }

    

    create() {
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
          <p>${this.content}</p>
        </div>
        `
        this.modal = document.createElement("div")
        this.modal.classList.add('modal', 'window')
        this.modal.innerHTML = modalXP
        $("html").appendChild(this.modal)
        this.modal.querySelector(".closeBtnXP").addEventListener("click", () => {
            this.close()
        })
    }

    close() {
        if (this.modal) {
            this.modal.remove(); // Eliminar el modal del DOM
        }
    }

}


$("#addTransaction").addEventListener("click", () => {
  let añadirMovimientosModal = new Modal ("Añadir movimientos", "Aquí, podrás añadir tus mivimientos.");
  añadirMovimientosModal.create()
})