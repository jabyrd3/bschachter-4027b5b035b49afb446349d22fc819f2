"use strict";
/* globals _, engine */
window.initGame = function () {
  console.log("initgame");
  // you're really better off leaving this line alone, i promise.
  const command =
    "5 3 \n 1 1 s\n ffffff\n 2 1 w \n flfffffrrfffffff\n 0 3 w\n LLFFFLFLFL";

  // this function parses the input string so that we have useful names/parameters
  // to define the playfield and robots for subsequent steps
  this.playfield;
  this.scents = [];
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

    return {
      bounds: inputArray[0],
      robos,
    };
  };

  // this function replaces the robos after they complete one instruction
  // from their commandset
  const tickRobos = (robos) => {
    console.log("tickrobos");

    const playingField = { x: this.playfield[0], y: this.playfield[1] };

    const isCommandRemaining = (robos) => {
      return robos.reduce((prev, curr) => {
        if (curr.command) {
          prev = curr.command.length > prev ? curr.command.length : prev;
        }

        return prev;
      }, 0);
    };

    if (!isCommandRemaining(robos)) {
      return robos;
    }

    // scent is left behind when robot dies

    // Left and Right change orientation.
    // Forward moves robot coords.

    // DONE North y + 1
    // DONE South y - 1
    // DONE West x - 1
    // DONE East x + 1

    // Left most char in the command stack. exec.
    //

    const move = (robo) => {
      let prevCords = { x: robo.x, y: robo.y };
      let cords = { x: robo.x, y: robo.y };

      if (robo.o === "n") {
        cords.y -= 1;
      } else if (robo.o === "s") {
        cords.y += 1;
      } else if (robo.o === "e") {
        cords.x += 1;
      } else if (robo.o === "w") {
        cords.x -= 1;
      }

      // Leave a scent and push off the board.
      // remove all remaining commands
      if (!isPositionInBounds(cords) && !isScentLeft(prevCords)) {
        this.scents.push(prevCords);
        robo = { scent: { ...prevCords, o: robo.o }, command: "" };
      }

      // If we're going to go off bounds but a scent is left
      // ignore the command and go to the next.
      if (isScentLeft(prevCords) && !isPositionInBounds(cords)) {
        return {
          ...robo,
          command: robo.command.substring(1),
        };
      }

      // Update cords and command
      robo = {
        ...robo,
        ...cords,
        command: robo.command.substring(1),
      };

      return robo;
    };

    const updateOrientation = (robo) => {
      const changeOrientation = () => {
        const orientation = ["n", "e", "s", "w"];
        let idx = orientation.indexOf(robo.o);
        if (command === "r") {
          idx = idx + 1 > orientation.length - 1 ? 0 : idx + 1;
        } else {
          idx = idx - 1 < 0 ? orientation.length - 1 : idx - 1;
        }

        return orientation[idx];
      };

      robo = {
        ...robo,
        o: changeOrientation(),
        command: robo.command.substring(1),
      };
      return robo;
    };

    const isPositionInBounds = ({ x, y }) => {
      return x >= 0 && x <= playingField.x && y >= 0 && y <= playingField.y;
    };

    const isScentLeft = ({ x, y }) => {
      //TODO
      // robots leave a robot “scent” that prohibits future robots from dropping off the world at the same grid point.
      // The scent is left at the last grid position the robot occupied before disappearing over the edge.
      // An instruction to move “off” the world from a grid point from which a robot has been previously lost is simply ignored by the current robot.

      return this.scents.some((scent) => {
        return scent.x === x && scent.y === y;
      });
    };

    for (let i = 0; i < robos.length; i++) {
      const command = robos[i].command.substring(0, 1);

      if (!command.length) {
        continue;
      }

      if (command === "f") {
        robos[i] = move(robos[i]);
      } else {
        robos[i] = updateOrientation(robos[i]);
      }
    }

    return robos;

    // //
    // // task #2
    // //
    // // in this function, write business logic to move robots around the playfield
    // // the 'robos' input is an array of objects; each object has 4 parameters.
    // // This function needs to edit each robot in the array so that its x/y coordinates
    // // and orientation parameters match the robot state after 1 command has been completed.
    // // Also, you need to remove the command the robot just completed from the command list.
    // // example input:
    // //
    // // robos[0] = {x: 2, y: 2, o: 'N', command: 'frlrlrl'}
    // //
    // //                   - becomes -
    // //
    // // robos[0] = {x: 2, y: 1, o: 'N', command: 'rlrlrl'}
    // //
    // // if a robot leaves the bounds of the playfield, it should be removed from the robos
    // // array. It should leave a 'scent' in it's place. If another robot–for the duration
    // // of its commandset–encounters this 'scent', it should refuse any commands that would
    // // cause it to leave the playfield.
    // // console.log(robos, "initial");
    // // return the mutated robos object from the input to match the new state
  };

  // mission summary function
  const missionSummary = (robos) => {
    //
    // task #3
    //
    // summarize the mission and inject the results into the DOM elements referenced in readme.md
    //

    const surviving = robos.filter((robo) => {
      return !robo.scent;
    });

    const lost = robos.filter((robo) => {
      return robo.scent;
    });

    document.getElementById("robots").innerHTML = `${surviving.map((robo) => {
      return `<li>Position: ${robo.x}, ${
        robo.y
      } | Orientation: ${robo.o.toUpperCase()}</li>`;
    })}`;

    document.getElementById("lostRobots").innerHTML = `${lost.map((robo) => {
      return `<li> I died going ${robo.scent.o.toUpperCase()} from coordinates: ${
        robo.scent.x
      }, ${robo.scent.y}</li>`;
    })}`;
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
