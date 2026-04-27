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
        <TextSemiBold style={[styles.title, { fontSize: 24 }]}>
          Pick your favourite restaurant
        </TextSemiBold>
      </View>
      <View
        style={[
          styles.section,
          { flex: 2, borderBottomWidth: 1, borderBottomColor: '#ccc' }
        ]}
      >
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantWithImageCard}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={[styles.section, { flex: 1 }]}>
        <TextSemiBold style={[styles.title, { fontSize: 16, color: 'green' }]}>
          Trending at Restaurants
        </TextSemiBold>
        <FlatList
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={top3Products}
          renderItem={renderPopularProducts}
          keyExtractor={item => item.id.toString()}
        />
      </View>
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
  },
  // estilos creados para mejorar el aspecto final de la pagina
  section: {
    padding: 10,
    marginTop: 10,
    paddingTop: 5
  },
  title: {
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 5
  }
})
