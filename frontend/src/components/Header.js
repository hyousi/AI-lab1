import React from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavLink,
} from 'reactstrap';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      navItems: {
        'Lab1': '/lab1',
        'Lab2': '/lab2',
        'LeaderBoard': '/leaderboard'
      },
    };
  }

  toggle() {
    this.setState({isOpen: !this.state.isOpen});
  }

  render() {
    const items = this.state.navItems;

    return (
        <div>
          <Navbar color="primary" dark expand="md">
            <NavbarBrand href="/">AI Lab</NavbarBrand>
            <NavbarToggler onClick={this.toggle}/>
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
                {Object.entries(items).map(item => {
                  return (
                      <NavLink
                          href={item[1]}
                          active={window.location.pathname === item[1]}
                      >
                        {item[0]}
                      </NavLink>
                  );
                })}
              </Nav>
            </Collapse>
          </Navbar>
        </div>
    );
  }
}

export default Header;