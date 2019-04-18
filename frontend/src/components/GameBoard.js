import React from 'react';
import PropTypes from 'prop-types';
import Cell from './Cell';
import {Button} from 'reactstrap';

// TODO: clean code
// TODO: add point recorder
class GameBoard extends React.Component {
  state = {
    boardData: this.initBoardData(
        this.props.height,
        this.props.width,
        this.props.mines),
    gameStatus: 'Game in progress',
    gameOver: false,
    mineCount: this.props.mines,
  };

  /* Helper Functions */

  // get random number given a dimension
  static getRandomNumber(dimension) {
    return Math.floor((Math.random() * 1000) + 1) % dimension;
  }

  // get mines
  getMines(data) {
    let mineArray = [];

    data.map(datarow => {
      datarow.map((dataitem) => {
        if (dataitem.isMine) {
          mineArray.push(dataitem);
        }
      });
    });

    return mineArray;
  }

  // get Flags
  getFlags(data) {
    let mineArray = [];

    data.map(datarow => {
      datarow.map((dataitem) => {
        if (dataitem.isFlagged) {
          mineArray.push(dataitem);
        }
      });
    });

    return mineArray;
  }

  // get Hidden cells
  getHidden(data) {
    let mineArray = [];

    data.map(datarow => {
      datarow.map((dataitem) => {
        if (!dataitem.isRevealed) {
          mineArray.push(dataitem);
        }
      });
    });

    return mineArray;
  }

  static createEmptyArray(height, width) {
    let data = [];

    for (let i = 0; i < height; i++) {
      data.push([]);
      for (let j = 0; j < width; j++) {
        data[i][j] = {
          x: i,
          y: j,
          isMine: false,
          neighbour: 0,
          isRevealed: false,
          isEmpty: false,
          isFlagged: false,
        };
      }
    }
    return data;
  }

  // Gets initial board data
  initBoardData(height, width, mines) {
    let data = GameBoard.createEmptyArray(height, width);
    data = GameBoard.plantMines(data, height, width, mines);
    data = this.getNeighbours(data, height, width);
    return data;
  }

  // plant mines on the board
  static plantMines(data, height, width, mines) {
    let randomx, randomy, minesPlanted = 0;

    while (minesPlanted < mines) {
      randomx = GameBoard.getRandomNumber(width);
      randomy = GameBoard.getRandomNumber(height);
      if (!(data[randomx][randomy].isMine)) {
        data[randomx][randomy].isMine = true;
        minesPlanted++;
      }
    }

    return (data);
  }

  // get number of neighbouring mines for each board cell
  getNeighbours(data, height, width) {
    let updatedData = data;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (data[i][j].isMine !== true) {
          let mine = 0;
          const area = this.traverseBoard(data[i][j].x, data[i][j].y, data);
          area.map(value => {
            if (value.isMine) {
              mine++;
            }
          });
          if (mine === 0) {
            updatedData[i][j].isEmpty = true;
          }
          updatedData[i][j].neighbour = mine;
        }
      }
    }

    return (updatedData);
  };

  // looks for neighbouring cells and returns them
  traverseBoard(x, y, data) {
    const el = [];

    //up
    if (x > 0) {
      el.push(data[x - 1][y]);
    }

    //down
    if (x < this.props.height - 1) {
      el.push(data[x + 1][y]);
    }

    //left
    if (y > 0) {
      el.push(data[x][y - 1]);
    }

    //right
    if (y < this.props.width - 1) {
      el.push(data[x][y + 1]);
    }

    // top left
    if (x > 0 && y > 0) {
      el.push(data[x - 1][y - 1]);
    }

    // top right
    if (x > 0 && y < this.props.width - 1) {
      el.push(data[x - 1][y + 1]);
    }

    // bottom right
    if (x < this.props.height - 1 && y < this.props.width - 1) {
      el.push(data[x + 1][y + 1]);
    }

    // bottom left
    if (x < this.props.height - 1 && y > 0) {
      el.push(data[x + 1][y - 1]);
    }

    return el;
  }

  // reveals the whole board
  revealBoard() {
    let updatedData = this.state.boardData;
    updatedData.map((datarow) => {
      datarow.map((dataitem) => {
        dataitem.isRevealed = true;
      });
    });
    this.setState({
      boardData: updatedData,
    });
  }

  /* reveal logic for empty cell */
  revealEmpty(x, y, data) {
    let area = this.traverseBoard(x, y, data);
    area.map(value => {
      if (!value.isFlagged && !value.isRevealed &&
          (value.isEmpty || !value.isMine)) {
        data[value.x][value.y].isRevealed = true;
        if (value.isEmpty) {
          this.revealEmpty(value.x, value.y, data);
        }
      }
    });
    return data;
  }

  renderBoard(data) {
    return data.map((datarow) => {
      return datarow.map((dataitem) => {
        return (
            <div key={dataitem.x * datarow.length + dataitem.y}>
              <Cell
                  onClick={() => this.handleCellClick(dataitem.x, dataitem.y)}
                  cMenu={(e) => this.handleContextMenu(e, dataitem.x,
                      dataitem.y)}
                  value={dataitem}
              />
              {(datarow[datarow.length - 1] === dataitem) ?
                  <div className="clear"/> :
                  ''}
            </div>);
      });
    });
  }

  /* Handle User Events */

  handleCellClick(x, y) {

    // check if revealed. return if true.
    if (this.state.boardData[x][y].isRevealed ||
        this.state.boardData[x][y].isFlagged) return null;

    // check if mine. game over if true
    if (this.state.boardData[x][y].isMine) {
      this.setState({
        gameStatus: 'You Lost.',
        gameOver: true,
      });
      this.revealBoard();
    }

    let updatedData = this.state.boardData;
    updatedData[x][y].isFlagged = false;
    updatedData[x][y].isRevealed = true;

    if (updatedData[x][y].isEmpty) {
      updatedData = this.revealEmpty(x, y, updatedData);
    }

    if (this.getHidden(updatedData).length === this.props.mines) {
      this.setState({
        mineCount: 0,
        gameStatus: 'You Win.',
        gameOver: true,
      });
      this.revealBoard();
    }

    this.setState({
      boardData: updatedData,
      mineCount: this.props.mines - this.getFlags(updatedData).length,
    });
  }

  handleContextMenu(e, x, y) {
    e.preventDefault();
    let updatedData = this.state.boardData;
    let mines = this.state.mineCount;

    // check if already revealed
    if (updatedData[x][y].isRevealed) return;

    if (updatedData[x][y].isFlagged) {
      updatedData[x][y].isFlagged = false;
      mines++;
    } else {
      updatedData[x][y].isFlagged = true;
      mines--;
    }

    if (mines === 0) {
      const mineArray = this.getMines(updatedData);
      const FlagArray = this.getFlags(updatedData);
      if (JSON.stringify(mineArray) === JSON.stringify(FlagArray)) {
        this.setState({
          mineCount: 0,
          gameStatus: 'You Win.',
          gameOver: true,
        });
        this.revealBoard();
      }
    }

    this.setState({
      boardData: updatedData,
      mineCount: mines,
    });
  }

  handleRestartButtonClick() {
    this.setState({
      boardData: this.initBoardData(this.props.height, this.props.width,
          this.props.mines),
      gameStatus: 'Game in progress',
      gameOver: false,
      mineCount: this.props.mines,
    });
  }

  handleInferButtonClick() {
    fetch('http://localhost:8000/infer', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state.boardData),
    }).then(response => {
      return response.json();
    }).then(jsonData => {
      console.log(jsonData.board_data);
      this.setState({boardData: jsonData.board_data});
    });

  }

  render() {
    const startColor = {background: '#19a0d9'};
    const endColor = {background: '#ff4757'};

    return (
        <div className="board">
          <div className="game-info"
               style={this.state.gameOver ? endColor : startColor}>
            <span
                className="info">Mines remaining: {this.state.mineCount}</span>
            <h1 className="info">{this.state.gameStatus}</h1>
          </div>
          {
            this.renderBoard(this.state.boardData)
          }
          <div className="game-menu">
            <Button color="success" className="game-menu-button"
                    onClick={() => this.handleRestartButtonClick()}>Restart</Button>
            <Button color="info" className="game-menu-button"
                    onClick={() => this.handleInferButtonClick()}>Infer</Button>
          </div>
        </div>
    );
  }
}

GameBoard.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
  mines: PropTypes.number,
};

export default GameBoard;