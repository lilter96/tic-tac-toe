const tagContainer = document.querySelector('.tag-container');
const input = document.querySelector('.container input');
const buttonInput = document.querySelector('.container button');

buttonInput.addEventListener('click', function(){
  const tags = input.value.split(',');
  UpdateGames(document.querySelectorAll('.game'), tags);
})

function GameContainsAllTags(game, tags){
    let currentGameTags = game.childNodes[1].childNodes[1].innerText; 
    for (let j = 0; j < tags.length; j++){
        if (currentGameTags.indexOf(tags[j]) == -1){
            return false;
        }
    }
    return true;
}

function UpdateGames(games, tags)
{    
     for (let i = 0; i < games.length; i++) {
        if (!GameContainsAllTags(games[i], tags)){
            if (!games[i].classList.contains('hidden')){
                games[i].classList.remove('d-flex');
                games[i].classList.add("hidden");
            } 
        } else {
            if (games[i].classList.contains('hidden')){
                games[i].classList.remove('hidden');
                games[i].classList.add('d-flex');
            }
        }
      }
}

const hubConnection = new signalR.HubConnectionBuilder().
    withUrl('/games').
    build();

function MakeElements(tags){
  let tagsElements = new Map();
  tags.forEach(tag => {
    tagsElements.set(tag, document.createElement(tag));
  });
  return tagsElements;
}

hubConnection.on('Init', function(games){
  for (let i = 0; i < games.length; i++){
    AddGame(games[i]['gameName'], games[i]['tags']);
  }
});

function AddGame(gameName, tags){
  const gamesUl = document.querySelector('.games');
  let _tags = ["li","img","div", "input", "h3", "button"];
  let elements = MakeElements(_tags);
  elements.get("input").value = tags;
  elements.get("input").setAttribute("data-role", "taginput");
  elements.get('input').setAttribute('readonly', 'readonly');
  elements.get('button').setAttribute("type","button");
  elements.get('button').classList.add("btn");
  elements.get('button').innerHTML = 'Join';
  elements.get('button').classList.add("btn-primary");
  elements.get('button').classList.add("join-game");
  elements.get('h3').innerHTML = gameName;
  elements.get('h3').classList.add("tags");
  elements.get('img').setAttribute("src","img/preview.png");
  elements.get('li').classList.add("game");
  elements.get('li').classList.add("d-flex");
  elements.get('li').classList.add("col-md-4"); 
  elements.get('li').classList.add("game-" + gameName);
  elements.get('div').append(elements.get('h3'));
  elements.get('div').append(elements.get('input'));
  elements.get('div').append(elements.get('button'));
  elements.get('li').append(elements.get('img'));
  elements.get('li').append(elements.get('div'));
  gamesUl.append(elements.get('li'));
  elements.get('button').addEventListener("click", function (e){
    hubConnection.invoke("Join", gameName, tags);
  });
}

function MakeGameField(gameName, tags){  
  document.querySelector('.search').classList.add('hidden'); 
  document.querySelector('.play').classList.remove('hidden');
  let gameSection = document.querySelector('.play');
  let elem = document.createElement('h1');
      elem.innerHTML = "Waiting for your opponent";
  gameSection.append(elem);
}

hubConnection.on("OthersCreate", function(gameName, tags){
  AddGame(gameName, tags);
});

hubConnection.on("SelfCreate", function(gameName, stringTags){
  input.value = "";
  document.querySelector("#inputGameName").value = "";
  MakeGameField(gameName, stringTags);
});

function CreateTable(gameName){
  const div = document.createElement('div');
  const table = document.createElement('table');
  for (let i = 0; i < 3; i++){
    let tr = document.createElement('tr');
    for (let j = 0; j < 3; j++){
      let td = document.createElement('td');
      td.addEventListener('click', function(){
        if (this.innerHTML == 'X' || this.innerHTML == 'O'){

        } else{
          hubConnection.invoke('Move', gameName, PLAYER, i, j);
        }
      });
      tr.append(td);
    }
    table.append(tr);
  }
  table.id = "myTable";
  div.classList.add('d-flex');
  div.classList.add('justify-content-center');
  div.append(table);
  document.querySelector('.play').append(div);
};

PLAYER = 'none';

hubConnection.on('Back', function(gameName){
  BackAndDelete(gameName);
});

hubConnection.on('InitXPlayer', function(gameName, tags){
  PLAYER = 'X';
  document.querySelector(".play > h1").innerHTML = "Opponent was found";
  CreateTable(gameName);
  const button = document.createElement("button");
  button.classList.add("btn");
  button.classList.add("btn-primary");
  button.innerHTML = "Back";
  const h2 = document.createElement('h2');
  h2.innerHTML = "Your move!";
  document.querySelector('.play').append(h2);
  document.querySelector('.play').append(button);
  button.addEventListener('click', function()
  {
    hubConnection.invoke("Back", gameName);
  });
});

hubConnection.on('InitOPlayer', function(gameName, tags)
{ 
  PLAYER = 'O'; 
  document.querySelector('.search').classList.add('hidden'); 
  document.querySelector('.play').classList.remove('hidden');
  let gameSection = document.querySelector('.play');
  let elem = document.createElement('h1');
      elem.innerHTML = "Opponent was found";
  gameSection.append(elem);
  CreateTable(gameName);
  const h2 = document.createElement('h2');
  h2.innerHTML = "Wait for opponent move!";
  document.querySelector('.play').append(h2);
  const button = document.createElement("button");
  button.classList.add("btn");
  button.classList.add("btn-primary");
  button.innerHTML = "Back";
  document.querySelector('.play').append(button);
  button.addEventListener('click', function()
  {
    hubConnection.invoke("Back", gameName);
  });
});

hubConnection.on("UpdateOther", function (gameName, tags){
  const li = document.querySelector('.game-' + gameName);
  if (li){
    li.remove();
  }
});
const pos = [
		[[0,0],[0,1],[0,2]], 
		[[1,0],[1,1],[1,2]], 
		[[2,0],[2,1],[2,2]], 
		[[0,0],[1,0],[2,0]], 
		[[0,1],[1,1],[2,1]], 
		[[0,2],[1,2],[2,2]], 
		[[0,0],[1,1],[2,2]], 
		[[2,0],[1,1],[0,2]], 
  ];

function Check(table, player){
  for (let i = 0; i < pos.length; i++){
    var ok = true;
    for (let j = 0; j < pos[i].length; j++){
      if (table.rows[pos[i][j][0]].cells[pos[i][j][1]].innerHTML != player) ok = false;
    }
    if (ok) {
      return true;
    }
  }
  return false;
}

function BackAndDelete(gameName){
  document.querySelector('#inputGameName').value = "";
  document.querySelector('#inputTags').value = "";
  document.querySelector('.search').classList.remove('hidden'); 
  document.querySelector('.play').classList.add('hidden');
  document.querySelector('.play').innerHTML = "";
  const li = document.querySelector('.game-' + gameName);
  if (li != undefined){
    li.remove();
  }
}

hubConnection.on('GoBack', function(winner, gameName){
  alert(winner + '- winner!');
  BackAndDelete(gameName);
});

function CheckDraw(table){
  let count = 0;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++){
      if (table.rows[i].cells[j].innerHTML) count++;
    }
  return count == 9;
}

hubConnection.on('Move', function(gameName, player, x, y){
  const table = document.querySelector('table');
  table.rows[x].cells[y].innerHTML = player;
  document.querySelector('.play > h2').innerHTML = (player == PLAYER)?"Wait for opponent move!":"Make your move!";
  let winX = Check(table, "X");
  let winY = Check(table, "O");
  let draw = CheckDraw(table);
  if (winX) hubConnection.invoke('GoBack', "X", gameName); 
  if (winY) hubConnection.invoke('GoBack', "O", gameName);
  if (draw) hubConnection.invoke('GoBack', "XO", gameName) 
});

hubConnection.on('DeleteGame', function(gameName){
  const li = document.querySelector('.game-' + gameName);
  if (li != undefined){
    li.remove();
  }
});

const createButton = document.querySelector('.create-game > button');
createButton.addEventListener("click", function(){
  let gameName = document.querySelector('#inputGameName').value;
  const tags = document.querySelector('#inputTags').value;
  hubConnection.invoke("Create", gameName, tags);
});

hubConnection.start();
hubConnection.invoke("Init");