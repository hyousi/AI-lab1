import React from 'react';

// TODO: style leaderboard
class LeaderBoard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: []
    }
  }

  componentDidMount() {
    fetch("http://localhost:8000/api/players")
        .then(response => {return response.json()})
        .then(jsonData => {
          this.setState({data: jsonData})
        })
  }

  render() {
    const listItems = this.state.data.map((item) =>
      <li>{Object.values(item).join(" ")}</li>
    );

    return (
        <div>
          LeaderBoard
          <ul>
            {listItems}
          </ul>
        </div>
    );
  }
}

export default LeaderBoard;