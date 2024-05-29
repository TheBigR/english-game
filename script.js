import { dataSets } from "./data.js";
import { parentDashboardPassword } from "./password.js";

let gameType = "letters";
let firstBox = null;
let mistakes = 0;
let mistakeLimit = parseInt(localStorage.getItem("mistakeLimit")) || 3; // Load mistake limit from local storage or default to 3
let matchedPairs = [];
let totalPairs = 0;
let userName = "";

document.getElementById("reset-btn").addEventListener("click", resetGame);
document.getElementById("game-type").addEventListener("change", setGameType);
document.getElementById("start-game-btn").addEventListener("click", startGame);
document
  .getElementById("parent-dashboard-btn")
  .addEventListener("click", showPasswordPrompt);

function populateGameTypeDropdown() {
  const gameTypeSelect = document.getElementById("game-type");
  gameTypeSelect.innerHTML = ""; // Clear existing options
  Object.keys(dataSets).forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = dataSets[key].name;
    gameTypeSelect.appendChild(option);
  });
  gameTypeSelect.value = gameType; // Set default game type
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function resetGame() {
  mistakes = 0;
  matchedPairs = [];
  document.getElementById("mistakes-count").innerText = mistakes;
  document.getElementById("mistakes-limit-display").innerText = mistakeLimit; // Display the current mistake limit
  firstBox = null;
  const letterContainer = document.getElementById("letter-container");
  const footerContainer = document.getElementById("footer-container");
  letterContainer.innerHTML = "";
  footerContainer.innerHTML = "";
  const pairs = dataSets[gameType].pairs;
  totalPairs = pairs.length;
  updatePairsLeftCount();
  const randomizedPairs = [...pairs];
  shuffle(randomizedPairs);
  const letters = randomizedPairs.flatMap((pair) => [
    `<div class="box" data-pair="${pair.upper}" data-color="${
      pair.color || ""
    }">${pair.upper}</div>`,
    `<div class="box" data-pair="${pair.upper}" data-color="${
      pair.color || ""
    }">${pair.lower}</div>`,
  ]);
  shuffle(letters);
  letterContainer.innerHTML = letters.join("");
  placeBoxes();
}

function placeBoxes() {
  const boxes = document.querySelectorAll(".box");
  const grid = new Set();

  function getRandomPosition() {
    const x = Math.floor(Math.random() * 10) * 10;
    const y = Math.floor(Math.random() * 6) * 12; // Increased vertical spacing
    return `${x}-${y}`;
  }

  boxes.forEach((box) => {
    let position;
    do {
      position = getRandomPosition();
    } while (grid.has(position));

    grid.add(position);
    const [x, y] = position.split("-").map(Number);
    box.style.left = `${x}%`;
    box.style.top = `${y}%`;
  });
}

function setGameType() {
  gameType = document.getElementById("game-type").value;
  resetGame();
}

function updatePairsLeftCount() {
  const pairsLeft = totalPairs - matchedPairs.length;
  document.getElementById("pairs-left-count").innerText = pairsLeft;
}

document
  .getElementById("letter-container")
  .addEventListener("click", function (event) {
    const target = event.target;
    if (target.classList.contains("box")) {
      if (target === firstBox) {
        target.style.backgroundColor = "";
        firstBox = null;
      } else if (!firstBox) {
        firstBox = target;
        target.style.backgroundColor = "#ADD8E6";
      } else {
        if (
          firstBox !== target &&
          firstBox.getAttribute("data-pair") ===
            target.getAttribute("data-pair")
        ) {
          const color = firstBox.getAttribute("data-color");
          firstBox.style.backgroundColor = "#90EE90";
          target.style.backgroundColor = "#90EE90";
          setTimeout(() => {
            moveToFooter(firstBox, target, color);
            firstBox = null;
          }, 1500);
        } else {
          mistakes++;
          document.getElementById("mistakes-count").innerText = mistakes;
          firstBox.style.backgroundColor = "#FF6347";
          target.style.backgroundColor = "#FF6347";
          setTimeout(() => {
            firstBox.style.backgroundColor = "";
            target.style.backgroundColor = "";
            firstBox = null;
          }, 1000);
        }
      }
    }
  });

function moveToFooter(element1, element2, color) {
  const pair = {
    text: `${element1.innerText} - ${element2.innerText}`,
    color: color,
  };
  matchedPairs.push(pair);
  matchedPairs.sort((a, b) => a.text.localeCompare(b.text));
  updatePairsLeftCount();

  const footerContainer = document.getElementById("footer-container");
  footerContainer.innerHTML = "";
  matchedPairs.forEach((pair) => {
    const pairContainer = document.createElement("div");
    pairContainer.classList.add("box");
    pairContainer.style.backgroundColor = pair.color || "#90EE90";
    pairContainer.style.width = "auto"; // Adjust width for word pairs
    pairContainer.innerText = pair.text;
    footerContainer.appendChild(pairContainer);
  });

  element1.remove();
  element2.remove();
}

function startGame() {
  const nameInput = document.getElementById("user-name");
  userName = nameInput.value.trim();
  if (userName === "") {
    alert("Please enter your name.");
    return;
  }
  document.getElementById("name-modal").style.display = "none";
  document.getElementById("user-name-display").innerText = userName;
  resetGame();
}

function showNameModal() {
  document.getElementById("name-modal").style.display = "block";
}

function showPasswordPrompt() {
  const password = prompt("Enter the password to access the parent dashboard:");
  if (password === parentDashboardPassword) {
    window.location.href = "dashboard.html";
  } else {
    alert("Incorrect password.");
  }
}

populateGameTypeDropdown();
document.getElementById("mistakes-limit-display").innerText = mistakeLimit; // Display the current mistake limit
showNameModal();
