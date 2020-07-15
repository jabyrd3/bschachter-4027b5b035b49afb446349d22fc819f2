"use strict";
/* globals _, engine */
window.initGame = function () {
  console.log("initgame");
  // you're really better off leaving this line alone, i promise.
  const command =
    "5 3 \n 1 1 s\n ffffff\n 2 1 w \n flfffffrrfffffff\n 0 3 w\n LLFFFLFLFL";

  const command2 = "5 3 \n 1 1 s\n ffffff\n 2 1 w \n flfffffrrfffffff\n";

  // this function parses the input string so that we have useful names/parameters
  // to define the playfield and robots for subsequent steps
  this.playfield;
  this.scent = { x: [], y: [] };
  const parseInput = (input) => {
    //
    // task #1
    //
    // replace the 'parsed' variable below to be the string 'command' parsed into an object we can pass to genworld();
    // genworld expects an input object in the form { 'bounds': [3, 8], 'robos': [{x: 2, y: 1, o: 'W', command: 'rlrlff'}]}
    // where bounds represents the southeast corner of the plane and each robos object represents the
    // x,y coordinates of a robot and o is a string representing their orientation. a sample object is provided below
    //

    // replace this with a correct object
    // first two numbers are initial coords.
    //

    const instructionBoundLength = 50;
    let robos = [];
    let temp;

    const inputArray = input.split("\n").map((e) =>
      e
        .replace(/\s/g, "")
        .split("")
        .map((i) => (Number.isNaN(Number(i)) ? i : Number(i)))
    );

    for (let index = 1; index < inputArray.length; index++) {
      let el = inputArray[index];
      if (index % 2 == 1) {
        temp = { x: el[0], y: el[1], o: el[2] };
      }

      if (index % 2 === 0) {
        temp = { ...temp, command: el.join("").toLowerCase() };
        robos.push(temp);
      }
    }
    this.playfield = inputArray[0];

    console.log(robos, "final robos");
    return {
      bounds: inputArray[0],
      robos,
    };
  };

  // this function replaces the robos after they complete one instruction
  // from their commandset
  const tickRobos = (robos) => {
    console.log("tickrobos");
    //
    // task #2
    //
    // in this function, write business logic to move robots around the playfield
    // the 'robos' input is an array of objects; each object has 4 parameters.
    // This function needs to edit each robot in the array so that its x/y coordinates
    // and orientation parameters match the robot state after 1 command has been completed.
    // Also, you need to remove the command the robot just completed from the command list.
    // example input:
    //
    // robos[0] = {x: 2, y: 2, o: 'N', command: 'frlrlrl'}
    //
    //                   - becomes -
    //
    // robos[0] = {x: 2, y: 1, o: 'N', command: 'rlrlrl'}
    //
    // if a robot leaves the bounds of the playfield, it should be removed from the robos
    // array. It should leave a 'scent' in it's place. If another robot–for the duration
    // of its commandset–encounters this 'scent', it should refuse any commands that would
    // cause it to leave the playfield.

    // console.log(robos, "initial");

    // return the mutated robos object from the input to match the new state
    for (let index = 0; index < robos.length; index++) {
      let robo = robos[index];
      let command = robos[index].command;
      let commandArray = robo.command.length ? robo.command.split("") : [];
      console.log(commandArray, index);
      let bounds = { x: this.playfield[0], y: this.playfield[1] };
      let currentCommand = commandArray.length && [commandArray.shift()];
      let nextOperation =
        commandArray.length > 1 ? command.charAt(1) : command.charAt(0);
      let nextCommandSequence =
        command.length > 1 ? command.substring(1) : command.substring(0);

      const moveNorth = (x, y) => ({ x, y: y + 1 });
      const moveSouth = (x, y) => ({ x, y: y - 1 });
      const moveEast = (x, y) => ({ x: x - 1, y });
      const moveWest = (x, y) => ({ x: x  1, y });

      const checkBounds = ({ x, y }) => {
        return x >= 0 && x <= bounds.x && y >= 0 && y <= bounds.y;
      };

      const handleforwardMove = (directionCb, { x, y }) => {
        let isMoveOnBoard = checkBounds({ ...directionCb(x, y) });

        if (isMoveOnBoard) {
          robos[index] = {
            ...robos[index],
            ...directionCb(x, y),
            command: nextCommandSequence,
          };
        } else if (
          !isMoveOnBoard &&
          (this.scent.x.indexOf(x) > -1 || this.scent.y.indexOf(y) > -1)
        ) {
          robos[index] = {
            ...robos[index],
            command: nextCommandSequence,
          };
        } else {
          if (robos[index].o === "n" || robos[index].o === "s") {
            this.scent.y.push(y);
          }

          if (robos[index].o === "w" || robos[index].o === "e") {
            this.scent.x.push(x);
          }

          robos[index] = { scent: { x, y }, command: "" };
        }
      };

      let orientation = ["n", "e", "s", "w"];

      switch (currentCommand && currentCommand[0]) {
        case "f": {
          if (robo.o === "n") {
            handleforwardMove(moveNorth, robo);
          } else if (robo.o === "s") {
            handleforwardMove(moveSouth, robo);
          } else if (robo.o === "w") {
            handleforwardMove(moveWest, robo);
          } else if (robo.o === "e") {
            handleforwardMove(moveEast, robo);
          }
          break;
        }
        case "r": {
          let idx = orientation.indexOf(robo.o);
          idx = idx + 1 > orientation.length - 1 ? 0 : idx + 1;

          robos[index] = {
            x: robos[index].x,
            y: robos[index].y,
            o: orientation[idx],
            command: nextCommandSequence,
          };
          break;
        }
        case "l":
          {
            let idx = orientation.indexOf(robo.o);
            idx = idx - 1 < 0 ? orientation.length - 1 : idx - 1;

            robos[index] = {
              x: robos[index].x,
              y: robos[index].y,
              o: orientation[idx],
              command: nextCommandSequence,
            };
          }
          break;
      }
      console.log(index, { ...robos[index] });
      debugger;
    }

    return robos;
  };

  // mission summary function
  const missionSummary = (robos) => {
    //
    // task #3
    //
    // summarize the mission and inject the results into the DOM elements referenced in readme.md
    //
    console.log({ robos });
    return robos;
  };

  // leave this alone please
  return {
    parse: parseInput,
    tick: tickRobos,
    summary: missionSummary,
    command: command,
  };
};
