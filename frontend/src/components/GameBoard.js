import React from 'react';
import Cell from './Cell';
import {Button} from 'reactstrap';

function getRandomNumber(dimension) {
  return Math.floor((Math.random() * 1000) + 1) % dimension;
}

// TODO: add point recorder
class GameBoard extends React.Component {
  state = {
    boardData: this.initBoardData(
        this.props.row,
        this.props.col,
        this.props.mines),
    gameStatus: 'Game in progress',
    gameOver: false,
    mineCount: this.props.mines,
  };

  /* Helper Functions */

  // get mines
  getMines(data) {
    let mineArray = [];

    data.forEach(dataRow => {
      dataRow.forEach((dataItem) => {
        if (dataItem.isMine) {
          mineArray.push(dataItem);
        }
      });
    });

    return mineArray;
  }

  // get Flags
  getFlags(data) {
    let mineArray = [];

    data.forEach(dataRow => {
      dataRow.forEach((dataItem) => {
        if (dataItem.isFlagged) {
          mineArray.push(dataItem);
        }
      });
    });

    return mineArray;
  }

  // get Hidden cells
  getHidden(data) {
    let mineArray = [];

    data.forEach(dataRow => {
      dataRow.forEach((dataItem) => {
        if (!dataItem.isRevealed) {
          mineArray.push(dataItem);
        }
      });
    });

    return mineArray;
  }

  // Gets initial board data
  initBoardData(row, col, mines) {
    
    let data = [];
    // create empty array 
    for (let i = 0; i < row; i++) {
      data.push([]);
      for (let j = 0; j < col; j++) {
        data[i][j] = {
          row: i,
          col: j,
          isMine: false,
          neighbour: 0,
          isRevealed: false,
          isEmpty: false,
          isFlagged: false,
        };
      }
    }

    // plant mines
    let randomRow, randomCol, minesPlanted = 0;

    while (minesPlanted < mines) {
      randomRow = getRandomNumber(row);
      randomCol = getRandomNumber(col);
      if (!(data[randomRow][randomCol].isMine)) {
        data[randomRow][randomCol].isMine = true;
        minesPlanted++;
      }
    }

    // calc number of neighbouring mines for each cell
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        if (!data[i][j].isMine) {
          let count = 0;
          const area = this.traverseBoard(data[i][j].row, data[i][j].col, data);
          area.forEach(value => {
            if (value.isMine) {
              count++;
            }
          });
          if (count === 0) {
            data[i][j].isEmpty = true;
          }
          data[i][j].neighbour = count;
        }
      }
    }
    return data;
  }

  // looks for neighbouring cells and returns them
  traverseBoard(rowIndex, colIndex, data) {
    const el = [];

    //up
    if (rowIndex > 0) {
      el.push(data[rowIndex - 1][colIndex]);
    }

    //down
    if (rowIndex < this.props.row - 1) {
      el.push(data[rowIndex + 1][colIndex]);
    }

    //left
    if (colIndex > 0) {
      el.push(data[rowIndex][colIndex - 1]);
    }

    //right
    if (colIndex < this.props.col - 1) {
      el.push(data[rowIndex][colIndex + 1]);
    }

    // top left
    if (rowIndex > 0 && colIndex > 0) {
      el.push(data[rowIndex - 1][colIndex - 1]);
    }

    // top right
    if (rowIndex > 0 && colIndex < this.props.col - 1) {
      el.push(data[rowIndex - 1][colIndex + 1]);
    }

    // bottom right
    if (rowIndex < this.props.row - 1 && colIndex < this.props.col - 1) {
      el.push(data[rowIndex + 1][colIndex + 1]);
    }

    // bottom left
    if (rowIndex < this.props.row - 1 && colIndex > 0) {
      el.push(data[rowIndex + 1][colIndex - 1]);
    }

    return el;
  }

  // reveals the whole board
  revealBoard() {
    this.state.boardData.forEach((dataRow) => {
      dataRow.forEach((dataItem) => {
        dataItem.isRevealed = true;
      });
    });
  }

  /* reveal logic for empty cell */
  revealEmpty(rowIndex, colIndex, data) {
    let area = this.traverseBoard(rowIndex, colIndex, data);
    area.forEach(value => {
      if (!value.isFlagged && !value.isRevealed && (value.isEmpty || !value.isMine)) {
        data[value.row][value.col].isRevealed = true;
        
        if (value.isEmpty) {
          this.revealEmpty(value.row, value.col, data);
        }
      }
    });
  }

  renderBoard(data) {
    return data.map((dataRow) => {
      return dataRow.map((dataItem) => {
        return (
            <div key={dataItem.row * dataRow.length + dataItem.col}>
              <Cell
                  onClick={() => this.handleCellClick(dataItem.row, dataItem.col)}
                  cMenu={(e) => this.handleContextMenu(e, dataItem.row, dataItem.col)}
                  value={dataItem}
              />
              {(dataRow[dataRow.length - 1] === dataItem) ?
                  <div className="clear"/> :
                  ''}
            </div>);
      });
    });
  }

  /* Handle User Events */

  handleCellClick(rowIndex, colIndex) {

    // if revealed or flagged, do nothing.
    if (this.state.boardData[rowIndex][colIndex].isRevealed ||
        this.state.boardData[rowIndex][colIndex].isFlagged) return null;

    // if is mine, game over.
    if (this.state.boardData[rowIndex][colIndex].isMine) {
      this.setState({
        gameStatus: 'You Lost.',
        gameOver: true,
      });
      this.revealBoard();
    }

    let updatedData = this.state.boardData;
    updatedData[rowIndex][colIndex].isFlagged = false;
    updatedData[rowIndex][colIndex].isRevealed = true;

    if (updatedData[rowIndex][colIndex].isEmpty) {
      this.revealEmpty(rowIndex, colIndex, updatedData);
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

  handleContextMenu(e, rowIndex, colIndex) {
    e.preventDefault();
    let updatedData = this.state.boardData;
    let mines = this.state.mineCount;

    // if already revealed, do nothing.
    if (updatedData[rowIndex][colIndex].isRevealed) return null;
    // flag or cancel flag this cell.
    if (updatedData[rowIndex][colIndex].isFlagged) {
      updatedData[rowIndex][colIndex].isFlagged = false;
      mines++;
    } else {
      updatedData[rowIndex][colIndex].isFlagged = true;
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
      boardData: this.initBoardData(this.props.row, this.props.col,
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

export default GameBoard;