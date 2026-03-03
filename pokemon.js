const LIMIT = 3;

let offset = 0;
let total = 0;

let currentMode = "all"; // "all" | "search" | "type"
let currentTypeList = [];

const listContainer = document.getElementById("pokemon-list");
const pageInfo = document.getElementById("page-info");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

function renderPokemons(pokemons) {
    listContainer.innerHTML = "";

    pokemons.forEach(pokemon => {
        const types = pokemon.types.map(t => t.type.name).join(", ");
        const image = pokemon.sprites.front_default;

        const abilities = pokemon.abilities
            .map(a => a.ability.name)
            .join(", ");

        const stats = pokemon.stats
            .map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`)
            .join("");

        const card = `
            <div class="pokemon-card">
                <h2>${pokemon.name.toUpperCase()}</h2>
                <img src="${image}" alt="${pokemon.name}" />
                <p><strong>ID:</strong> ${pokemon.id}</p>
                <p><strong>Type:</strong> ${types}</p>
                <p><strong>Abilities:</strong> ${abilities}</p>
                <div class="pokemon-stats">
                    <strong>Stats:</strong>
                    <ul>
                        ${stats}
                    </ul>
                </div>
            </div>
        `;

        listContainer.innerHTML += card;
    });
}

function updateButtons(disableAll = false) {
    if (disableAll) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    if (currentMode === "all") {
        prevBtn.disabled = offset === 0;
        nextBtn.disabled = offset + LIMIT >= total;
    }

    if (currentMode === "type") {
        prevBtn.disabled = offset === 0;
        nextBtn.disabled = offset + LIMIT >= currentTypeList.length;
    }
}

async function fetchPokemons() {
    currentMode = "all";

    const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${LIMIT}`
    );

    const data = await response.json();
    total = data.count;

    const detailedPromises = data.results.map(p =>
        fetch(p.url).then(res => res.json())
    );

    const detailedPokemons = await Promise.all(detailedPromises);

    renderPokemons(detailedPokemons);

    const currentPage = offset / LIMIT + 1;
    const totalPages = Math.ceil(total / LIMIT);

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    updateButtons();
}

async function renderTypePage() {
    const slice = currentTypeList.slice(offset, offset + LIMIT);

    const detailedPromises = slice.map(p =>
        fetch(p.pokemon.url).then(res => res.json())
    );

    const pokemons = await Promise.all(detailedPromises);

    renderPokemons(pokemons);

    const currentPage = offset / LIMIT + 1;
    const totalPages = Math.ceil(currentTypeList.length / LIMIT);

    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (Type)`;

    updateButtons();
}

document.getElementById("search-btn").addEventListener("click", async () => {
    const nameOrId = document
        .getElementById("search-name")
        .value.trim()
        .toLowerCase();

    const typeFilter = document
        .getElementById("search-type")
        .value.trim()
        .toLowerCase();

    offset = 0;

    if (nameOrId) {
        try {
            currentMode = "search";

            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${nameOrId}`
            );

            if (!response.ok) throw new Error("Not found");

            const pokemon = await response.json();

            renderPokemons([pokemon]);
            pageInfo.textContent = "Search result";

            updateButtons(true);
        } catch {
            listContainer.innerHTML = "<p>Pokemon not found</p>";
            pageInfo.textContent = "";
            updateButtons(true);
        }

        return;
    }

    if (typeFilter) {
        try {
            currentMode = "type";

            const response = await fetch(
                `https://pokeapi.co/api/v2/type/${typeFilter}`
            );

            if (!response.ok) throw new Error("Type not found");

            const data = await response.json();

            currentTypeList = data.pokemon;

            renderTypePage();
        } catch {
            listContainer.innerHTML = "<p>Type not found</p>";
            pageInfo.textContent = "";
            updateButtons(true);
        }

        return;
    }

    currentMode = "all";
    fetchPokemons();
});

nextBtn.addEventListener("click", () => {
    offset += LIMIT;

    if (currentMode === "all") {
        fetchPokemons();
    }

    if (currentMode === "type") {
        renderTypePage();
    }
});

prevBtn.addEventListener("click", () => {
    offset -= LIMIT;

    if (currentMode === "all") {
        fetchPokemons();
    }

    if (currentMode === "type") {
        renderTypePage();
    }
});

fetchPokemons();
