const fs = require('fs');

fetch("https://v3.football.api-sports.io/countries?", {
    method: "GET",
    headers: {
        "x-apisports-key": "363345b2154c74f17694710d92c60765",
    },
})
    .then((response) => response.json())
    .then((data) => {
        const countries = data.response;
        console.log(countries);
        
        // Criar arquivo database.json
        fs.writeFileSync('database.json', JSON.stringify(countries, null, 2));
        console.log('Arquivo database.json criado com sucesso!');
    })
    .catch((err) => {
        console.log(err);
    });

