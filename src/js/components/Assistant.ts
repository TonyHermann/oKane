interface IAssisant {
  img: string;
  name: string;
  data: [];
  id: number;
}

export class Assistant implements IAssisant {
  img: string;
  name: string;
  data: [];
  id: number;
  private static instance: Assistant;

  constructor(img: string, name: string, data: [], id: number) {
    this.img = img;
    this.name = name;
    this.data = data;
    this.id = id;

    if (typeof Assistant.instance === "object") {
      return Assistant.instance;
    }

    Assistant.instance = this;
    return this;
  }

  greet() {
    this.say(`Hola! Soy ${this.name}, tu asistente.`);
  }

  say(text: string) {
    let char = document.querySelector(`#assistant_${this.id}`);
    if (char) {
      let text_globe = char.querySelector(".globo_texto_content");
      if (!text_globe) {
        this.generateGlobo();
        text_globe = char.querySelector(".globo_texto_content");
      }
      if (text_globe) {
        text_globe.textContent = text;
      }
    }
  }

  handleClose() {
    let closeBtn = document.querySelector(`#assistant_${this.id} > .globo_texto > .globo_texto_header > .close_button`);
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        console.log("Closed...");
        let globoTexto = document.querySelector(`#assistant_${this.id} > .globo_texto`);
        if (globoTexto) {
          globoTexto.remove();
        }
      });
    }
  }

  generateGlobo() {
    let html = `
        <div class="globo_texto">
            <div class="globo_texto_header">
                <div class="title">
                    <img src="../img/976.ico" class="ico">
                    <span>${this.name}</span>
                </div>
                <div class="close_button">
                    <span>x</span>
                </div>
            </div>
            <div class="globo_texto_content"></div>
        </div>`;
    let assistantDiv = document.querySelector(`#assistant_${this.id}`);
    if (assistantDiv) {
      assistantDiv.insertAdjacentHTML("beforeend", html);
      this.handleClose();
    }
  }

  render(htmlelement: HTMLElement) {
    let html = `
            <div class="assistant" id="assistant_${this.id}">
                <div class="character"><img src="${this.img}"/></div>
            </div>
        `;
    htmlelement.insertAdjacentHTML("beforeend", html);
    this.generateGlobo();
  }
}

const assistant = new Assistant("../img/kurisu.webp", "Kurisu", [], 4);

export { assistant };
