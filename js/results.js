const params = new URLSearchParams(window.location.search);
const pokemon = params.get('pokemon') || 'pikachu'; // Default to Pikachu if no Pokémon is provided

const goBackButton = document.getElementById('go-back-btn');
const trainButton = document.getElementById('train-btn');
const feedButton = document.getElementById('feed-btn');

const pokemonName = document.getElementById('pokemon-name');
const pokemonImage = document.getElementById('pokemon-image');
const pokemonHealth = document.getElementById('pokemon-health');
const pokemonHunger = document.getElementById('pokemon-hunger');

const pokemonInfoDiv = document.getElementById('pokemon-info');

let selectedPokemon = null; // Global variable to store the fetched Pokémon
let evolutionChain = null; // Global variable for the evolution chain
let trainingCount = 0; // Tracks the number of training sessions
let hungerInterval = null; // Reference to the hunger interval
let isFainted = false; // Tracks whether the Pokémon has fainted

async function fetchPokemonData(pokemonName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
        if (!response.ok) {
            throw new Error('Pokémon not found!');
        }
        const data = await response.json();

        // Fetch species data to get the evolution chain URL
        const speciesResponse = await fetch(data.species.url);
        if (!speciesResponse.ok) {
            throw new Error('Failed to fetch species data!');
        }
        const speciesData = await speciesResponse.json();

        console.log('Fetched Pokémon:', data); // Debugging log
        console.log('Fetched Species Data:', speciesData); // Debugging log

        return {
            name: data.name,
            sprite: data.sprites.front_default,
            health: 100,
            hunger: 50,
            evolutionChainUrl: speciesData.evolution_chain.url, // Extract evolution chain URL
        };
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        alert('Failed to load Pokémon data.');
    }
}

// Fetch Evolution Chain
async function fetchEvolutionChain(evolutionChainUrl) {
    try {
        const response = await fetch(evolutionChainUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch evolution chain!');
        }
        const data = await response.json();
        console.log('Fetched Evolution Chain:', data);
        return data.chain;
    } catch (error) {
        console.error('Error fetching evolution chain:', error);
        alert('Failed to load evolution chain.');
    }
}

// Initialize Pokémon display
async function initializePokemon() {
    selectedPokemon = await fetchPokemonData(pokemon);
    if (selectedPokemon) {
        pokemonName.textContent = selectedPokemon.name.toUpperCase();
        pokemonImage.src = selectedPokemon.sprite; // Set image source
        updateStats();
        startHungerTimer(); // Start hunger increment
        // Fetch evolution chain
        evolutionChain = await fetchEvolutionChain(selectedPokemon.evolutionChainUrl);
    }
}

// Update Pokémon stats on the page
function updateStats() {
    if (selectedPokemon) {
        document.getElementById('healthFill').style.width = `${selectedPokemon.health}%`;
        document.getElementById('hungerFill').style.width = `${selectedPokemon.hunger}%`;
        pokemonHealth.textContent = `Health: ${selectedPokemon.health}`;
        pokemonHunger.textContent = `Hunger: ${selectedPokemon.hunger}`;
    }
}

// Flash Pokémon image red
function flashImage() {
    pokemonImage.classList.add('flash-red');
    setTimeout(() => pokemonImage.classList.remove('flash-red'), 500); // Flash for 500ms
}

// Start Hunger Timer
function startHungerTimer() {
    hungerInterval = setInterval(() => {
        if (selectedPokemon.hunger < 100) {
            selectedPokemon.hunger = Math.min(100, selectedPokemon.hunger + 1); // Increment hunger by 5
        }
        else{
            // If hunger is 100, decrease health and flash image
            if (selectedPokemon.health > 0) {
                selectedPokemon.health = Math.max(0, selectedPokemon.health - 5);
                flashImage();
            } else {
                isFainted = true;
                alert(`${selectedPokemon.name.toUpperCase()} has fainted!`);
                stopHungerTimer(); // Stop the timer when health reaches 0
            }
        }
        updateStats();
    }, 2000); // Run every 2 seconds
}

// Stop Hunger Timer
function stopHungerTimer() {
    clearInterval(hungerInterval);
    hungerInterval= null;
}

function checkEvolution() {
    if (selectedPokemon && evolutionChain) {
        console.log('Checking evolution for:', selectedPokemon.name);

        // Start from the root of the chain
        let currentChain = evolutionChain;

        // Traverse the chain to find the current Pokémon
        while (currentChain) 
        {
            console.log('Current chain species:', currentChain.species.name);
            if (currentChain.species.name === selectedPokemon.name) 
            {
            // Found the current Pokémon in the chain
                if (currentChain.evolves_to.length > 0) {
                    const nextEvolution = currentChain.evolves_to[0].species.name;

                    // Check evolution conditions
                    if (selectedPokemon.hunger === 0 && trainingCount >= 5) 
                    {
                        evolvePokemon(nextEvolution);
                    }
                } 
                else 
                {
                    console.log('No further evolutions available.');
                }
                return; // Exit the function once we find the current species
            }

            // Move to the next stage in the chain
            if (currentChain.evolves_to.length > 0) {
                currentChain = currentChain.evolves_to[0];
            } else {
                console.log('Reached the end of the chain without finding the species.');
                break;
            }
        }
    }
}

// Evolve Pokémon
async function evolvePokemon(nextEvolution) {
    console.log('Attempting to evolve to:', nextEvolution);
    selectedPokemon = await fetchPokemonData(nextEvolution); // Fetch data for the evolved Pokémon
    if (selectedPokemon) {
        pokemonName.textContent = selectedPokemon.name.toUpperCase();
        pokemonImage.src = selectedPokemon.sprite;
        trainingCount = 0; // Reset training count
        alert(`${selectedPokemon.name.toUpperCase()} has evolved!`);
        updateStats();
    }
}

// Feed the Pokémon
feedButton.addEventListener('click', () => {
    if (selectedPokemon && selectedPokemon.hunger > 0) {
        if(isFainted)
        {
            // Reset fainted state and health on feeding
            selectedPokemon.health = 50; // Set a recovery health value
            isFainted = false; // Reset fainted state
            alert(`${selectedPokemon.name.toUpperCase()} has recovered!`);
            startHungerTimer(); // Restart the hunger timer
        }
        selectedPokemon.hunger = 0;
        selectedPokemon.health = Math.min(100, selectedPokemon.health + 15);
        updateStats();
        checkEvolution(); // Check evolution after feeding
    }
});

// Train the Pokémon
trainButton.addEventListener('click', () => {
    if (selectedPokemon && selectedPokemon.health > 10) {
        selectedPokemon.health -= 10;
        selectedPokemon.hunger = Math.min(100, selectedPokemon.hunger + 15);
        trainingCount++;
        updateStats();
        //alert(`${selectedPokemon.name.toUpperCase()} is training hard!`);
        checkEvolution();
    } else if (selectedPokemon) {
        alert(`${selectedPokemon.name.toUpperCase()} is too weak to train. Feed it first!`);
    }
});

goBackButton.addEventListener('click', () => {
    // Navigate back to the search page
    stopHungerTimer(); // Stop the hunger timer when navigating back
    window.location.href = 'index.html'; // Replace with the correct path to your search page
});

// Initialize the page
initializePokemon();

