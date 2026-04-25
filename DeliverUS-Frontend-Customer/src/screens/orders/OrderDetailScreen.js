import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import ImageCard from '../../components/ImageCard'

export default function OrderDetailScreen({ navigation, route }) {
  const [order, setOrder] = useState({
    createdAt: new Date()
  })

  //MOCK
  useEffect(() => {
    setOrder({
      id: 1,
      createdAt: new Date(),
      startedAt: null,
      sentAt: null,
      deliveredAt: null,
      price: 20,
      shippingCosts: 2,
      address: 'Calle Falsa 123',
      status: 'pending',
      restaurantId: 3,
      restaurant: {
        id: 3,
        name: 'Burger King'
      },
      products: [
        {
          id: 1,
          name: 'Burger',
          description: 'Big burger',
          OrderProducts: {
            quantity: 2,
            unityPrice: 5
          }
        },
        {
          id: 2,
          name: 'Fries',
          description: 'Crispy fries',
          OrderProducts: {
            quantity: 1,
            unityPrice: 3
          }
        }
      ]
    })
  }, [])

  const formatDate = date => {
    return date ? new Date(date).toLocaleString() : '-'
  }

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <TextSemiBold textStyle={styles.textTitle}>
          Order #{order.id}
        </TextSemiBold>

        <TextRegular textStyle={styles.text}>
          Restaurant: {order.restaurant?.name}
        </TextRegular>
        <TextRegular textStyle={styles.text}>
          Status: {order.status}
        </TextRegular>

        <TextRegular textStyle={styles.text}>
          Created: {formatDate(order.createdAt)}
        </TextRegular>
        <TextRegular textStyle={styles.text}>
          Started: {formatDate(order.startedAt)}
        </TextRegular>
        <TextRegular textStyle={styles.text}>
          Sent: {formatDate(order.sentAt)}
        </TextRegular>
        <TextRegular textStyle={styles.text}>
          Delivered: {formatDate(order.deliveredAt)}
        </TextRegular>

        <TextRegular textStyle={styles.text}>
          Address: {order.address}
        </TextRegular>

        <TextRegular textStyle={styles.text}>
          Price: {order.price.toFixed(2)} €
        </TextRegular>

        <TextRegular textStyle={styles.text}>
          ShippingCosts: {order.shippingCosts.toFixed(2)} €
        </TextRegular>

        <TextSemiBold textStyle={styles.text}>
          Total: {(order.price + order.shippingCosts || 0).toFixed(2)} €
        </TextSemiBold>
      </View>
    )
  }

  const renderProduct = ({ item }) => {
    const quantity = item.OrderProducts?.quantity || 0
    const unityPrice = item.OrderProducts?.unityPrice || 0
    const totalPrice = quantity * unityPrice

    return (
      <ImageCard title={item.name}>
        <TextRegular>{item.description}</TextRegular>

        <View style={styles.row}>
          <TextRegular>
            {quantity} x {unityPrice.toFixed(2)} €
          </TextRegular>
          <TextSemiBold>{totalPrice.toFixed(2)} €</TextSemiBold>
        </View>
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This order has no products yet.
      </TextRegular>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.container}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyProductsList}
        data={order.products || []}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    margin: 50
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  container: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  }
})
