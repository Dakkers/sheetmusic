import * as React from 'react';
import { connect } from 'react-redux'
import { Modal, ModalHeader, ModalFooter, ModalBody } from 'reactstrap';

const SettingsModal = (props) => {
  return (
    <Modal isOpen={props.modalVisibility}>
      <ModalHeader>
        Settings
      </ModalHeader>
    </Modal>
  );
}

export default connect(
  state => ({
    modalVisibility: state.modalVisibility
  }),
)(SettingsModal)
