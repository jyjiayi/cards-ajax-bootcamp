/* HELPER FUNCTIONS TO CREATE HTML ELEMENTS */
// to create and return a p html element
const createPElement = (pText, div) => {
  const pElement = document.createElement('p');
  pElement.innerHTML = pText;
  div.appendChild(pElement);
  return pElement;
};

// to create and return a br html element
const createBrElement = () => {
  const brElement = document.createElement('br');
  return brElement;
};

// to create and return a label html element
const createLabel = (labelFor, labelId, labelText) => {
  const labelElement = document.createElement('label');
  labelElement.for = labelFor;
  labelElement.id = labelId;
  labelElement.innerHTML = labelText;
  return labelElement;
};

// to create and return an input html element
const createInput = (inputType, inputName, inputId, inputValue, inputRequired) => {
  const inputElement = document.createElement('input');
  inputElement.type = inputType;
  inputElement.name = inputName;
  inputElement.id = inputId;
  inputElement.value = inputValue;
  inputElement.required = inputRequired;
  return inputElement;
};

/** GAME LOGIC */

// global value that holds info about the current hand.
let currentGame = null;

// global values to hold emails for the dashboard
let player1email;
let player2email;

// manipulate DOM
const gameContainer = document.querySelector('#game-container');

// assign player 2 btn
const assignPlayer2Btn = document.createElement('button');
// create game btn
const createGameBtn = document.createElement('button');

// div for deal and refresh buttons
const buttonDiv = document.createElement('div');
buttonDiv.setAttribute('id', 'button-div');

// div for the deal list that shows the history of dealed cards
const dealListDiv = document.createElement('div');
dealListDiv.setAttribute('id', 'deal-list-div');
dealListDiv.innerText = 'Deal List';

// DOM manipulation function that displays the player's current hand.
const runGame = function ({ player1Hand, player2Hand }, player1Div, player2Div, gameboardDiv) {
  const player1Element = createPElement('Your hand: ', player1Div);
  player1Element.innerText = `
    Your Hand:
    ====
    ${player1Hand[0].name}
    of
    ${player1Hand[0].suit}
    ====
    ${player1Hand[1].name}
    of
    ${player1Hand[1].suit}

    ${player1email}
  `;

  const player2Element = createPElement('Random player\'s Hand: ', player2Div);

  player2Element.innerText = `
    Random player's Hand:
    ====
    ${player2Hand[0].name}
    of
    ${player2Hand[0].suit}
    ====
    ${player2Hand[1].name}
    of
    ${player2Hand[1].suit}

    ${player2email}
  `;

  gameboardDiv.appendChild(player1Div);
  gameboardDiv.appendChild(player2Div);
  dealListDiv.appendChild(gameboardDiv);
  gameContainer.appendChild(dealListDiv);
};

// make a request to the server
// to change the deck. set 2 new cards into the player hand.
const dealCards = function () {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;

      // div for the gameboard
      const gameboardDiv = document.createElement('div');
      gameboardDiv.setAttribute('id', 'gameboard-div');

      // div for player 1 cards
      const player1Div = document.createElement('div');
      player1Div.setAttribute('id', 'player1-div');

      // div for player 2 cards
      const player2Div = document.createElement('div');
      player2Div.setAttribute('id', 'player2-div');

      // show the result
      let result;
      if (response.data.winner === 'User') {
        createPElement('You won!!', player1Div);
      } else if (response.data.winner === 'Random Player') {
        createPElement('Random player won ):', player2Div);
      } else if (response.data.winner === 'Tie') {
        result = createPElement('It is a tie', gameboardDiv);
        result.style.width = '100%';
      }

      // display it to the user
      runGame(currentGame, player1Div, player2Div, gameboardDiv);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

// display the latest game to the user
const refreshGame = function () {
  axios
    .post('/refresh', {
      gameId: currentGame.id,
    })
    .then((response) => {
      const gameboardDiv = document.getElementById('gameboard-div');
      const player1Div = document.getElementById('player1-div');
      const player2Div = document.getElementById('player2-div');
      dealListDiv.innerHTML = 'Deal List';
      player1Div.innerHTML = '';
      player2Div.innerHTML = '';
      runGame(response.data, player1Div, player2Div, gameboardDiv);
    }).catch((error) => {
      // handle error
      console.log(error);
    });
};

const createGame = function () {
  // make a request to randomly assign a player 2
  axios.get('/assignPlayer2')
    .then((response) => {
      // store into global value to display to user later
      player2email = response.data.player2.email;
      // randomly assign player 2

      // request to create a new game
      axios.post('/games', {
        player2id: response.data.player2.id,
      })
        .then((response1) => {
          // set the global value to the new game
          currentGame = response1.data;
          // console.log(currentGame);

          // for this current game, create a button that will allow the user to
          // manipulate the deck that is on the DB.
          // Create a deal button for it.
          const dealBtn = document.createElement('button');
          dealBtn.addEventListener('click', dealCards);

          // display the deal button
          dealBtn.innerText = 'Deal';
          buttonDiv.appendChild(dealBtn);

          // Create a refresh button for it.
          const refreshBtn = document.createElement('button');
          refreshBtn.addEventListener('click', refreshGame);

          // display the refresh button
          refreshBtn.innerText = 'Refresh';
          buttonDiv.appendChild(refreshBtn);

          gameContainer.appendChild(buttonDiv);
          gameContainer.appendChild(dealListDiv);

          // div for the gameboard
          const gameboardDiv = document.createElement('div');
          gameboardDiv.setAttribute('id', 'gameboard-div');

          // div for player 1 cards
          const player1Div = document.createElement('div');
          player1Div.setAttribute('id', 'player1-div');

          // div for player 2 cards
          const player2Div = document.createElement('div');
          player2Div.setAttribute('id', 'player2-div');

          // display it out to the user
          runGame(currentGame, player1Div, player2Div, gameboardDiv);

          // hide the create game button
          createGameBtn.style.display = 'none';
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

/** USER SIGN UP AND LOGIN */

// function to post request for new user
const postUser = () => {
  axios
    .post('/createUser', {
      email: document.querySelector('input[name="email"]').value,
      password: document.querySelector('input[name="password"]').value,
    })
    .then((response) => {
      console.log('sign up success!');
    }).catch((error) => {
      console.log(error);
    });
};

// container for the sign up form
const signupDiv = document.createElement('div');

// function to create html elements for sign up form
const createSignUp = () => {
  const emailLabel = createLabel('email', 'email', 'Email:      ');
  const emailInput = createInput('text', 'email', 'email', '', 'required');
  const passwordLabel = createLabel('password', 'password', 'Password:      ');
  const passwordInput = createInput('text', 'password', 'password', '', 'required');
  signupDiv.appendChild(emailLabel);
  signupDiv.appendChild(emailInput);
  signupDiv.appendChild(createBrElement());
  signupDiv.appendChild(passwordLabel);
  signupDiv.appendChild(passwordInput);
  signupDiv.appendChild(createBrElement());

  const signUpButton = document.createElement('input');
  signUpButton.setAttribute('type', 'submit');
  signUpButton.setAttribute('value', 'Sign Up');
  signupDiv.appendChild(signUpButton);

  signUpButton.addEventListener('click', () => {
    postUser();
    signupDiv.style.display = 'none';
  });

  document.body.appendChild(signupDiv);
};

// function to login
const getUser = () => {
  axios
    .post('/login', {
      email: document.querySelector('input[name="email2"]').value,
      password: document.querySelector('input[name="password2"]').value,
    })
    .then((response) => {
      axios
        .get('/user')
        .then((response1) => {
          // store user email into global value to display later
          player1email = response1.data.user.email;

          // display the email to show user is logged in
          const dashboardDiv = document.createElement('div');
          createPElement(`User logged in: ${response1.data.user.email}`, dashboardDiv);
          document.body.appendChild(dashboardDiv);

          // manipulate DOM, set up create game button
          createGameBtn.addEventListener('click', createGame);
          createGameBtn.innerText = 'Create Game';
          document.body.appendChild(createGameBtn);
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
};

// container for login form
const createLogin = () => {
  const loginDiv = document.createElement('div');

  const emailLabel = createLabel('email2', 'email2', 'Email:      ');
  const emailInput = createInput('text', 'email2', 'email2', '', 'required');
  const passwordLabel = createLabel('password2', 'password2', 'Password:      ');
  const passwordInput = createInput('text', 'password2', 'password2', '', 'required');
  loginDiv.appendChild(emailLabel);
  loginDiv.appendChild(emailInput);
  loginDiv.appendChild(createBrElement());
  loginDiv.appendChild(passwordLabel);
  loginDiv.appendChild(passwordInput);
  loginDiv.appendChild(createBrElement());

  const loginButton = document.createElement('input');
  loginButton.setAttribute('type', 'submit');
  loginButton.setAttribute('value', 'Login');
  loginDiv.appendChild(loginButton);

  loginButton.addEventListener('click', () => {
    getUser();
    loginDiv.style.display = 'none';
    signupDiv.style.display = 'none';
  });

  document.body.appendChild(loginDiv);
};

// init function when page loads
const main = () => {
  createSignUp();
  createLogin();
};

main();
