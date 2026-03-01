// Función para hacer fetch a Bulbasaur
async function fetchPokemon() {
    try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon/bulbasaur");
        const data = await response.json();

        displayPokemon(data);
    } catch (error) {
        console.error("Error fetching Pokemon:", error);
    }
}

function displayPokemon(pokemon) {
    const container = document.getElementById("pokemon-data");

    // Información de la API
    const name = pokemon.name;

    const types = pokemon.types
        .map(t => t.type.name)
        .join(", ");

    const image = pokemon.sprites.front_default;

    const abilities = pokemon.abilities
        .map(a => a.ability.name)
        .join(", ");

    const stats = pokemon.stats
        .map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`)
        .join("");

    // Poner la información de la API en el HTML
    container.innerHTML = `
    <div class="pokemon-card">
        <h2>${name.toUpperCase()}</h2>
        <img src="${image}" alt="${name}" />
        <p class="pokemon-types"><strong>Type:</strong> ${types}</p>
        <p class="pokemon-abilities"><strong>Abilities:</strong> ${abilities}</p>
        <div class="pokemon-stats">
            <strong>Stats:</strong>
            <ul>
                ${stats}
            </ul>
        </div>
    </div>
    `;
}

fetchPokemon();
