import { useContext, useEffect, useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { StyleSheet, View, Pressable, FlatList } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getUserOrders, remove } from '../../api/OrderEndpoints'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { showMessage } from 'react-native-flash-message'
import ImageCard from '../../components/ImageCard'
import DeleteModal from '../../components/DeleteModal'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { API_BASE_URL } from '@env'

export default function OrdersScreen({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)
  const { loggedInUser } = useContext(AuthorizationContext)

  const [open, setOpen] = useState(false)
  const [filterRestaurant, setFilterRestaurant] = useState('all')
  const [items, setItems] = useState([])

  useFocusEffect(
    useCallback(() => {
      if (loggedInUser) {
        fetchOrders()
      } else {
        setOrders([])
      }
    }, [loggedInUser])
  )

  useEffect(() => {
    const restaurants = Array.from(
      new Map(orders.map(o => [o.restaurant?.id, o.restaurant])).values()
    )

    setItems([
      { label: 'All restaurants', value: 'all' },
      ...restaurants.map(r => ({
        label: r.name,
        value: r.id
      }))
    ])
  }, [orders])

  const processedOrders = orders.filter(order => {
    if (filterRestaurant === 'all') return true
    return order.restaurant?.id === filterRestaurant
  })

  const getStatusColor = status => {
    switch (status) {
      case 'pending':
        return 'red'
      case 'in process':
        return 'orange'
      case 'sent':
        return 'gold'
      case 'delivered':
        return 'green'
      default:
        return 'black'
    }
  }

  const renderOrder = ({ item }) => {
    return (
      <View style={styles.orderContainer}>
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
          <TextRegular
            style={{ color: getStatusColor(item.status), fontWeight: '500' }}
          >
            Status: {item.status}
          </TextRegular>
          <TextSemiBold>{item.price?.toFixed(2)} €</TextSemiBold>
          <TextRegular>
            created at{' '}
            {new Date(item.createdAt)?.toLocaleDateString('en-UK', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}{' '}
            at{' '}
            {new Date(item.createdAt)?.toLocaleTimeString('en-UK', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </TextRegular>
          {item.status === 'pending' && (
            <Pressable
              onPress={() => {
                setOrderToBeDeleted(item)
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? GlobalStyles.brandPrimaryTap
                    : GlobalStyles.brandPrimary
                },
                styles.deleteButton
              ]}
            >
              <MaterialCommunityIcons name="delete" color={'white'} size={20} />
            </Pressable>
          )}
        </ImageCard>
      </View>
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

  const removeOrder = async order => {
    try {
      await remove(order.id)
      await fetchOrders()
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order successfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order could not be removed. ${order.status} orders cannot be removed. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    <>
      <View style={styles.topBar}>
        <DropDownPicker
          open={open}
          value={filterRestaurant}
          items={items}
          setOpen={setOpen}
          setValue={setFilterRestaurant}
          setItems={setItems}
          placeholder="Filter"
          style={styles.dropdown}
          containerStyle={styles.dropdownContainer}
          dropdownContainerStyle={styles.dropdownBox}
        />
      </View>
      <FlatList
        style={styles.container}
        data={processedOrders}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingTop: 40 }}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyOrdersList}
      />
      <DeleteModal
        isVisible={orderToBeDeleted !== null}
        onCancel={() => setOrderToBeDeleted(null)}
        onConfirm={() => removeOrder(orderToBeDeleted)}
      >
        <TextRegular>Only pending orders can be deleted.</TextRegular>
      </DeleteModal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  orderContainer: {
    position: 'relative',
    marginBottom: 10
  },
  deleteButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
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
  },
  topBar: {
    position: 'absolute',
    top: 10,
    right: 30,
    zIndex: 1000
  },
  dropdownContainer: {
    width: 160
  },
  dropdown: {
    minHeight: 40,
    borderWidth: 0.5
  },
  dropdownBox: {
    borderWidth: 0.5
  }
})
