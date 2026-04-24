import { useEffect, useState } from 'react'
import { StyleSheet, View, Pressable, ScrollView } from 'react-native'
import TextSemiBold from '../../components/TextSemiBold'
import TextRegular from '../../components/TextRegular'
import { getAll } from '../../api/RestaurantEndpoints'
import { getPopularProducts } from '../../api/ProductEndpoints'
import * as GlobalStyles from '../../styles/GlobalStyles' //Imported globally to practise a different import style unlike that of RestaurantDetailScreen
import { FlatList } from 'react-native'
import ImageCard from '../../components/ImageCard'
import { showMessage } from 'react-native-flash-message'

import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import defaultProductImage from '../../../assets/product.jpeg'
import { API_BASE_URL } from '@env'

export default function RestaurantsScreen({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])

  const fetchRestaurants = async () => {
    try {
      const fetchedRestaurants = await getAll()
      setRestaurants(fetchedRestaurants)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurants. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  const [top3Products, setTop3Products] = useState([])
  const fetchTop3Products = async () => {
    try {
      const popularProducts = await getPopularProducts()
      setTop3Products(popularProducts)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  useEffect(() => {
    // TODO: Fetch all restaurants and set them to state.
    //      Notice that it is not required to be logged in.
    // TODO: set restaurants to state
    fetchRestaurants()
    fetchTop3Products()
  }, [route])

  const renderRestaurantWithImageCard = ({ item }) => {
    return (
      <ImageCard
        imageUri={
          item.logo ? { uri: API_BASE_URL + '/' + item.logo } : restaurantLogo
        }
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null && (
          <TextSemiBold>
            Avg. service time:{' '}
            <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
              {item.averageServiceMinutes} min.
            </TextSemiBold>
          </TextSemiBold>
        )}
        <TextSemiBold>
          Shipping:{' '}
          <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>
            {item.shippingCosts.toFixed(2)}€
          </TextSemiBold>
        </TextSemiBold>
      </ImageCard>
    )
  }

  const renderPopularProducts = ({ item }) => {
    return (
      <ImageCard
        imageUri={
          item.logo
            ? { uri: API_BASE_URL + '/' + item.image }
            : defaultProductImage
        }
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', {
            id: item.restaurantId
          })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>{' '}
        <TextSemiBold textStyle={styles.price}>
          {item.price.toFixed(2)}€{' '}
        </TextSemiBold>{' '}
        {!item.availability && (
          <TextRegular textStyle={styles.availability}>
            Not available{' '}
          </TextRegular>
        )}{' '}
      </ImageCard>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.FRHeader}>
        <TextSemiBold>FR1: Restaurants listing.</TextSemiBold>
        <TextRegular>
          List restaurants and enable customers to navigate to restaurant
          details so they can create and place a new order
        </TextRegular>
        <TextSemiBold>FR7: Show top 3 products.</TextSemiBold>
        <TextRegular>
          Customers will be able to query top 3 products from all restaurants.
          Top products are the most popular ones, in other words the best
          sellers.
        </TextRegular>
      </View>
      <ScrollView>
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantWithImageCard}
          keyExtractor={item => item.id.toString()}
        />
        <TextSemiBold
          style={{ marginTop: 40, marginBottom: 10, marginLeft: 15 }}
        >
          Top 3 Popular Products
        </TextSemiBold>
        <FlatList
          data={top3Products}
          renderItem={renderPopularProducts}
          keyExtractor={item => item.id.toString()}
        />
      </ScrollView>
      <Pressable
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: 1 }) // TODO: Change this to the actual restaurant id as they are rendered as a FlatList
        }}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? GlobalStyles.brandPrimaryTap
              : GlobalStyles.brandPrimary
          },
          styles.button
        ]}
      >
        <TextRegular textStyle={styles.text}>
          Go to Restaurant Detail Screen
        </TextRegular>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  FRHeader: {
    // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
