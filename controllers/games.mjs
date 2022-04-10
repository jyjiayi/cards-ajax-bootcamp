/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Card Deck Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

// get a random index from an array given it's size
const getRandomIndex = function (size) {
  return Math.floor(Math.random() * size);
};

// cards is an array of card objects
const shuffleCards = function (cards) {
  let currentIndex = 0;

  // loop over the entire cards array
  while (currentIndex < cards.length) {
    // select a random position from the deck
    const randomIndex = getRandomIndex(cards.length);

    // get the current card in the loop
    const currentItem = cards[currentIndex];

    // get the random card
    const randomItem = cards[randomIndex];

    // swap the current card and the random card
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }

  // give back the shuffled deck
  return cards;
};

const makeDeck = function () {
  // create the empty deck at the beginning
  const deck = [];

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    // make a variable of the current suit
    const currentSuit = suits[suitIndex];

    // loop to create all cards in this suit
    // rank 1-13
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;

      // 1, 11, 12 ,13
      if (cardName === 1) {
        cardName = 'ace';
      } else if (cardName === 11) {
        cardName = 'jack';
      } else if (cardName === 12) {
        cardName = 'queen';
      } else if (cardName === 13) {
        cardName = 'king';
      }

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
      };

      // add the card to the deck
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }

  return deck;
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Controller Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

export default function initGamesController(db) {
  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };

  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    // deal out a new shuffled deck for this game.
    const cardDeck = shuffleCards(makeDeck());
    const player1Hand = [cardDeck.pop(), cardDeck.pop()];
    const player2Hand = [cardDeck.pop(), cardDeck.pop()];

    // let previousHighCard;
    // if (playerHand[0].rank >= playerHand[1].rank) {
    //   previousHighCard = playerHand[0];
    // } else previousHighCard = playerHand[1];

    const newGame = {
      gameState: {
        cardDeck,
        player1Hand,
        player2Hand,
        // previousHighCard,
      },
    };

    try {
      // run the DB INSERT query
      const game = await db.Game.create(newGame);

      const player1 = await db.User.findOne({
        where: {
          id: Number(request.cookies.userId),
        },
      });

      const player2 = await db.User.findOne({
        where: {
          id: request.body.player2id,
        },
      });
      // insert into the join table
      await game.addUser(player1);
      await game.addUser(player2);

      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        player1Hand: game.gameState.player1Hand,
        player2Hand: game.gameState.player2Hand,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // deal two new cards from the deck.
  const deal = async (request, response) => {
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);

      // make changes to the object
      const player1Hand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
      const player2Hand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];

      /** get the high card from each player hand and store it for comparison */
      let player1HighCard;
      if (player1Hand[0].rank >= player1Hand[1].rank) {
        player1HighCard = player1Hand[0];
      } else player1HighCard = player1Hand[1];

      let player2HighCard;
      if (player2Hand[0].rank >= player2Hand[1].rank) {
        player2HighCard = player2Hand[0];
      } else player2HighCard = player2Hand[1];

      // compare the two high cards and determine the result
      let winner;

      if (player1HighCard.rank < player2HighCard.rank) {
        winner = 'Random Player';
      } else if (player1HighCard.rank > player2HighCard.rank) {
        winner = 'User';
      } else winner = 'Tie';

      // console.log('playerHand[1].rank :>> ', playerHand[1].rank);
      // /** get the high card from current hand and store it for comparison with next deal */
      // let previousHighCard;
      // if (playerHand[0].rank >= playerHand[1].rank) {
      //   previousHighCard = playerHand[0];
      // } else previousHighCard = playerHand[1];

      // console.log('previousHighCard :>> ', previousHighCard);

      // /* compare the high card from this hand with the previous */
      // let result;
      // if (game.gameState.previousHighCard.rank < previousHighCard.rank) {
      //   result = 'This round have higher card.';
      // } else if (game.gameState.previousHighCard > previousHighCard.rank) {
      //   result = 'Previous round have higher card.';
      // } else result = 'Both rounds have the same high card ranks';

      // update the game with the new info
      await game.update({
        gameState: {
          cardDeck: game.gameState.cardDeck,
          player1Hand,
          player2Hand,
        },

      });

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        player1Hand: game.gameState.player1Hand,
        player2Hand: game.gameState.player2Hand,
        winner,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // retrieve the current game
  const findGame = async (req, res) => {
    try {
      const currentGame = await db.Game.findOne({
        where: {
          id: req.body.gameId,
        },
      });

      res.send({
        id: currentGame.id,
        player1Hand: currentGame.gameState.player1Hand,
        player2Hand: currentGame.gameState.player2Hand,
      });
    }
    catch (error) {
      console.log(error);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    deal,
    create,
    index,
    findGame,
  };
}
