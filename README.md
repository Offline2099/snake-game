# Snake

## Project Description

A mini-game based on the classic Snake game. The user controls a snake that moves around and must collect food while avoiding obstacles or enemies. 

* The game has 20 levels, with gradually increasing difficulty. A new level is unlocked after the previous one is finished. Once completed, each level can be replayed. Best scores and completion times are saved.

* New types of food, enemies, and obstacles are introduced as the game progresses. More complex mechanics, such as portals, appear later in the game. Some levels are more like logical puzzles that require a certain strategy.

* Levels are created with an editor that allows to place available assets onto the game space and set various parameters before saving the data as JSON. Existing levels can also be loaded and edited that way.

* Backgrounds are procedurally generated using an approach similar to drawing Voronoi diagrams.

* While Angular is not the best environment for creating video games, it was an interesting and fun experience to attempt a project like this.

## Technical Information

This project is made with Angular.

* To run the app in the development mode, run `ng serve` in the project directory. Open [http://localhost:4200](http://localhost:4200) to view it in the browser. The page will reload if you make edits.

* To build the app in the production mode, run `ng build` in the project directory. The app will be saved to the `dist/` directory.