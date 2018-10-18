// This is a treasure hunt game.  
//
// The world is a grid (defined by GRID_SIZE).  The player starts in position (1,1).
// A monster is randomly positioned within the world, along with a number of 
// treasures.  The player must find all treasures without getting eaten by the
// monster.
//
// The player is warned when they are near the monster, which should help them evade it.
//
// The player can use the commands L, R, U, and D to move.  They can quit the game with the
// Q command.

const readline = require("readline");

const GRID_SIZE = 5

var treasures = ['gem', 'ruby', 'diamond', 'coin', 'emerald', 'goblet']
var treasureLocations = []
var foundTreasureCount = 0;
var monsterLocation = toPoint(0,0);
var playerLocation = toPoint(0,0);

var rl = readline.createInterface(process.stdin, process.stdout);

/**
 * This function creates a point object with the given coordinates
 * 
 * @param {number} x    The x coordinate 
 * @param {number} y    The y coordinate
 * 
 * @returns The point object
 */
function toPoint(x,y) {
    return { x: x, 
             y: y,
            
             toString: function toString() {
                 return `(${this.x}, ${this.y})`;
             }};
}

/**
 * This function compares two points for equality
 * 
 * @param {point} p1 The first point to compare 
 * @param {point} p2 The second point to compare
 * 
 * @returns true if the points are the same; false otherwise
 */
function isEqualPoint(p1, p2) {
    if (!p1 && !p2) {
        return true;
    }

    if (!p1 || !p2) {
        return false;
    }

    return (p1.x === p2.x) && (p1.y === p2.y);
}

/**
 * This function searches an array for a specific point
 * 
 * @param {[]} list An array of points 
 * @param {point} pt The point to find
 * 
 * @returns The index of the point in the array; undefined if not found
 */
function findPoint(list, pt) {
    for (var i = 0; i < list.length ; i++) {
        if (isEqualPoint(list[i], pt)) {
            return i;
        }
    }

    return undefined;
}

/**
 * This function selects a random, unused location for a point.  The selected point is
 * automatically added to the used point array.
 * 
 * @param {[]} usedLocations An array of currwently used coordinates 
 * 
 * @returns The randomly chosen point
 */
function chooseUnoccupiedLocation(usedLocations) {
    var location;

    do {
        location = toPoint(Math.floor(Math.random() * GRID_SIZE) + 1, Math.floor(Math.random() * GRID_SIZE) + 1);
    }
    while (findPoint(usedLocations, location) !== undefined);
    
    usedLocations.push(location);
    return location;
}

/**
 * This function initializes a new game
 */
function initGame() {
    treasureLocations = [];
    foundTreasureCount = 0;

    playerLocation = toPoint(1,1);

    // Put the player location in the list of used locations
    var usedLocations = [playerLocation];

    // Generate the monster location
    monsterLocation = chooseUnoccupiedLocation(usedLocations);

    // Choose the treasure locations
    for (let i = 0 ; i < treasures.length ; i++) {
        treasureLocations.push(chooseUnoccupiedLocation(usedLocations));
    }
}

/**
 * This function handles moving the player to a new location in the game
 * 
 * @param {point} location - The coordinate of the new game location 
 * 
 * @returns true if the game is still running, false if over
 */
function enterLocation(location) {
    playerLocation = location;

    console.log(`\nYou are now in location ${location.toString()}`);
    
    // If the monster and player are in the same location, the game is over 
    if (isEqualPoint(monsterLocation, playerLocation)) {
        console.log("Oh no!!  You've been eaten by a hungry monster!");
        return false;
    }

    // Determine if any treasure happens to be in the same location as the player.  Note
    // that any given location can have, at most, one treasure.
    var treasure = findPoint(treasureLocations, playerLocation);

    if (treasure !== undefined) {
        console.log(`You found the ${treasures[treasure]}!`);
        treasureLocations[treasure] = undefined;

        // If all treasures have been found, the game has been won 
        if (++foundTreasureCount == treasures.length) {
            console.log(`You found all ${foundTreasureCount} treasures!  You win!!`);
            return false;
        }
        else {
            var remaining = treasures.length - foundTreasureCount;

            console.log(`You have ${remaining} more treasure${remaining > 1 ? 's' : ''} to find!`);
        }
    }

    // If the monster is nearby, warn the player
    if (isAdjacent(monsterLocation, playerLocation)) {
        console.log(`You can hear a growling sound nearby!`);
    }

    return true;
}

/**
 * This function determines if two points are adjacent to one another
 * 
 * @param {point} p1 The first point to test 
 * @param {point} p2 The second point to test
 * 
 * @returns true if the points are adjacent, false otherwise
 */
function isAdjacent(p1, p2) {
    if ((p2.y < p1.y - 1) || ( p2.y > p1.y + 1 )) {
        return false;
    }

    if ((p2.x < p1.x - 1) || ( p2.x > p1.x + 1 )) {
        return false;
    }

    return true;
}

/**
 * This function processes a player command
 * 
 * @param {string} command The command to process 
 * 
 * @returns true if the game is still running, false if it is over
 */
function processCommand(command) {
    // Convert to lowercase.
    if (command) {
        command = command.toLowerCase().trim();
    }

    // If the player enters nothing, display a special message
    if (!command || !command.length) {
        console.log(`What??`);
        return true;
    }

    // Check for specific commands.
    var newLocation = undefined;

    if (command === 'q') {
        return false;
    }
    else if (command === 'l') {
        if (playerLocation.x > 1) {
            newLocation = toPoint(playerLocation.x - 1, playerLocation.y);
        }
    }
    else if (command === 'r') {
        if (playerLocation.x < GRID_SIZE) {
            newLocation = toPoint(playerLocation.x + 1, playerLocation.y);
        }
    }
    else if (command === 'u') {
        if (playerLocation.y > 1) {
            newLocation = toPoint(playerLocation.x, playerLocation.y - 1);
        }
    }
    else if (command === 'd') {
        if (playerLocation.y < GRID_SIZE) {
            newLocation = toPoint(playerLocation.x, playerLocation.y + 1);
        }
    }
    else {
        console.log(`I don't know what you mean`);
        return true;
    }

    if (!newLocation) {
        console.log(`You can't move in that direction!`);
        return true;
    }

    // Move the player to the new location
    return enterLocation(newLocation);
}

// Initialize the game and move the player into location (1,1)
initGame();
enterLocation(toPoint(1,1));

// Once initialized, begin the game loop.  The loop prompts the player for
// input, executes the command, and repeats as long as the game is active
rl.setPrompt("\nWhat do you want to do? ");
rl.on("line", function(command) {    
    if (!processCommand(command)) {
        rl.close();
        console.log(`Thanks for playing!`);
    }
    else {
        rl.prompt();
    }
});

rl.prompt();

