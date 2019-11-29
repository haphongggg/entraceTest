import React from "react";
import { Avatar, Button, Layout, Modal, Row, Table } from "antd";
// thư viện gửi nhận request/response - dùng để fetch data từ api
import axios from "axios";

const _COLUMNS = ["picture", "id", "name", "gender", "dob", "email", "phone"];

const { Header, Content, Footer } = Layout;


const recombine = data => {
  const newData = {
    id: Math.floor(Math.random() * 1000),
    name: `${data.name.title} ${data.name.first} ${data.name.last}`,
    gender: data.gender,
    dob: data.dob.date,
    email: data.email,
    phone: data.phone,
    picture: data.picture.thumbnail
  };
  newData.key = newData.id;
  return newData;
};

class App extends React.Component {
  state = {
    users: [],
    isLoading: true,
    columns: [],
    selectedRows: [],
    modal: false
  };

  async fetchDummyData() {
    this.setState({ isLoading: true });

    const result = [];
    for (let i = 0; i < 10; i++) {
      const response = await axios.get("https://randomuser.me/api/");
      const user = recombine(response.data.results[0]);
      result.push(user);
    }

    const columns = this.generateColumns(result);

    this.setState({ users: result, isLoading: false, columns: columns });
  }

  async componentDidMount() {
    await this.fetchDummyData();
  }


  generateColumns(rows) {
    const columns = _COLUMNS.map(x => {
      let result = {
        title: x.toUpperCase(),
        dataIndex: x,
        key: x
      };


      if (x === "picture") {
        delete result.dataIndex;
        result = {
          ...result,
          align: "center",
          render: (record) => (
            <span>
              <Avatar src={record.picture} />
            </span>
          )
        };
      }

      if (x === "dob") {
        delete result.dataIndex;
        result = {
          ...result,
          render: (text, record) => (
            <span>{new Date(record.dob).toDateString()}</span>
          )
        };
      }

      if (x === "name") {
        result = {
          ...result,
          sorter: (a, b) => a.name.localeCompare(b.name),
          sortDirections: ["descend", "ascend"]
        };
      }
      return result;
    });
    return columns;
  }


  rowSelectionHandler = () => ({
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({ selectedRows: selectedRowKeys });
    }
  });

  openDeleteModal = () => {
    this.setState({ openDeleteModal: true });
  };

  deleteHandler = () => {
    if (!this.state.selectedRows || !this.state.selectedRows.length) {
      this.setState({ openDeleteModal: false });
      return;
    }

    const selectedRows = this.state.selectedRows;
    let result = this.state.users;

    result = result.filter(x => {
      return !selectedRows.includes(x.id);
    });

    this.setState({ users: result, openDeleteModal: false });
  };

  deleteCancelHandler = () => {
    this.setState({ openDeleteModal: false });
  };

  render() {
    return (
      <Layout>
        <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
          <Button
            type="danger"
            key="1"
            onClick={this.openDeleteModal}
            style={{ marginLeft: 10 }}
          >
            Delete
          </Button>
        </Header>

        <Modal
          title="Delete?"
          visible={this.state.openDeleteModal}
          onOk={this.deleteHandler}
          onCancel={this.deleteCancelHandler}
        >
          <p>Are you sure?</p>
        </Modal>

        <Content
          style={{
            padding: "0 10px",
            marginTop: 64,
            height: "calc(100vh - 133px)"
          }}
        >
          <div
            style={{
              background: "#fff",
              overflow: "auto",
              maxHeight: "calc(100vh - 133px)"
            }}
          >
            <Table
              {...{
                loading: this.state.isLoading,
                rowSelection: this.state.rowSelection
              }}
              rowSelection={this.rowSelectionHandler()}
              dataSource={this.state.users}
              columns={this.state.columns}
            />
          </div>
        </Content>

        <Row
          type="flex"
          justify="end"
          style={{
            top: "calc(100vh - 96px)",
            position: "absolute",
            left: "50%",
            transform: "translate(-50%, 0)"
          }}
        >
          <Button type="primary" shape="circle" icon="plus" size="large" />
        </Row>

        <Footer style={{ textAlign: "center" }}>
          This is an entrance test
        </Footer>
      </Layout>
    );
  }
}

export default App;
