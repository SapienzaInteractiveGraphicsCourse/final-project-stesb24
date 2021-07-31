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

    const newGameButton = document.createElement("button");
    newGameButton.setAttribute("class", "button-class");
    newGameButton.innerText = "New game";
    newGameButton.onclick = main;
    document.body.appendChild(newGameButton);

    const howToPlayButton = document.createElement("button");
    howToPlayButton.setAttribute("class", "button-class");
    howToPlayButton.innerText = "How to play";
    howToPlayButton.style.backgroundColor = "blue";
    howToPlayButton.style.marginBottom = 0;
    howToPlayButton.onclick = instructions;
    document.body.appendChild(howToPlayButton);
}

export {menu};