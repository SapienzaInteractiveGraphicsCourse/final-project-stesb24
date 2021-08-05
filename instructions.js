import {menu} from "./menu.js";

function instructions() {
    document.body.innerHTML = "";

    const title = document.createElement("t");
    title.innerText = "How to play";
    title.style.marginTop = "20px";
    title.style.fontSize = "55px";
    document.body.appendChild(title);

    const intro = document.createElement("subtitle");
    intro.innerHTML =
    "Woborms is a two-player game where each player controls a team of robots; players alternate their turns, " +
    "each time giving commands to one of their robots. Your objective is to destroy the enemy team's robots!" +
    "<br><br>Here are the commands:"
    document.body.appendChild(intro);

    const list = document.createElement("subtitle");
    list.innerHTML =
    "<ul><li>move with W, A, S and D; if you are in first person view, use them to take the aim instead;</li>" +
    "<li>press E once to view the whole map from above, press again to go back to third person;</li>" +
    "<li>press Q once for the first person mode, from which you can take the aim and shoot; press again " +
    "to go back to third person;</li><li>while in first person view, hold SPACEBAR to charge up the shot (the more you " +
    "press, the further the bullet will go, up to a maximum power) and release it to shoot."
    list.style.textAlign = "justify";
    document.body.appendChild(list);

    const end = document.createElement("subtitle");
    end.innerHTML =
    "After shooting, your turn ends and you can't act anymore (but you can still look from above); the enemy team's " +
    "turn will start after a little while.<br><br>Each robot has three lives, and every time they are hit by a bullet " +
    "they lose one life. Hit a robot three times to deactivate it, but try not to shoot at your own robots!<br>" +
    "Be careful: bullets won't deal damage after hitting something, so you should aim straight to a robot. " +
    "Bounces are not valid!";
    document.body.appendChild(end);

    const backButton = document.createElement("button");
    backButton.setAttribute("class", "menu-button");
    backButton.innerText = "Back";
    backButton.style.backgroundColor = "purple";
    backButton.style.marginBottom = 0;
    backButton.onclick = menu;
    document.body.appendChild(backButton);
}

export {instructions};