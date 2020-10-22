const tagContainer = document.querySelector('.tag-container');
const input = document.querySelector('.tag-container input');

let tags = [];

function createTag(label) {
  const div = document.createElement('div');
  div.setAttribute('class', 'tag');
  const span = document.createElement('span');
  span.innerHTML = label;
  const closeIcon = document.createElement('i');
  closeIcon.innerHTML = 'close';
  closeIcon.setAttribute('class', 'material-icons');
  closeIcon.setAttribute('data-item', label);
  div.appendChild(span);
  div.appendChild(closeIcon);
  return div;
}

function clearTags() {
  document.querySelectorAll('.tag').forEach(tag => {
    tag.parentElement.removeChild(tag);
  });
}

function addTags() {
  clearTags();
  tags.slice().reverse().forEach(tag => {
    tagContainer.prepend(createTag(tag));
  });
}

function GameContainsAllTags(game, tags){
    let currentGameTags = game.childNodes[3].childNodes[3].innerText; 
    for (let j = 0; j < tags.length; j++){
        console.log(tags[j]);
        if (currentGameTags.indexOf("#" + tags[j]+ ' ') == -1){
            return false;
        }
    }
    return true;
}

function UpdateGames(games, tags)
{    
     for (let i = 0; i < games.length; i++) {
        if (!GameContainsAllTags(games[i], tags)){
            console.log(games[i]);
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

input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      e.target.value.split(',').forEach(tag => {
        tags.push(tag);
      });
    addTags();
    input.value = '';
    let games = document.querySelectorAll('.game');
    UpdateGames(games, tags);
    } 
});
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'I') {
    const tagLabel = e.target.getAttribute('data-item');
    const index = tags.indexOf(tagLabel);
    tags = [...tags.slice(0, index), ...tags.slice(index+1)];
    addTags();    
    let games = document.querySelectorAll('.game');
    UpdateGames(games, tags);
  }
})

input.focus();

const hubConnection = new signalR.HubConnectionBuilder().
    withUrl('/games').
    build();

hubConnection.on("SelfJoin", function(gameName, tags, gameId){
});

function MakeElements(tags){
  let tagsElements = new Map();
  tags.forEach(tag => {
    tagsElements.set(tag, document.createElement(tag));
  });
  return tagsElements;
}

function AddGame(gameName, tags){
  const gamesUl = document.querySelector('.games');
  console.log('1');
  let _tags = ["li","img","div", "p", "h3", "button"];
  let elements = MakeElements(_tags);
  elements.get("p").innerHTML = tags;
  elements.get("p").classList.add("tags");
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
  elements.get('div').append(elements.get('p'));
  elements.get('div').append(elements.get('button'));
  elements.get('li').append(elements.get('img'));
  elements.get('li').append(elements.get('div'));
  console.log('99');
  gamesUl.append(elements.get('li'));
  console.log('100');
  elements.get('button').addEventListener("click", function (e){
    console.log(123);
    hubConnection.invoke("Join", gameName, tags);
    console.log(124);
  });
  console.log('101');
}

function MakeGameField(gameName, tags){  
  document.querySelector('.search').classList.add('hidden'); 
  document.querySelector('.play').classList.remove('hidden');
  console.log("Work");
  let gameSection = document.querySelector('.play');
  let elem = document.createElement('h1');
      elem.innerHTML = "Waiting your opponent";
  gameSection.append(elem);
}

hubConnection.on("OthersCreate", function(gameName, tags){
  AddGame(gameName, tags);
});

hubConnection.on("SelfCreate", function(gameName, stringTags){
  MakeGameField(gameName, tags);
});

hubConnection.on('InitXPlayer', function(gameName, tags){
  console.log('chlen');
  document.querySelector(".play > h1").innerHTML = "opponent was found";
});

hubConnection.on('InitOPlayer', function(gameName, tags)
{  
  console.log("Oplayer");
  document.querySelector('.search').classList.add('hidden'); 
  document.querySelector('.play').classList.remove('hidden');
  let gameSection = document.querySelector('.play');
  let elem = document.createElement('h1');
      elem.innerHTML = "Opponent was found";
  gameSection.append(elem);
});

hubConnection.on("UpdateOther", function (gameName, tags){
  console.log("Other players!");
  const li = document.querySelector('.game-' + gameName);
  if (li != undefined){
    li.remove();
  }
});

const createButton = document.querySelector('.create-game > button');
createButton.addEventListener("click", function(){
  let gameName = document.querySelector('#inputGameName').value;
  let stringTags = document.querySelector('#inputTags').value;
  console.log(9);
  hubConnection.invoke("Create", gameName, stringTags);
});
hubConnection.start();