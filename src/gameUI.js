
export class GameUI
{
    constructor(loadLevelCallback, initialScene)
    {
        this.loadMainMenu();
        this.loadLevelCallback = loadLevelCallback;
        this.loadLevel(initialScene);
    }

    hideMenu()
    {
        const menu = document.querySelector("#mainMenu");
        menu.style.display = "none";
        
    }
    showMenu()
    {
        const menu = document.querySelector("#mainMenu");
        menu.style.display = "flex";
    }
    loadLevel(levelIndex)
    {
        if(levelIndex == 0)
        {
            this.showMenu();
            this.loadLevelCallback(0);
        }
        else
        {
            this.hideMenu();
            this.loadLevelCallback(levelIndex);
        }
    }

    loadMainMenu()
    {
        const body = document.querySelector("body");
        body.appendChild(this.createMainMenu());
    }

    createMainMenu()
    {
        const mainMenu = document.createElement("div");
        mainMenu.id = "mainMenu";
        mainMenu.style.position = "absolute";
        mainMenu.style.top = "0";
        mainMenu.style.width = "100vw";
        mainMenu.style.height = "100vh";
        mainMenu.style.display = "flex";
        mainMenu.style.flexDirection = "column";
        mainMenu.style.justifyContent = "top";
        mainMenu.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        mainMenu.style.alignItems = "center";

        const title = document.createElement("h1");
        title.style.fontSize = "15vh";
        title.style.color = "white";
        title.textContent = "ŠKATLOGLAVEC";
        mainMenu.appendChild(title);

        const levelSelectDiv = document.createElement("div");
        levelSelectDiv.style.display = "flex";
        levelSelectDiv.style.gap = "3vh";
        levelSelectDiv.style.flexDirection = "row";
        levelSelectDiv.style.justifyContent = "center";
        levelSelectDiv.style.alignItems = "center";
        mainMenu.appendChild(levelSelectDiv);

        const level1Butt = document.createElement("button");
        level1Butt.textContent = "Level1";
        level1Butt.style.width = "100px";
        level1Butt.style.height = "100px";
        level1Butt.style.fontSize = "25px";
        level1Butt.addEventListener("click", () => {
            this.loadLevel(1);
        });

        const level2Butt = document.createElement("button");
        level2Butt.textContent = "Level2";
        level2Butt.style.width = "100px";
        level2Butt.style.height = "100px";
        level2Butt.style.fontSize = "25px";
        level2Butt.addEventListener("click", () => {
            this.loadLevel(2);
        });

        const level3Butt = document.createElement("button");
        level3Butt.textContent = "Level3";
        level3Butt.style.width = "100px";
        level3Butt.style.height = "100px";
        level3Butt.style.fontSize = "25px";
        level3Butt.addEventListener("click", () => {
            this.loadLevel(3);
        });

        const level4Butt = document.createElement("button");
        level4Butt.textContent = "Level4";
        level4Butt.style.width = "100px";
        level4Butt.style.height = "100px";
        level4Butt.style.fontSize = "25px";
        level4Butt.addEventListener("click", () => {
            this.loadLevel(4);
        });

        const level5Butt = document.createElement("button");
        level5Butt.textContent = "Level5";
        level5Butt.style.width = "100px";
        level5Butt.style.height = "100px";
        level5Butt.style.fontSize = "25px";
        level5Butt.addEventListener("click", () => {
            this.loadLevel(5);
        });

        levelSelectDiv.appendChild(level1Butt);
        levelSelectDiv.appendChild(level2Butt);
        levelSelectDiv.appendChild(level3Butt);
        levelSelectDiv.appendChild(level4Butt);
        levelSelectDiv.appendChild(level5Butt);
        
        mainMenu.appendChild(levelSelectDiv);

        return mainMenu;
    }
}
