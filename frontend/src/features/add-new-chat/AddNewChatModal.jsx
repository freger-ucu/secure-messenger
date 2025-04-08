import { Modal } from "antd";

export default function AddNewChatModal({isModalOpen, handleOk, handleCancel}) {
    return (
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    );
};