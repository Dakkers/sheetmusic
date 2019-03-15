import * as React from 'react';
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown
} from 'reactstrap';
import { createStore } from 'redux'
import { Provider as ReduxProvider } from 'react-redux'
import { connect } from 'react-redux'

import rootReducer from './js/reducers'
import { toggleModal } from './js/actions'

import SettingsModal from './js/components/SettingsModal';
import Staff from './js/components/Staff';

const store = createStore(rootReducer)

const Navbar2 = (props) => {
  return (
    <Navbar color="light" light expand="sm">
      <Collapse isOpen={true} navbar>
        <Nav className="mr-auto" navbar>
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

const VisibleNavbar2 = connect(
  null,
  (dispatch) => ({
    toggleModal: (val: boolean) => dispatch(toggleModal(val))
  })
)(Navbar2)

class App extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <VisibleNavbar2/>

        <SettingsModal/>

        <Staff/>
      </div>
    );
  }

  componentDidMount () {
    this.listenForMIDIDevices();
  }

  listenForMIDIDevices () {
    navigator.requestMIDIAccess()
    .then(function(access) {
      console.log('access', access);
      console.log(Array.from(access.inputs.values()));
      access.onstatechange = function(e) {
        console.log(Array.from(this.inputs.values()));
      }
    })
  }
}

export class ExportedApp extends React.Component<{}, {}> {
  render () {
    return (
      <ReduxProvider store={store}>
        <App/>
      </ReduxProvider>
     )
  }
}
