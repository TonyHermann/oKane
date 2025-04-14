import { Modal } from "../components/Modal";
// import { categories } from "../../../public/data/categories";
import { addCategory, deleteCategory, getCategories, updateCategory } from "../services/categoryService";


const manageCategoryModal = (name, categories) => {
    name = name ? name : ""
    categories = categories ? categories : []
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
            <!-- Aquí se agregarán las palabras clave -->
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
                updateCategory(catToSave);
            } else {
                addCategory(catToSave);
            };

            addCatModal.close();
        },
        cancelCategory: () => {
            addCatModal.close();
        }
    };

    let addCatModal = new Modal("Añadir una categoría", html, eventHandlers)
    addCatModal.create()
    
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
                keywordsList.push(keyword)
                ul.appendChild(li);
            });
        }
    };

    if($("#category-keywords").value != "") {
        addKeywordToList();
    };

    $("#category-keywords").addEventListener("input", addKeywordToList);
}

const createModal = (categories) => {
    let html = 
    `
    <p>Administrador de categorías</p>
    <button id="actualizeCategory">Actualizar lista</button>
    <button id="addCategory">Añadir una categoría</button>
    <button id="updateCategory">Actualizar una categoría</button>
    <button id="removeCategory">Eliminar una categoría</button>
    <hr>
    <div class='container category-container'>
        <p>Categorias:</p>
        ${categories.map(category => {
            return `
            <li id="cat_${category.name}">
                <span>${category.name}</span>
            </li>
            `
        }).join('')}
    </div>
    `;

    const eventHandlers = {
        addCategory: () => {
            manageCategoryModal();
        },
        updateCategory: () => {
            let toUpdateCat = prompt("Ingresa el nombre de la categoría a editar");
            if(toUpdateCat != null && toUpdateCat != "") {
                manageCategoryModal(toUpdateCat, categories);
            } else {
                alert("No has ingresado un nombre de categoría.");
            }
        },
        removeCategory: () => {
            let toRemoveCat = prompt("Ingresa el nombre de la categoría a eliminar");
            if(toRemoveCat != null && toRemoveCat != "") {
                deleteCategory(toRemoveCat);
            } else {
                alert("No has ingresado un nombre de categoría.");
            }
            actualizarCategorias();
        },
        actualizeCategory: () => {
            actualizarCategorias();
        }
        
    }

    let admCatModal = new Modal ("Administrador de categorías", html, eventHandlers);
    admCatModal.create();

}

const actualizarCategorias = async ()  => {
    if($(".category-container")) {
        let categories = await getCategories();
        $(".category-container").innerHTML = `
        <div class='container category-container'>
        <p>Categorias:</p>
        ${categories.map(category => {
            return `
            <li id="cat_${category.name}">
                <span>${category.name}</span>
            </li>
            `
        }).join('')}
    </container>`
    }
}

const categoryController = () => {
    $("#admCat").addEventListener("click", async () => {
        const categories = await getCategories();
        createModal(categories);
    });
};


export { categoryController };