/**
 * Blockly Games: Accessible
 *
 * Copyright 2016 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Component that manages all game logic and rendering.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var musicGame = {};
musicGame.gameManager = {};
musicGame.gameManager.level = 1;
musicGame.gameManager.levelInstructions = {};
musicGame.gameManager.levelHints = {};
musicGame.gameManager.expectedPlayerLines = {};
musicGame.gameManager.levelInstructions[1] = [
    `Let us start by navigating to the toolbox and copying the 'play note C3'
    block onto the workspace.`];
musicGame.gameManager.levelInstructions[2] = [
    `Play the G3 note.`];
musicGame.gameManager.levelInstructions[3] = [
    `Play 2 G3 notes. Make sure the blocks are connected to each other.`
    ];
musicGame.gameManager.levelHints[3] = [`Each list in the workspace is a set of connected blocks. So if you have two blocks,
    each item number 1 of its own list, then those blocks are not connected.
    If you have two blocks, one item 1 of a list and one item 2 of a list, then they are connected.`,
    `Try to make use of the 'copy to Blockly clipboard' and 'paste above'/'paste below' options in the block menus.`];
musicGame.gameManager.expectedPlayerLines[1] = [
      [[36], 1],
    ];
musicGame.gameManager.expectedPlayerLines[2] = [
      [[43], 1],
    ];
musicGame.gameManager.expectedPlayerLines[3] = [
      [[43], 1],
      [[43], 1]
    ];
musicGame.gameManager.expectedBlockType = [undefined, 'music_play_note',
   'music_play_note', 'music_play_note'];
musicGame.gameManager.levelToolboxes=['', 'level1_ToolboxXml.xml',
  'level1_ToolboxXml.xml', 'level1_ToolboxXml.xml'];
musicGame.gameManager.maxLevelAllowed=1;

musicGame.gameManager.validateLevel = function(){
  var correct = true;
  var level = musicGame.gameManager.level;
  var expectedPlayerLine = new MusicLine();
  var topBlock = blocklyApp.workspace.topBlocks_[0];
  var errorMessage = 'Not quite! Try again!';

  //we should only report the earliest problem with their code
  var errorMessageChanged = false;

  expectedPlayerLine.setFromChordsAndDurations(
    musicGame.gameManager.expectedPlayerLines[level]);
  correct = correct && musicPlayer.doesPlayerLineEqual(expectedPlayerLine);
  if (!correct && !errorMessageChanged){
    errorMessage = 'Not quite! Are you playing the right note?'
    errorMessageChanged = true;
  }

  if (level != 3) {
    correct = correct && blocklyApp.workspace.topBlocks_.length == 1;
  } else {
    //if there are two topblocks that aren't connected, the error message should be the error message on line 112
    correct = correct && (blocklyApp.workspace.topBlocks_.length == 1
        || blocklyApp.workspace.topBlocks_.length == 2);
  }
  if (!correct && !errorMessageChanged) {
    errorMessage = 'Not quite! Are you playing the right number of blocks?'
    errorMessageChanged = true;
  }

  correct = correct && topBlock && topBlock.type ==
      musicGame.gameManager.expectedBlockType[level];
  if (!correct && !errorMessageChanged) {
    errorMessage = 'Not quite! Are you playing the right block?'
    errorMessageChanged = true;
  }

  if (level == 3) {
    var connection = topBlock.nextConnection.targetConnection;
    correct = correct && connection && connection.sourceBlock_ &&
        connection.sourceBlock_.type == musicGame.gameManager.expectedBlockType[level];
    if (!correct && !errorMessageChanged) {
      errorMessage = 'Not quite! Are your blocks connected?'
      errorMessageChanged = true;
    }
  }
  if (correct) {
    alert('Good job! You completed the level!');
    musicGame.gameManager.maxLevelAllowed = Math.min(musicGame.gameManager.maxLevelAllowed + 1, 3);
  } else {
    alert(errorMessage);
  }
}

musicGame.LevelNavigatorView = ng.core
  .Component({
    selector: 'level-navigator',
    template: `
    <h2>Current Level: Level {{currentLevelNumber}}</h2>
    <ul role="navigation" class="musicGameNavigation">
      <li *ngFor="#levelNumber of levelNumbers">
        <a *ngIf="hasReached(levelNumber)" href="./index.html?l={{levelNumber}}">
          Level {{levelNumber}}
        </a>
        <span *ngIf="!hasReached(levelNumber)">
          Level {{levelNumber}}
        </span>
      </li>
    </ul>
    `,
  })
  .Class({
    constructor: [function() {
      this.levelNumbers = Object.keys(musicGame.gameManager.levelInstructions);
      this.currentLevelNumber = location.search.split('l=')[1] || '1';
    }],
    hasReached: function(levelNumber) {
      return Number(levelNumber) <= Number(this.currentLevelNumber);
    }
  });

musicGame.LevelManagerView = ng.core
  .Component({
    selector: 'levelview',
    template: `
    <div role="main">
      <h3>Instructions</h3>
      <p *ngFor="#para of instructions">{{para}}</p>
      <h3 *ngIf="hints">Hints</h3>
      <p *ngFor="#para of hints">{{para}}</p>
      <blockly-app></blockly-app>
    </div>
    `,
    directives: [blocklyApp.AppView],
  })
  .Class({
    constructor: function() {
      this.level = musicGame.gameManager.level;
      var currentLevelNumber = location.search.split('l=')[1] || '1';
      musicGame.gameManager.level = currentLevelNumber;
      this.level = musicGame.gameManager.level;
      blocklyApp.workspace.clear();

      this.hints = musicGame.gameManager.levelHints[currentLevelNumber];
      this.instructions = musicGame.gameManager.levelInstructions[
          currentLevelNumber];
    }
  });
