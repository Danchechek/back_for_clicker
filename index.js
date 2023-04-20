const express = require('express');
const app = express();
app.use(express.json());


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// список уникальных ключей
const keys = [];

// список игр
const games = [];

// класс игрока
class Player {
    constructor(name) {
        this.name = name;
        this.result = null;
    }
}

// класс игры
class Game {
    constructor(name) {
        this.key = null;
        this.players = [];
        this.status = false;
        this.creatorName = name;
    }

    // создание игры
    createGame(name) {
        const game = new Game(name);
        games.push(game);
        return game;
    }

    // добавление игрока в игру
    joinToGame(name, key) {
        const playerExists = this.players.find(player => player.name === name);
        if (playerExists) {
            throw new Error('Player with this name already exists in the game');
        }

        const game = games.find(game => game.key === key);
        if (!game) {
            throw new Error('Game not found');
        }

        const player = new Player(name);
        game.players.push(player);
        if(game.players.length === 2){
            game.status = true;
        }
        return game;
    }

    // отправка результата игроком
    sendResult(key, name, result) {
        const game = games.find(game => game.key === key);
        if (!game) {
            throw new Error('Game not found');
        }

        const player = game.players.find(player => player.name === name);
        if (!player) {
            throw new Error('Player not found');
        }

        player.result = result;

        // проверяем, сколько игроков имеют результаты
        const playersWithResults = game.players.filter(player => player.result !== null);
        if (playersWithResults.length === 2) {
            game.status = 'End';
        }

        return game;
    }

    // завершение игры
    endGame(key) {
        const index = games.findIndex(game => game.key === key);
        if (index === -1) {
            throw new Error('Game not found');
        }
        games.splice(index, 1);
    }

    // получение результатов
    getResults(key) {
        const game = games.find(game => game.key === key);
        if (!game) {
            throw new Error('Game not found');
        }

        const results = {};
        game.players.forEach(player => {
            results[player.name] = player.result;
        });

        return results;
    }
}

// создаем экземпляр класса Game
const game = new Game();

// маршрут для создания игры
app.post('/createGame', (req, res) => {
    const name = req.body.name;
    const newGame = game.createGame(name);

    // генерируем уникальный ключ игры
    let key;
    do {
        key = '';
        for (let i = 0; i < 5; i++) {
            const index = Math.floor(Math.random() * 36);
            key += 'abcdefghijklmnopqrstuvwxyz0123456789'[index];
        }
    } while (keys.includes(key));
    keys.push(key);
    newGame.key = key;

    res.send(key);

});

// маршрут для добавления игрока в игру
app.post('/joinToGame', (req, res) => {
    const name = req.body.name;
    const key = req.body.key;

// проверяем, существует ли игра с таким ключом
    const game = games.find(game => game.key === key);

    if (!game) {
        return res.status(404).json({ error: 'Игра с таким ключом не найдена' });
    }

// проверяем, что имя игрока уникально в рамках игры
    if (game.players.find(player => player.name === name)) {
        return res.status(400).json({ error: 'Имя игрока уже занято' });
    }

// добавляем игрока в игру
    const player = { name, result: null };
    game.players.push(player);

// изменяем статус игры на "True"
    if(game.players.length > 1){
        game.status = 'True';
    }


    return res.status(200).json({ message: 'Игрок добавлен в игру' });
});

// маршрут для ввода результата игроком
app.post('/sendResult', (req, res) => {
    const name = req.body.name;
    const key = req.body.key;
    const result = req.body.result;

// ищем игру с заданным ключом
    const game = games.find(game => game.key === key);

    if (!game) {
        return res.status(404).json({ error: 'Игра с таким ключом не найдена' });
    }

// ищем игрока с заданным именем в игре
    const player = game.players.find(player => player.name === name);

    if (!player) {
        return res.status(404).json({ error: 'Игрок с таким именем не найден в игре' });
    }

// сохраняем результат игрока
    player.result = result;

// проверяем, сколько игроков имеют ненулевой результат
    const finishedPlayers = game.players.filter(player => player.result !== null);

    if (finishedPlayers.length === 2) {
// изменяем статус игры на "End", если результаты введены обоими игроками
        game.status = 'End';
    }

    return res.status(200).json({ message: 'Результат сохранен' });
});

// маршрут для завершения игры
app.delete('/endGame', (req, res) => {
    const key = req.body.key;

// ищем игру с заданным ключом
    const gameIndex = games.findIndex(game => game.key === key);

    if (gameIndex === -1) {
        return res.status(404).json({ error: 'Игра с таким ключом не найдена' });
    }

// удаляем игру из списка игр
    games.splice(gameIndex, 1);

    return res.status(200).json({ message: 'Игра удалена' });
});

// маршрут для получения результатов игры
app.get('/getResults/:key', (req, res) => {
    const key = req.params.key;
    const game = games.find(game => game.key === key);
    if (!game) {
        res.status(404).send('Game not found');
    }

// создаем мапу с результатами игроков
    const results = {};
    game.players .forEach(player => {
        results[player.name] = player.result;
    });
    res.send(results);
});

// маршрут для проверки статуса игры
app.get('/checkStatus/:key', (req, res) => {
    const key = req.params.key;
    const game = games.find(game => game.key === key);
    if (!game) {
        res.status(404).send('Game not found');
    } else {
        res.send(game.status);
    }
});

// маршрут для удаления игры
app.delete('/endGame/:key', (req, res) => {
    const key = req.params.key;
    const index = games.findIndex(game => game.key === key);
    if (index === -1) {
        res.status(404).send('Game not found');
    } else {
        games.splice(index, 1);
        res.send('Game deleted');
    }
});

// слушаем порт
const port = 8080;
app.listen(port, () => {
    console.log('Server listening on port ${port}');
});