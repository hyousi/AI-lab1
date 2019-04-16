import React from 'react';
import GameBoard from './GameBoard'

/**
 * The Game component stores the height and width of the board
 * along with number of mines in its state which is later on passed
 * as props to Board component.
 */
class GameContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 8,
      width: 8,
      mines: 10,
    };
  }

  render() {
    const {height, width, mines} = this.state;
    return (
        <div className="game">
          <GameBoard height={height} width={width} mines={mines} />
        </div>
    );
  }
}

export default GameContainer;