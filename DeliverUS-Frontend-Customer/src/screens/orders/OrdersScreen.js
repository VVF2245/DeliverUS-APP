import { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, Pressable, FlatList } from 'react-native'

import { getUserOrders } from '../../api/OrderEndpoints'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import { brandPrimary, brandPrimaryTap } from '../../styles/GlobalStyles'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { API_BASE_URL } from '@env'

export default function OrdersScreen({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders([])
    }
  }, [loggedInUser, route.params?.dirty])

  /*
MOCK useEffect
  useEffect(() => {
    setOrders([
      {
        id: 1,
        createdAt: new Date(),
        price: 12.5,
        shippingCosts: 2,
        address: 'Calle Falsa 123',
        status: 'pending',
        restaurant: {
          name: 'Burger King',
          logo: null
        }
      },
      {
        id: 2,
        createdAt: new Date(),
        price: 25.99,
        shippingCosts: 0,
        address: 'Av. Canarias 45',
        status: 'sent',
        restaurant: {
          name: 'Telepizza',
          logo: null
        }
      }
    ])
  }, [])
*/

  const renderOrder = ({ item }) => {
    return (
      <ImageCard
        imageUri={
          item.restaurant?.logo
            ? { uri: API_BASE_URL + '/' + item.restaurant.logo }
            : restaurantLogo
        }
        title={item.restaurant?.name}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id })
        }}
      >
        <TextRegular>Status: {item.status}</TextRegular>

        <TextSemiBold>{item.price?.toFixed(2)} €</TextSemiBold>
      </ImageCard>
    )
  }

  const renderEmptyOrdersList = () => {
    return (
      <View style={styles.emptyContainer}>
        <TextRegular textStyle={styles.emptyTitle}>No orders yet</TextRegular>

        <TextRegular textStyle={styles.emptyText}>
          When you place an order it will appear here.
        </TextRegular>
      </View>
    )
  }

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getUserOrders()
      setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : [])
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving orders. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    <FlatList
      style={styles.container}
      data={orders}
      renderItem={renderOrder}
      keyExtractor={item => item.id.toString()}
      ListEmptyComponent={renderEmptyOrdersList}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center'
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7
  }
})
