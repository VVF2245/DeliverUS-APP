import { useEffect, useState, useContext } from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  ImageBackground,
  Image,
  Pressable
} from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { API_BASE_URL } from '@env'
import { CartContext } from '../../context/CartContext'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function RestaurantDetailScreen({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [quantities, setQuantities] = useState({})
  const { addProduct, cartItems, getTotalPrice, restaurantId } = useContext(CartContext)
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    fetchRestaurantDetail()
  }, [route])

  const renderHeader = () => {
    return (
      <View>
        <View style={styles.FRHeader}>
          <TextSemiBold>FR2: Restaurants details and menu.</TextSemiBold>
          <TextRegular>
            Customers will be able to query restaurants details and the products
            offered by them.
          </TextRegular>
          <TextSemiBold>
            FR3: Add, edit and remove products to a new order.
          </TextSemiBold>
          <TextRegular>
            A customer can add several products, and several units of a product
            to a new order. Before confirming, customer can edit and remove
            products. Once the order is confirmed, it cannot be edited or
            removed.
          </TextRegular>
          <TextSemiBold>FR4: Confirm or dismiss new order.</TextSemiBold>
          <TextRegular>
            Customers will be able to confirm or dismiss the order before
            sending it to the backend.
          </TextRegular>
        </View>
        {restaurantId && restaurantId !== restaurant.id && cartItems.length > 0 && (
          <View style={styles.warningBanner}>
            <MaterialCommunityIcons name="alert" size={20} color="white" />
            <TextRegular textStyle={styles.warningText}>
              You have items from another restaurant. Your cart will be cleared when adding items here.
            </TextRegular>
          </View>
        )}
        <ImageBackground
          source={
            restaurant?.heroImage
              ? {
                  uri: API_BASE_URL + '/' + restaurant.heroImage,
                  cache: 'force-cache'
                }
              : undefined
          }
          style={styles.imageBackground}
        >
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>
              {restaurant.name}
            </TextSemiBold>
            <Image
              style={styles.image}
              source={
                restaurant.logo
                  ? {
                      uri: API_BASE_URL + '/' + restaurant.logo,
                      cache: 'force-cache'
                    }
                  : undefined
              }
            />
            <TextRegular textStyle={styles.description}>
              {restaurant.description}
            </TextRegular>
            <TextRegular textStyle={styles.description}>
              {restaurant.restaurantCategory
                ? restaurant.restaurantCategory.name
                : ''}
            </TextRegular>
          </View>
        </ImageBackground>
      </View>
    )
  }

  const renderProduct = ({ item }) => {
    const quantity = quantities[item.id] || 0

    const incrementQuantity = () => {
      setQuantities({ ...quantities, [item.id]: quantity + 1 })
    }

    const decrementQuantity = () => {
      if (quantity > 0) {
        setQuantities({ ...quantities, [item.id]: quantity - 1 })
      }
    }

    const handleAddToCart = () => {
      if (!loggedInUser) {
        showMessage({
          message: 'Please log in to add products to your order',
          type: 'warning',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
        navigation.navigate('Profile')
        return
      }

      if (quantity > 0) {
        addProduct(item, quantity, restaurant.id)
        setQuantities({ ...quantities, [item.id]: 0 })
        showMessage({
          message: `${item.name} added to cart`,
          type: 'success',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      } else {
        showMessage({
          message: 'Please select a quantity',
          type: 'warning',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }

    return (
      <ImageCard
        imageUri={
          item.image ? { uri: API_BASE_URL + '/' + item.image } : undefined
        }
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>
          {item.price.toFixed(2)}€
        </TextSemiBold>
        {!item.availability && (
          <TextRegular textStyle={styles.availability}>
            Not available
          </TextRegular>
        )}
        {item.availability && (
          <View style={styles.quantityContainer}>
            <Pressable
              onPress={decrementQuantity}
              style={[styles.quantityButton, { marginRight: 10 }]}
            >
              <MaterialCommunityIcons
                name="minus"
                size={20}
                color="white"
              />
            </Pressable>
            <TextSemiBold textStyle={styles.quantityText}>
              {quantity}
            </TextSemiBold>
            <Pressable
              onPress={incrementQuantity}
              style={[styles.quantityButton, { marginLeft: 10 }]}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color="white"
              />
            </Pressable>
            <Pressable
              onPress={handleAddToCart}
              style={[styles.addButton, { marginLeft: 'auto' }]}
            >
              <MaterialCommunityIcons
                name="cart-plus"
                size={20}
                color="white"
              />
              <TextRegular textStyle={styles.addButtonText}>Add</TextRegular>
            </Pressable>
          </View>
        )}
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  const fetchRestaurantDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      setRestaurant(fetchedRestaurant)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyProductsList}
      style={styles.container}
      data={restaurant.products}
      renderItem={renderProduct}
      keyExtractor={item => item.id.toString()}
    />
  )
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1
  },
  FRHeader: {
    // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: GlobalStyles.brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  quantityButton: {
    backgroundColor: GlobalStyles.brandPrimary,
    borderRadius: 6,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10
  },
  addButton: {
    backgroundColor: GlobalStyles.brandSuccess,
    borderRadius: 6,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14
  },
  price: {
    fontSize: 16,
    marginTop: 5
  },
  warningBanner: {
    backgroundColor: GlobalStyles.brandSecondaryTap,
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: GlobalStyles.brandSecondary
  },
  warningText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 13,
    flex: 1
  }
})
