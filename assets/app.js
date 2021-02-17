var firebaseConfig = {
    apiKey: "AIzaSyAIo73sgvgZoEap6atpVgYVBen7IHiG2zw",
    authDomain: "bootcamp-take2-example.firebaseapp.com",
    databaseURL: "https://bootcamp-take2-example.firebaseio.com",
    projectId: "bootcamp-take2-example",
    storageBucket: "bootcamp-take2-example.appspot.com",
    messagingSenderId: "836834539838",
    appId: "1:836834539838:web:51b4c334db163c00d9546f"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  var database = firebase.database();
  var chatData = database.ref("/RPS/chat");
  var playersRef = database.ref("/RPS/players");
  var currentTurnRef = database.ref("/RPS/turn");
  var username = "Guest";
  var currentPlayers = null;
  var currentTurn = null;
  var playerNum = false;
  var playerOneExists = false; 
  var playerTwoExists = false;
  var playerOneData = null;
  var playerTwoData = null;

  //Username Listeners

  //Start button listener,
  // this captures the username whenever the user clicks the star button
  $("#start-btn").on("click", function() {
      if ($("#username").val() !== "") {
          username = $("#username").val();
          rabbitHole();
          console.log("user clicked button")
      }
  });

  //Listener for the enter key, which is the character 13 in ASCII code 
  $("#username").keypress(function(e){
      if (e.which === 13 && $("#username").val() !== "") {
          username = $("#username").val();
          rabbitHole();
          console.log("user pressed enter under username input")
      }
  })

//Function in which user gets in the game, basically takes a turn and is added to the database, assigned a turn
  function rabbitHole() {
      // For adding disconnects to the chat with a unique id (the date/time the user entered the game)
  // Needed because Firebase's '.push()' creates its unique keys client side,
  // so you can't ".push()" in a ".onDisconnect"
  chatDataDisc = database.ref("/RPS/chat/" + Date.now());

    //Checks for current players, if theres a player one connected, then the user becomes player 2. 
    //If theres no player 1, then the user becomes player 1
    if (currentPlayers < 2) {
      if (playerOneExists) {
        playerNum = 2;
      } else {
        playerNum = 1;
      }

      // Creates key based on assigned player number
      playerRef = database.ref("/RPS/players/" + playerNum);

      //Creates player object. "choice" is unnecessary here, but it's left to be as complete as possible
      playerRef.set({
        name: username,
        wins: 0,
        losses: 0,
        choice: null,
      });

      //Remove player when disconnected from player object
      playerRef.onDisconnect().remove();

      //If a player disconnects, set the turn to null in order to stop it
      currentTurnRef.onDisconnect().remove();

      //Send disconnect message to chat with Firebase server generated timestamp and id of "0" to denote system message
      chatDataDisc.onDisconnect().set({
        name: username,
        time: firebase.database.ServerValue.TIMESTAMP,
        message: "has disconnected",
        idNum: 0,
      });

      //Remove name input box and show current player number
      $("#player-sel").empty();
      $("#player-sel").append(
        $("<h2>").text("Hi " + username + "! You are player " + playerNum)
      );
    } else {
    //If current player is "2" will not allow player to join (party full)
    alert("Sorry, Game full! Try again later!");
  }
}

//Tracks changes in key which contains player objects 
playersRef.on("value", function(snapshot) {
  //length of the players array. Second player is added after "playerOneExists" which will be done right next
  currentPlayers = snapshot.numChildren();
  console.log("Number of players " + currentPlayers);

  //Check to see if player exists. Here is where they start to exist
  playerOneExists = snapshot.child("1").exists();
  console.log("Player 1 exists: " + playerOneExists);
  playerTwoExists = snapshot.child("2").exists();
  console.log("Player 2 exists: " + playerTwoExists);

  //Player data objects
  playerOneData = snapshot.child("1").val();
  console.log("Player 1 data: " + playerOneData);
  playerTwoData = snapshot.child("2").val();
  console.log("Player 2 data: " + playerTwoData);

  //If theres a player 1, fill in it's info: name, wins and losses
  if (playerOneExists) {
    $("#player1-name").text(playerOneData.name);
    $("#player1-wins").text("Wins: " + playerOneData.wins);
    $("#player1-losses").text("Losses: " + playerOneData.losses);
  } else {
    $("#player1-name").text("Waiting for player 1");
    $("#player1-wins").empty();
    $("#player1-losses").empty();
  }

  //If there's a player 2, fill in it's info: name, wins and losses
  if (playerTwoExists) {
    $("#player2-name").text(playerTwoData.name);
    $("#player2-wins").text("Wins: " + playerTwoData.wins);
    $("#player2-losses").text("Losses: " + playerTwoData.losses);
  } else {
    $("#player2-name").text("Waiting for player 2");
    $("#player2-wins").empty();
    $("#player2-losses").empty();
  }

});

//When a player joins, checks to see if there are two players now. If yes, then it will start the game
//This because of turn 1 
playersRef.on("child_added", function(snapshot) {
  console.log("Turns snap");
  console.log(snapshot.key);
  console.log(currentPlayers); //takes the length of the array, we could have used snapshot.key === 2 also
  if (currentPlayers === 1) {
    //set turn to 1 in currentTurnRef, which starts the game
    currentTurnRef.set(1);
  }
});

//Detects changes in the turn key
currentTurnRef.on("value", function(snapshot) {
  //Gets current turn from snapshot
  currentTurn = snapshot.val();
  console.log("Turn snapshot: " + snapshot);

  //Once someone has logged in 
  if (playerNum) {
    //For turn 1 
    if (currentTurn === 1) {
      //If its the current player's turn, show choices 
      if (currentTurn === playerNum) {
        //Tell player it's to play 
        $("#current-turn h2").text("It's time to play!");
        //Show choices
        $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
      } else {
        //This is to tell player 2 to wait for player 1 to choose
        $("#current-turn h2").text("Waiting for " + playerOneData.name + " to choose.");
      }

      //Indicate turn with border color 
      $("#player1").css("border", "2px solid green");
      $("#player2").css("border", "1px solid red");

    } // Now for player 2 
      else if (currentTurn === 2) {
        if (currentTurn === playerNum) {
          $("#current-turn h2").text("It's time to play!");
          $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
        } else {
          $("#current-turn h2").text("Waiting for " + playerTwoData.name + " to choose.");
  
      } 
      $("#player1").css("border", "1px solid red");
      $("#player2").css("border", "2px solid green");

      } else if (currentTurn === 3) {
        //Function of game's logic to define which player won the turn and set it to 1 again
        gameLogic(playerOneData.choice, playerTwoData.choice);
    
        //Reveal both player's choices
        $("#player1-chosen").text(playerOneData.choice);
        $("#player2-chosen").text(playerTwoData.choice);
    
        //reset after turn function
        var moveOn = function() {
          $("#player1-chosen").empty();
          $("#player2-chosen").empty();
          $("#result").empty();
    
          //Check to make sure players didn't leave before timeout and set turn to 1 again
          if (playerOneExists && playerTwoExists) {
            currentTurnRef.set(1);
          }
        };
    
        setTimeout(moveOn, 2000);
    
      } else {
        $("#player1 ul").empty();
        $("#player2 ul").empty();
        $("#current-turn").html("<h2>Waiting for another player to join.</h2>");
        $("#player1").css("border", "1px solid black")
        $("#player2").css("border", "1px solid black")
      }
  } 
});

//Function with the logic to define which player wins and which looses every turn 
function gameLogic(player1choice, player2choice) {
  //function to set the win for player 1 and loss for player 2 stored in a variable
  var playerOneWon = function() {
    $("#result h2").text(playerOneData.name + " wins!");
    if (playerNum === 1) {
      playersRef
        .child("1")
        .child("wins")
        .set(playerOneData.wins + 1);
      playersRef
        .child("2")
        .child("losses")
        .set(playerTwoData.losses + 1);
    }
  };

  var playerTwoWon = function() {
    $("#result h2").text(playerTwoData.name + " wins");
    if (playerNum === 2) {
      playersRef
      .child("1")
      .child("losses")
      .set(playerOneData.losses + 1);
      playersRef
      .child("2")
      .child("wins")
      .set(playerTwoData.wins + 1);
    }
  };

  //This is merely informative since doesn't affect player's objects and there isn't a tie score
  var tie = function() {
    $("#result h2"). text("Tie Game!");
  };

  if (player1choice === "Rock" && player2choice === "Rock") {
    tie();
  } else if (player1choice === "Rock" && player2choice === "Paper") {
    playerTwoWon();
  } else if (player1choice === "Rock" && player2choice === "Scissors") {
    playerOneWon();
  } else if (player1choice === "Paper" && player2choice === "Rock") {
    playerOneWon();
  } else if (player1choice === "Paper" && player2choice === "Paper") {
    tie();
  } else if (player1choice === "Paper" && player2choice === "Scissors") {
    playerTwoWon();
  } else if (player1choice === "Scissors" && player2choice === "Rock") {
    playerTwoWon();
  } else if (player1choice === "Scissors" && player2choice === "Paper") {
    playerOneWon();
  } else if (player1choice === "Scissors" && player2choice === "Scissors") {
    tie();
  }
}

//Click event for the dinamically generated choices (li elements)
$(document).on("click", "li", function(event) {
  console.log($(this).text());
  console.log(playerRef);

  //Gets the text from the chosen li 
  var clickChoice = $(this).text();

  //Sets the choice in the current player object in firebase
  playerRef.child("choice").set(clickChoice);

  //User has chosen, so removes choices and displays what they chose
  $("#player" + playerNum + " ul").empty();
  $("#player" + playerNum + "-chosen").text(clickChoice);

    // Increments turn. Turn goes from:
    // 1 - player 1
    // 2 - player 2
    // 3 - determine winner
    currentTurnRef.transaction(function(turn) {
      return turn + 1
    });
  
})
