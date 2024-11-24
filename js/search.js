const searchInput = document.getElementById('pokemon-search');
const suggestions = document.getElementById('suggestions');
const searchButton = document.getElementById('search-btn');
let pokemonList = [];

async function fetchPokemonNames()
{
    try{
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        pokemonList = data.results.map(pokemon => pokemon.name);
        console.log(pokemonList);
    } catch(error){
        console.error('Failed to fetch Pokemon names: ', error);
    }
}
fetchPokemonNames();

// Show filtered suggestions as the user types
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    suggestions.innerHTML = ''; // Clear existing suggestions
    if (query) {
        const filteredPokemon = pokemonList.filter(name => name.startsWith(query));
        if (filteredPokemon.length > 0) {
            suggestions.style.display = 'block'; // Show suggestions
            filteredPokemon.forEach(name => {
                const li = document.createElement('li');
                li.textContent = name;

                // Select Pokémon on click
                li.addEventListener('click', () => {
                    searchInput.value = name; // Set input value
                    suggestions.style.display = 'none'; // Hide suggestions
                });

                suggestions.appendChild(li);
            });
        } else {
            suggestions.style.display = 'none'; // Hide suggestions if no matches
        }
    } else {
        suggestions.style.display = 'none'; // Hide suggestions if input is empty
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.container')) {
        suggestions.style.display = 'none';
    }
});

searchButton.addEventListener('click', ()=> {
    const pokemon = searchInput.value.trim();
    if(pokemon)
    {
        window.location.href = `results.html?pokemon=${pokemon}`;
    }
    else{
        alert('Please enter a Pokemon name or ID');
    }
}
);

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default anchor behavior
        const targetId = this.getAttribute('data-target'); // Get target section ID
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth', // Enables smooth scrolling
                block: 'start' // Aligns to the top of the section
            });
        }
    });
});
