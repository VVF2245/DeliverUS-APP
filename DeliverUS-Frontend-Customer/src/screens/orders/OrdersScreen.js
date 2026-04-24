import { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, Pressable, FlatList } from 'react-native'

import { getUserOrders } from '../../api/OrderEndpoints'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import { brandPrimary, brandPrimaryTap } from '../../styles/GlobalStyles'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../../../DeliverUS-Frontend-Owner/src/context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../../../DeliverUS-Frontend-Owner/src/components/ImageCard'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { API_BASE_URL } from '@env'

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders([])
    }
  }, [loggedInUser])

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

        <TextSemiBold>{item.total?.toFixed(2)} €</TextSemiBold>
      </ImageCard>
    )
  }

  const renderEmptyOrdersList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No orders were retreived. Have you ordered yet?
      </TextRegular>
    )
  }

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getUserOrders()
      setOrders(Array.isArray(fetchOrders) ? fetchedOrders : [])
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
    <>
      <FlatList
        style={styles.container}
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyOrdersList}
      />
      <Pressable
        onPress={() => {
          navigation.navigate('OrderDetailScreen', {
            id: Math.floor(Math.random() * 100)
          })
        }}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? brandPrimaryTap : brandPrimary
          },
          styles.button
        ]}
      >
        <TextRegular textStyle={styles.text}>
          Go to Order Detail Screen
        </TextRegular>
      </Pressable>
    </>
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
  }
})
