import { routes } from "./data/routes.js"

const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
}

const handleLocation = async () => {
    const path = window.location.pathname;
    const routeItm = routes[path] || routes[404];
    const route = routeItm.url
    const html = await fetch(route).then((data) => {
        return data.text();
    })
    document.querySelector(".main-content").innerHTML = html;
    if(routes[path]) {
        routes[path].js()
    }
}

window.onpopstate = handleLocation;
window.route = route;


handleLocation();