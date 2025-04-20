export const Assistant = class {
    constructor(img, name, data, id) {
        this.img = img;
        this.name = name;
        this.data = data;
        this.id = id;

        if(typeof Assistant.instance === "object") {
            return Assistant.instance;
        }

        Assistant.instance = this;
        return this

    }

    greet() {
        this.say(`Hola! Soy ${this.name}, tu asistente.`);
    }

    say(text) {
        let char = document.querySelector(`#assistant_${this.id}`);
        let text_globe = char.querySelector(".globo_texto_content");
        if(!text_globe) {
            this.generateGlobo();
            text_globe = char.querySelector(".globo_texto_content");
        }
        text_globe.textContent = text
    }

    handleClose() {
        let closeBtn = $(`#assistant_${this.id} > .globo_texto > .globo_texto_header > .close_button`)
        closeBtn.addEventListener("click", (e) => {
            console.log("Closed...")
            $(`#assistant_${this.id} > .globo_texto`).remove()
        })
    };

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
        </div>`
        let assistantDiv = $(`#assistant_${this.id}`)
        assistantDiv.insertAdjacentHTML("beforeend", html)
        this.handleClose()
    }

    render(htmlelement) {
        let html = `
            <div class="assistant" id="assistant_${this.id}">
                <div class="character"><img src="${this.img}"/></div>
            </div>
        `;
        htmlelement.insertAdjacentHTML("beforeend", html)
        this.generateGlobo()
    }

}

const assistant = new Assistant("../img/kurisu.webp", "Kurisu", [], "004");

export { assistant }