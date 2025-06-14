'use strict'

function _find_last_game() {
    const lastGame = document.querySelector(".game");
    if (lastGame) return lastGame;

    throw new Error("Last game not found.");
}

function _find_previous_round() {
    const lastGame = _find_last_game();
    const previousRound = lastGame.querySelector(".game-round");
    if (previousRound) return previousRound;

    throw new Error("Previous round not found.");
}

function _find_games_container() {
    const gamesContainer = document.querySelector(".games");

    if (gamesContainer) return gamesContainer;

    throw new Error("Games container not found.");
}

function _clear_scores(node) {
    node.querySelectorAll("[contenteditable").forEach(function (element) {
        element.textContent = "";
    });
}

function _find_number_of_players(lastGame) {
    const sumElements = lastGame.querySelectorAll(".sum");

    return sumElements.length;
}

function _calculate_game_sum(lastGame) {
    const sumElements = lastGame.querySelectorAll(".sum");
    const number_of_players = _find_number_of_players(lastGame);
    const valueElements = lastGame.querySelectorAll("tbody .value");

    sumElements.forEach(function (sumElement, sum_key) {
        let sum = 0;

        valueElements.forEach(function (valueElement, value_key) {
            if (sum_key == value_key % number_of_players) {
                const value = parseInt(valueElement.textContent);

                if (Number.isInteger(value)) {
                    sum += parseInt(valueElement.textContent);
                }
            }
        });

        sumElement.textContent = sum;
    });
}

function _get_data_key() {
    const lastGame = _find_last_game();
    const number_of_players = _find_number_of_players(lastGame);

    return "uno_score_" + number_of_players;
}

function calculate_sum(element) {
    const closestGame = element.closest(".game");
    _calculate_game_sum(closestGame);
}

function next_round() {
    const previousRound = _find_previous_round();

    const newRound = document.importNode(previousRound, true);
    const topRound = newRound.querySelector("[scope=\"row\"]");
    if (!topRound) throw new Error("Top round not found.");

    topRound.textContent = parseInt(topRound.textContent) + 1;

    _clear_scores(newRound);

    const parentRound = previousRound.parentElement;
    if (!parentRound) throw new Error("Parent round not found.");

    parentRound.prepend(newRound);
}

function remove_round() {
    const previousRound = _find_previous_round();
    const previousRoundFirstRow = previousRound.querySelector("[scope=\"row\"]");
    const previousRoundNumber = parseInt(previousRoundFirstRow.textContent);

    if (previousRoundNumber > 1) {
        const closestGame = previousRound.closest(".game");

        previousRound.remove();

        _calculate_game_sum(closestGame);
    }
}

function next_game() {
    const lastGame = _find_last_game();
    const gamesContainer = _find_games_container();

    if (!gamesContainer) throw new Error("Games container not found.");
    const newGame = document.importNode(lastGame, true);
    const gameRounds = newGame.querySelectorAll(".game-round");
    gameRounds.forEach(function (gameRound, number) {
        if (number == (gameRounds.length - 1)) {
            _clear_scores(gameRound);
        } else {
            gameRound.remove();
        }
    });

    _calculate_game_sum(newGame);

    gamesContainer.prepend(newGame);
}

function remove_game() {
    const lastGame = _find_last_game();
    const gamesContainer = _find_games_container();

    if (gamesContainer.children.length > 1) {
        lastGame.remove();
    }
}

function save_games() {
    const games = document.querySelectorAll(".game");
    const data = [];

    games.forEach(function (game, game_number) {
        data[game_number] = [];

        game.querySelectorAll(".value").forEach(function (value, index) {
            data[game_number][index] = value.textContent;
        });
    });

    const data_key = _get_data_key();
    localStorage.setItem(data_key, JSON.stringify(data));
}

function load_games() {
    const data_key = _get_data_key();
    const data = JSON.parse(localStorage.getItem(data_key));
    if (!data) throw new Error("No saved data");

    const lastGame = _find_last_game();
    const templateGame = document.importNode(lastGame, true);
    const templateGameRounds = templateGame.querySelectorAll(".game-round");
    let templateGameRound;

    templateGameRounds.forEach(function (gameRound, number) {
        if (number == (templateGameRounds.length - 1)) {
            _clear_scores(gameRound);
            templateGameRound = gameRound;
        } else {
            gameRound.remove();
        }
    });

    const gamesContainer = _find_games_container();
    gamesContainer.textContent = '';

    const number_of_players = _find_number_of_players(lastGame);
    const default_nymber_of_items = 2;

    for (const game of data) {
        const newGame = document.importNode(templateGame, true);
        const newRoundsContainer = newGame.querySelector(".rounds");

        for (let i = 0; i < (game.length / number_of_players) - default_nymber_of_items; i++) {
            const newRound = document.importNode(templateGameRound, true);
            const newRoundNumber = newRound.querySelector("[scope=\"row\"]");
            newRoundNumber.textContent = i + default_nymber_of_items;

            newRoundsContainer.prepend(newRound);
        }

        newGame.querySelectorAll('.value').forEach(function (element, key) {
            element.textContent = game[key] ?? "";
        });

        _calculate_game_sum(newGame);

        gamesContainer.append(newGame);
    }
}
