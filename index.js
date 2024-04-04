const express = require('express');
const request = require('request');

const app = express();
const port = 9043;

let randomGuessingAnimal;
let randomAnimal;
app.set('view engine', 'ejs');

// Calculate the time until the next midnight
function timeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Set to midnight of next day
    return midnight - now;
}

// Function to update randomGuessingAnimal every midnight
function updateRandomGuessingAnimal() {
    randomGuessingAnimal = getRandomAnimal(uniqueAnimalNames); // Assuming uniqueAnimalNames is defined elsewhere
}
// Function to make API request for a given letter
function fetchAnimals(letter) {
    const baseUrl = 'https://api.api-ninjas.com/v1/animals?name=';
    const apiKey = 'liRCXG7/jCMgV6cJcOJqvg==HgfMWrKtzCZ7bR2p';
    const url = `${baseUrl}${letter}`;
    return new Promise((resolve, reject) => {
        request.get({
            url: url,
            headers: {
                'X-Api-Key': apiKey
            }
        }, function(error, response, body) {
            if (error) {
                reject(error);
            } else if (response.statusCode != 200) {
                reject(`Error: ${response.statusCode}`);
            } else {
                resolve(JSON.parse(body));
            }
        });
    });
}



// Express route handler
app.get("/", async function(req, res) {
    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
    const requests = alphabets.split('').map(letter => fetchAnimals(letter));
    
    try {
        const results = await Promise.all(requests);
        const animalNames = results.flatMap(result => result.map(animal => animal.name));
        const uniqueAnimalNames = [...new Set(animalNames)]; // Remove duplicates
        
        // Select a random animal
         
       if(timeUntilMidnight() === 0){
        randomAnimal = getRandomAnimal(uniqueAnimalNames);
        randomGuessingAnimal = getRandomAnimal(uniqueAnimalNames);
       }
        console.log(randomAnimal)
        console.log(randomGuessingAnimal)
        console.log(timeUntilMidnight()/1000/60/60)
        // Render the index template with data
        res.render("index.ejs", { 
            data: uniqueAnimalNames.sort(), // List of animal names
           randomGuessingAnimal: randomGuessingAnimal || 'Hawaiian Monk Seal',
            randomAnimal: randomAnimal || 'Hooded Seal' // Randomly selected animal
        });
    } catch (error) {
        console.error('Request failed:', error);
        res.render("error.ejs", { error: error });
    }
});
// Update randomGuessingAnimal at midnight
setInterval(function() {
    if (timeUntilMidnight() <= 1000) { // Check if it's close enough to midnight
        updateRandomGuessingAnimal();
    }
}, 1000); // Check every second if it's close to midnight

// Start the server
app.listen(port, function() {
    console.log("Server running at http://localhost:" + port + "/");
});


function getRandomAnimal(tabNames){
    const randomIndex = Math.floor(Math.random() * tabNames.length +1);
    return tabNames[randomIndex];
}
