import {main} from "./game.js";
import {instructions} from "./instructions.js";

function menu() {
    document.body.innerHTML = "";

    const title = document.createElement("t");
    title.innerText = "WOBORMS";
    document.body.appendChild(title);

    const subTitle = document.createElement("subtitle");
    subTitle.innerText = "A game inspired by the Worms series by Team17";
    document.body.appendChild(subTitle);

    const newGame = document.createElement("button");
    newGame.setAttribute("class", "button-class");
    newGame.innerText = "New game";
    newGame.onclick = main;
    document.body.appendChild(newGame);

    const howToPlay = document.createElement("button");
    howToPlay.setAttribute("class", "button-class");
    howToPlay.innerText = "How to play";
    howToPlay.style.backgroundColor = "blue";
    howToPlay.style.marginBottom = 0;
    howToPlay.onclick = instructions;
    document.body.appendChild(howToPlay);
}

export {menu};