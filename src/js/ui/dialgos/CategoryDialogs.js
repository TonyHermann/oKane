import { Modal } from "../../components/Modal";
import { addCategory, deleteCategory, updateCategory } from "../../services/categoryService";
import { categoryStore } from "../../store/categoryStore";

export const manageCategoryModal = (name, categories) => {
    name = name ? name : ""
    categories = categories ? categories : categoryStore.getState();
    let keywordsList = []
    let html = 
    `
    <div>
        <p><strong>Nombre de la categoría</strong></p>
        <input type="text" id="category-name" placeholder="Escribe el nombre de la categoría" value="${name}" required />
        
        <p><strong>Palabras clave (separadas por coma)</strong></p>
        <textarea id="category-keywords" placeholder="Escribe las palabras clave separadas por coma" rows="4" required>${categories.filter((category) => {
            if(category.name == name) {
                return category
            }
        }).map(category => {
            return `${category.keywords}`
        }).join(',')}</textarea>
        <p><strong>Palabras clave seleccionadas</strong></p>
        <ul id="keywords-list">
        </ul>

        <div class="modal-actions">
            <button id="saveCategory">Guardar categoría</button>
            <button id="cancelCategory">Cancelar</button>
        </div>
    </div>
    `;

    const eventHandlers = {
        saveCategory: () => {
            let nameToSave = name ? name : "";
            if(nameToSave == "") {
                nameToSave = $("#category-name").value
            };
            let keywordsToSave = []
            const keywordsText = document.getElementById("category-keywords").value.trim();
            if(keywordsText) {
                keywordsToSave = keywordsText.split(",");
            }

            let catToSave = {"name": nameToSave, "keywords": keywordsToSave};
            console.log(catToSave);
            if(name) {
                updateCategory(catToSave).then(() => {
                    // renderCategories();
                });
            } else {
                addCategory(catToSave).then(() => {
                    // renderCategories();
                });
            };

            addCatModal.close();
        },
        cancelCategory: () => {
            addCatModal.close();
        }
    };

    let addCatModal = new Modal("Añadir una categoría", html, eventHandlers);
    addCatModal.create();
    
    // Función para agregar palabras clave a la lista (ul)
    const addKeywordToList = () => {
        const keywordsText = document.getElementById("category-keywords").value.trim();
        if (keywordsText) {
            const keywordsArray = keywordsText.split(",").map(kw => kw.trim()).filter(kw => kw !== "");
            const ul = document.getElementById("keywords-list");
            ul.innerHTML = ''; // Limpiar la lista de palabras clave
            keywordsArray.forEach(keyword => {
                const li = document.createElement("li");
                li.textContent = keyword;
                keywordsList.push(keyword);
                ul.appendChild(li);
            });
        };
    };

    if($("#category-keywords").value != "") {
        addKeywordToList();
    };

    $("#category-keywords").addEventListener("input", addKeywordToList);
}

export const askCategoryName = (title) => {
    return new Promise((resolve, reject) => {
        let html = 
        `
        <p><strong>${title}</strong></p>
        <input type="text" id="name-category-input" placeholder="Ej: Comida rápida" required />
        <hr>
        <div class="modal-actions">
          <button id="confirmName">Confirmar</button>
          <button id="cancelName">Cancelar</button>
        </div>
        `;

        const eventHandlers = {
            confirmName: () => {
                const inputValue = askNameModal.modal.querySelector("#name-category-input").value.trim();
                if(inputValue) {
                    askNameModal.close();
                    resolve(inputValue);
                } else {
                    alert("El campo no debe estar vacío.")
                }
            },
            cancelName: () => {
                askNameModal.close();
                reject("cancelled");
            }
        }

        const askNameModal = new Modal("Ingresa el nombre de la categoría", html, eventHandlers);
        askNameModal.create();
        
    })
}

export const createCategoryModal = (categories) => {
    let html = 
    `
    <p>Administrador de categorías</p>
    <button id="actualizeCategory">Actualizar lista</button>
    <button id="addCategory">Añadir una categoría</button>
    <button id="updateCategory">Actualizar una categoría</button>
    <button id="removeCategory">Eliminar una categoría</button>
    <hr>
    <div class='container category-container'>
    </div>
    `;

    const eventHandlers = {
        addCategory: () => {
            manageCategoryModal();
        },
        updateCategory: async () => {
            try {
                let name = await askCategoryName("Categoría a actualizar:")
                if(name != null && name != "") {
                    manageCategoryModal(name);
                } else {
                    alert("No has ingresado un nombre de categoría.");
                }
            } catch (e) {
                console.error(e);
            }
            
        },
        removeCategory: async () => {
            try {
                let name = await askCategoryName("Categoría a eliminar:");
                if(name != null && name != "") {
                    await deleteCategory(name);
                    // await renderCategories();
                } else {
                    alert("No has ingresado un nombre de categoría.");
                }
            } catch (e) {
                console.error(e);
            } 
        },
        actualizeCategory: () => {
            console.log("click")
            renderCategories();
        }
    }

    let admCatModal = new Modal ("Administrador de categorías", html, eventHandlers);
    admCatModal.create();
    renderCategories();
    categoryStore.subscribe(renderCategories);
}

const renderCategories = async () => {
    const container = $(".category-container");
    if(!container) return;

    const categories = categoryStore.getState();
    const html = `
    <p>Categorias:</p>
    <ul>
    ${categories.map(category => {
        return `
        <li id="cat_${category.name}">
            <div>
                <span>${category.name}</span>
                <div class='category-buttons'>
                    <span data-action='update' data-cat='${category.name}'><img src='../img/write_wordpad.ico' alt='Actualizar' title='Actualizar'></span>
                    <span data-action='delete' data-cat='${category.name}'><img src='../img/recycle_bin_file.ico' alt='Eliminar' title='Eliminar'></span>
                </div>
            </div>
        </li>
        <hr>
        `
    }).join('')}
    </ul>
    `;

    container.innerHTML = html;
    
    if (container.dataset.listenerBound === "true") return;
    container.dataset.listenerBound = "true";

    container.addEventListener('click', (e) => {
        const actionEl = e.target.closest("[data-action]");
        if (!actionEl) return;

        const action = actionEl.dataset.action;
        const category = actionEl.dataset.cat;


        if(action === "delete") {
            deleteCategory(category);
        }
        if(action === 'update') {
            manageCategoryModal(category);
        }
    });
}