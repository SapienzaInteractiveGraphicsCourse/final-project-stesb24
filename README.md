# final-project-stesb24
This project is an attempt to create a game inspired by the famous series of games **Worms**.\
Worms is a turn-based game where teams of worms in a 2D map try to shoot each other, after deciding the angle of aim and the "power" of the shot (thus creating a trajectory for the projectile). The last team to remain alive wins.\
Some Worms games were created in a 3D setting (exclusively 3D levels instead of the classical 2D), and in particular I will take insipration from one of them, *Worms 4: Mayhem*.\
\
The project uses **Three.js** and **Cannon.js**.

## How to play
You can play the game [here](https://sapienzainteractivegraphicscourse.github.io/final-project-stesb24/).
- Use **WASD** or arrow keys to move around or take the aim when in first person view;
- press **E** once to look from above, press again to go back to third person view;
- press **Q** once for first person camera, press again to switch back to third person view;
- hold **spacebar** to charge the shot up (the more you press, the further the bullet will go); release it to shoot.
After shooting, your turn ends and you can't act anymore. Some time after the projectile hits something or falls off the map, the next turn starts.

### Known issues
Sometimes the beginning of the first turn is slightly slow; just be patient and you will see that after that, the game works just fine.\
Collisions between the bullets and cylindric bodies are not always perfect, but I believe this is a problem of Cannon.js.