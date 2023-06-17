import React from "react";
import { FlatList, View, StyleSheet, ScrollView, ActivityIndicator, Text, RefreshControl, SafeAreaView, TextInput } from "react-native";
import SanPham from "../Component/SanPham";
import Banner from "./Banner";
import { API_LIST_SANPHAM } from "../helpers/api";

export default class ListSanPham extends React.Component {
  static navigationOptions = {
    title: 'ListSanPham',
  };

  constructor() {
    super();
    this.state = {
      products: null,
      show: false,
      refreshing: false,
      searchText: '', // Trạng thái để lưu giá trị của thanh tìm kiếm
    };
    this.getProducts = this.getProducts.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.handlePress = this.handlePress.bind(this);
    this.displayloader = this.displayloader.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
  }

  componentDidMount() {
    this.getProducts();
    this.displayloader();
  }

  displayloader() {
    this.setState({ show: true });
    setTimeout(() => {
      this.setState({ show: false });
    }, 3000);
  }

  async getProducts() {
    try {
      const response = await fetch(API_LIST_SANPHAM, { method: 'GET' });
      const responseJSON = await response.json();
      this.setState({
        products: responseJSON.products,
        refreshing: false, 
      });
    } catch (error) {
      console.error(error);
      this.setState({ refreshing: false }); 
    }
  }

  handlePress(dataProd) {
    const { navigation } = this.props;
    navigation.navigate('ChiTietSanPham', { data: dataProd });
  }

  renderItems({ index, item }) {
    console.log(item);
    return (
      <View style={styles.wraper}>
        <SanPham dataProd={item} handlePress={this.handlePress} />
      </View>
    );
  }

  handleRefresh() {
    this.setState({ refreshing: true });
    this.getProducts();
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          refreshControl={ 
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              colors={['#9Bd35A', '#689F38']}
            />
          }
        >
          <Banner />
          <View style={{ flex: 1 }}>
            {this.state.show ? (
              <ActivityIndicator animating={this.state.show} color="blue" />
            ) : (
              <FlatList
                data={this.state.products}
                renderItem={this.renderItems}
                numColumns={2}
                contentContainerStyle={styles.container}
                style={styles.containerlist}
              />
            )}
          </View>
        </ScrollView>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={this.state.searchText}
            onChangeText={text => this.setState({ searchText: text })}
            onFocus={() => this.props.navigation.navigate('SearchResults')}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 2,
    
    backgroundColor: '#E3E3E3',
    alignSelf: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  containerlist:{
   marginTop:10
  },
  wraper: {
    paddingHorizontal: 5,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingTop: 10,
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop:5,
    marginLeft:30,
    marginRight:30,
    opacity:0.9
  },
});
