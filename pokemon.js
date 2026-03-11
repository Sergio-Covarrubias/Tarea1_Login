const LIMIT = 3;

let offset = 0;
let total = 0;

let currentMode = "all"; // "all" | "search" | "type"
let currentTypeList = [];

let currentPagePokemons = [];

let knownPokemons = {};
let selectedPokemon1 = null;
let selectedPokemon2 = null;

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

    currentPagePokemons = pokemons;
    populateSelectors();
}

function populateSelectors() {

    const select1 = document.getElementById("pokemon1-select");
    const select2 = document.getElementById("pokemon2-select");

    if (!select1 || !select2) return;

    currentPagePokemons.forEach(p => {

        if (!knownPokemons[p.name]) {

            knownPokemons[p.name] = p;

            const option1 = document.createElement("option");
            option1.value = p.name;
            option1.textContent = p.name;

            const option2 = option1.cloneNode(true);

            select1.appendChild(option1);
            select2.appendChild(option2);
        }

    });

    // restaurar selección
    if (selectedPokemon1) {
        select1.value = selectedPokemon1.name;
    }

    if (selectedPokemon2) {
        select2.value = selectedPokemon2.name;
    }
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

    if (currentMode === "all") fetchPokemons();
    if (currentMode === "type") renderTypePage();
});

/* =========================
   SELECTORS
========================= */

document.getElementById("pokemon1-select")?.addEventListener("change", e => {
    const name = e.target.value;
    selectedPokemon1 = knownPokemons[name];
});

document.getElementById("pokemon2-select")?.addEventListener("change", e => {
    const name = e.target.value;
    selectedPokemon2 = knownPokemons[name];
});

/* =========================
   START BATTLE
========================= */

document.getElementById("start-battle")?.addEventListener("click", () => {
    if (!selectedPokemon1 || !selectedPokemon2) {
        alert("Select two Pokemons");
        return;
    }

    startBattle(selectedPokemon1, selectedPokemon2);
});

/* =========================
   BATTLE SYSTEM
========================= */

function startBattle(p1Data, p2Data) {
    const arena = document.getElementById("battle-arena");
    const log = document.getElementById("battle-log");

    document.getElementById("winner-container").classList.add("hidden");

    arena.classList.remove("hidden");
    log.innerHTML = "";

    const p1 = {
        name: p1Data.name,
        img: p1Data.sprites.front_default,

        hp: getStat(p1Data, "hp"),
        maxHp: getStat(p1Data, "hp"),

        attack: getStat(p1Data, "attack"),
        defense: getStat(p1Data, "defense"),

        spAttack: getStat(p1Data, "special-attack"),
        spDefense: getStat(p1Data, "special-defense"),

        speed: getStat(p1Data, "speed"),

        turns: 0,
        defending: false,
        specialDef: false
    };

    const p2 = {
        name: p2Data.name,
        img: p2Data.sprites.front_default,

        hp: getStat(p2Data, "hp"),
        maxHp: getStat(p2Data, "hp"),

        attack: getStat(p2Data, "attack"),
        defense: getStat(p2Data, "defense"),

        spAttack: getStat(p2Data, "special-attack"),
        spDefense: getStat(p2Data, "special-defense"),

        speed: getStat(p2Data, "speed"),

        turns: 0,
        defending: false,
        specialDef: false
    };

    document.getElementById("p1-name").innerText = p1.name;
    document.getElementById("p2-name").innerText = p2.name;

    document.getElementById("p1-img").src = p1.img;
    document.getElementById("p2-img").src = p2.img;

    battleTurn(p1, p2, 1);
}

function battleTurn(p1, p2, turn) {
    if (p1.hp <= 0 || p2.hp <= 0) {
        showWinner(p1.hp > 0 ? p1 : p2);
        return;
    }

    const attacker = turn === 1 ? p1 : p2;
    const defender = turn === 1 ? p2 : p1;

    // reset defensas del atacante en su nuevo turno
    attacker.defending = false;
    attacker.specialDef = false;

    const actions = ["attack", "defend"];

    if (attacker.turns >= 3) actions.push("special");
    if (attacker.turns >= 2) actions.push("specialDef");

    const action = actions[Math.floor(Math.random() * actions.length)];
    if (action === "defend" && attacker.lastAction === "defend") {
        action = "attack";
    }

    const fail = Math.random() < 0.2;

    let damage = 0;
    let text = "";

    if (fail) {
        text = `${attacker.name} tried ${action} but FAILED`;
    } else {
        if (action === "attack") {
            const attackRoll = randomStat(attacker.attack);
            const defenseRoll = randomStat(defender.defense);

            damage = calculateDamage(attackRoll, defenseRoll);

            if (damage < 1) damage = 1;
        }

        if (action === "special") {
            const attackRoll = randomStat(attacker.spAttack);
            const defenseRoll = randomStat(defender.spDefense);

            damage = calculateDamage(attackRoll, defenseRoll) * 1.5;
            damage = Math.floor(damage);

            attacker.turns = 0;
        }

        if (action === "defend") {
            attacker.defending = true;
        }

        if (action === "specialDef") {
            attacker.specialDef = true;
            attacker.turns = 0;
        }

        if (damage > 0) {
            if (defender.specialDef) {
                damage = 0;
            }
            else if (defender.defending) {
                damage = Math.floor(damage / 2);
            }

            defender.hp -= damage;
            if (defender.hp < 0) defender.hp = 0;

            // defensa solo dura un ataque
            defender.defending = false;
            defender.specialDef = false;
        }

        text = `${attacker.name} used ${action} and dealt ${damage} damage`;
    }

    addLog(text);
    updateHP(p1, p2);

    attacker.turns++;

    setTimeout(() => {
        battleTurn(p1, p2, turn === 1 ? 2 : 1);
    }, 1500);
}

function updateHP(p1, p2) {
    const p1Percent = (p1.hp / p1.maxHp) * 100;
    const p2Percent = (p2.hp / p2.maxHp) * 100;

    document.getElementById("p1-hp").style.width = p1Percent + "%";
    document.getElementById("p2-hp").style.width = p2Percent + "%";

    document.getElementById("p1-hp-text").innerText = p1.hp;
    document.getElementById("p2-hp-text").innerText = p2.hp;
}

function addLog(text) {
    const li = document.createElement("li");
    li.innerText = text;

    document.getElementById("battle-log").prepend(li);
}

function showWinner(winner) {
    document.getElementById("winner-container").classList.remove("hidden");

    document.getElementById("winner-name").innerText = winner.name;
    document.getElementById("winner-img").src = winner.img;
}

function getStat(pokemon, statName) {
    const stat = pokemon.stats.find(s => s.stat.name === statName);
    return stat ? stat.base_stat : 50;
}

function randomStat(base) {
    const variation = Math.floor(Math.random() * 11) - 5; // -5 a +5
    return base + variation;
}

function calculateDamage(attackValue, defenseValue) {
    const rawDamage = attackValue * (attackValue / (attackValue + defenseValue));
    return Math.max(5, Math.floor(rawDamage));
}

fetchPokemons();
