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

  var database = firebase.database("/RPS");
  var chatData = firebase.ref("/RPS/chat");
  var playersRef = firebase.ref("/RPS/players");
  var currentTurnRef = firebase.ref("/RPS/turn");
  var username = "Guest";
  var currentPlayers = null;
  var currentTurn = null;
  var playerNum = false; //check this
  var playerOneExists = false; 
  var playerTwoExists = false;
  var playerOneData = null;
  var playerTwoData = null;