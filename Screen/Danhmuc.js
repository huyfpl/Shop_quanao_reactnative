import React, { Component } from "react";
import { View, Text, TouchableWithoutFeedback, StyleSheet, Image, FlatList, Modal, ActivityIndicator, RefreshControl } from "react-native";
import axios from "axios";
import { API_LIST_DANHMUC, API_LIST_SANPHAM_DANHMUC } from "../helpers/api";
import SanPham from "../Component/SanPham";

export default class DanhMuc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      danhMucList: [],
      selectedDanhMuc: null,
      danhSachSanPham: [],
      loading: false,
      refreshing: false // Thêm trạng thái refreshing
    };
    this.handlePress = this.handlePress.bind(this);
  }

  componentDidMount() {
    this.fetchDanhMucList();
    this.props.navigation.addListener('focus', this.componentDidFocus);
  }

  fetchDanhMucList = async () => {
    try {
      const response = await axios.get(API_LIST_DANHMUC);
      const data = response.data;
      let danhMucList = data.danhmuc;
  
      // Kiểm tra nếu số lượng danh mục là số lẻ, thêm một phần tử ảo vào danh sách để đảm bảo số lượng chẵn
      if (danhMucList.length % 2 !== 0) {
        danhMucList.push({ id_danhmuc: -1, ten_danhmuc: "", anh_danhmuc: "" });
      }
  
      // Kiểm tra và cung cấp ảnh mặc định cho trường anh_danhmuc nếu nó là chuỗi rỗng
      danhMucList = danhMucList.map((item) => ({
        ...item,
        anh_danhmuc: item.anh_danhmuc || "https://iili.io/H6SU9Wb.png",
      }));
  
      this.setState({ danhMucList });
    } catch (error) {
      console.error(error);
    }
  };

  fetchSanPhamByDanhMuc = async (id_danhmuc) => {
    try {
      this.setState({ loading: true });
      const response = await axios.get(`${API_LIST_SANPHAM_DANHMUC}/${id_danhmuc}`);
      const data = response.data;
      this.setState({ danhSachSanPham: data.products, loading: false });
    } catch (error) {
      console.error(error);
      this.setState({ loading: false });
    }
  };

  handleDanhMucPress = (item) => {
    this.setState({ selectedDanhMuc: item }, () => {
      this.fetchSanPhamByDanhMuc(item.id_danhmuc);
    });
  };

  renderDanhMucItem = ({ item }) => (
    <TouchableWithoutFeedback onPress={() => this.handleDanhMucPress(item)}>
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.anh_danhmuc }} style={styles.img} />
        <Text style={styles.text}>{item.ten_danhmuc}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  handlePress = (dataProd) => {
    this.setState({ selectedDanhMuc: null }, () => {
      this.props.navigation.navigate('ChiTietSanPham', { data: dataProd });
    });
  };

  componentDidFocus = () => {
    const { selectedDanhMuc } = this.state;
    if (selectedDanhMuc) {
      this.fetchSanPhamByDanhMuc(selectedDanhMuc.id_danhmuc);
    }
  };

  renderSanPhamItem = ({ item, index }) => {
    const isOddItem = index % 2 !== 0;

    if (isOddItem) {
      return null;
    }
    const nextItem = this.state.danhSachSanPham[index + 1];

    return (
      <View style={styles.sanPhamRowContainer}>
        <SanPham dataProd={item} handlePress={this.handlePress} />
        {nextItem && (
          <SanPham dataProd={nextItem} handlePress={this.handlePress} />
        )}
      </View>
    );
  };

  // Phương thức xử lý sự kiện làm mới
  onRefresh = () => {
    const { selectedDanhMuc } = this.state;
    this.setState({ refreshing: true }, async () => {
      if (selectedDanhMuc) {
        await this.fetchSanPhamByDanhMuc(selectedDanhMuc.id_danhmuc);
      }
      this.setState({ refreshing: false });
    });
  };

  render() {
    const { danhMucList, selectedDanhMuc, danhSachSanPham, loading, refreshing } = this.state;

    if (selectedDanhMuc === null) {
      return (
        <View style={styles.container}>
          <FlatList
            data={danhMucList}
            renderItem={this.renderDanhMucItem}
            keyExtractor={(item) => item.id_danhmuc}
            contentContainerStyle={styles.listContainer}
            numColumns={2}
            refreshControl={ // Thêm RefreshControl
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this.onRefresh}
                colors={['#9Bd35A', '#689F38']}
              />
            }
          />
        </View>
      );
    }

    return (
      <Modal visible={true} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{selectedDanhMuc?.ten_danhmuc}</Text>

          {loading ? (
            <ActivityIndicator size="large" color="gray" style={styles.loader} />
          ) : (
            <FlatList
              data={danhSachSanPham}
              renderItem={this.renderSanPhamItem}
              keyExtractor={(item) => item.idSP}
              contentContainerStyle={styles.sanPhamListContainer}
              refreshControl={ // Thêm RefreshControl
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={this.onRefresh}
                  colors={['#9Bd35A', '#689F38']}
                />
              }
            />
          )}

          <TouchableWithoutFeedback onPress={() => this.setState({ selectedDanhMuc: null })}>
            <View style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  sanPhamRowContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },

  container: {
    flex: 1,
    paddingTop: 30,
  },
  listContainer: {
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 25,
  },
  itemContainer: {
    alignItems: "center",
    marginBottom: 30,
    flex: 1,
    justifyContent: "center",
  },
  img: {
    width: 100,
    height: 100,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: '#E3E3E3',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop:10,
    color:'blue'

  },
  sanPhamListContainer: {
    flexGrow: 1,
  },
  sanPhamItemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 10,
  },
  sanPhamText: {
    fontSize: 16,
  },
  loader: {
    marginTop: 50,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "orange",
    borderRadius: 5,
    marginBottom: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
