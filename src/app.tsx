import * as React from 'react';
// import './css/App.css';
import { Collapse, DropdownItem, DropdownMenu, DropdownToggle, Navbar, NavbarBrand, Nav, NavItem, NavLink, UncontrolledDropdown } from 'reactstrap';


const Navbar2 = () => {
  return (
    <Navbar color="light" light expand="md">
      <NavbarBrand href="/">reactstrap</NavbarBrand>
      <Collapse isOpen={true} navbar>
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink href="/components/">Components</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="https://github.com/reactstrap/reactstrap">GitHub</NavLink>
          </NavItem>
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              Options
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem>
                Option 1
              </DropdownItem>
              <DropdownItem>
                Option 2
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem>
                Reset
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
      </Collapse>
    </Navbar>
  );
}

export class App extends React.Component<undefined, undefined> {
  render() {
    return (
      <div>
        <Navbar2/>
        <h2>Welcome to React with Typescript!</h2>
      </div>
    );
  }
}
