import { useEffect, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  View,
  ImageBackground,
  Pressable,
  Modal,
  TextInput
} from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import ImageCard from '../../components/ImageCard'
import restaurantBackground from '../../../assets/restaurantBackground.jpeg'
import defaultProductImage from '../../../assets/product.jpeg'
import { API_BASE_URL } from '@env'

import { updateOrder, getDetail } from '../../api/OrderEndpoints.js'

export default function OrderDetailScreen({ navigation, route }) {
  const [order, setOrder] = useState({
    createdAt: new Date(),
    price: 0,
    shippingCosts: 0,
    restaurant: {}
  })
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [newAddress, setNewAddress] = useState('')

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  //MOCK
  /*
  useEffect(() => {
    setOrder({
      id: 1,
      createdAt: new Date(),
      startedAt: null,
      sentAt: null,
      deliveredAt: null,
      price: 13,
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
  */

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getDetail(route.params.id)
        setOrder(fetchedOrders)
      } catch (error) {
        console.log(error)
      }
    }
    fetchOrders()
  }, [route.params.id])

  const formatDate = date => {
    return date ? new Date(date).toLocaleString() : '-'
  }

  const handleUpdateOrder = async () => {
    try {
      const orderToUpdate = {
        address: newAddress,
        products: order.products.map(product => ({
          productId: product.id,
          quantity: product.OrderProducts.quantity
        }))
      }
      const updatedOrder = await updateOrder(order.id, orderToUpdate)

      console.log(updatedOrder)
      setOrder(updatedOrder)
    } catch (error) {
      console.log(error)
    }
  }

  const renderHeader = () => {
    return (
      <>
        <ImageBackground
          style={styles.ImageBackground}
          source={
            order.restaurant?.heroImage
              ? {
                  uri: API_BASE_URL + '/' + order.restaurant.heroImage,
                  cache: 'force-cache'
                }
              : restaurantBackground
          }
        >
          <View style={styles.headerContainer}>
            {/* TÍTULO A LA IZQUIERDA */}
            <TextSemiBold textStyle={styles.textTitle}>
              Order #{order.id} - Total:{' '}
              {(order.price + order.shippingCosts || 0).toFixed(2)} €
            </TextSemiBold>

            <View style={styles.centerContent}>
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
            </View>
          </View>
        </ImageBackground>

        {order.status === 'pending' && (
          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.button}
              onPress={() => {
                setNewAddress(order.address)
                setShowAddressModal(true)
              }}
            >
              <TextRegular textStyle={styles.buttonText}>
                Editar dirección
              </TextRegular>
            </Pressable>
          </View>
        )}
      </>
    )
  }

  const renderProduct = ({ item }) => {
    const quantity = item.OrderProducts?.quantity || 0
    const unityPrice = item.OrderProducts?.unityPrice || 0
    const totalPrice = quantity * unityPrice

    return (
      <ImageCard
        imageUri={
          item.image
            ? { uri: API_BASE_URL + '/' + item.image }
            : defaultProductImage
        }
        title={item.name}
      >
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
        contentContainerStyle={{ paddingBottom: 10 }}
      />
      <Modal visible={showAddressModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextSemiBold textStyle={styles.modalTitle}>
              Edit Address
            </TextSemiBold>

            <TextInput
              style={styles.input}
              value={newAddress}
              onChangeText={setNewAddress}
              placeholder="Introduce the new address"
            />

            <View style={styles.modalButtons}>
              {/*CANCELAR*/}
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddressModal(false)}
              >
                <TextRegular textStyle={styles.buttonText}>Cancel</TextRegular>
              </Pressable>

              {/*ACEPTAR*/}
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setShowConfirmModal(true)
                }}
              >
                <TextRegular textStyle={styles.buttonText}>Accept</TextRegular>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirmModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextSemiBold textStyle={styles.modalTitle}>
              Confirm changes?
            </TextSemiBold>

            <TextRegular textStyle={{ textAlign: 'center', marginBottom: 20 }}>
              Are you sure you want to change address?
            </TextRegular>

            <View style={styles.modalButtons}>
              {/*NO*/}
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <TextRegular textStyle={styles.buttonText}>No</TextRegular>
              </Pressable>

              {/*SÍ*/}
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={async () => {
                  try {
                    await handleUpdateOrder()
                    setShowAddressModal(false)
                    setShowConfirmModal(false)
                  } catch (error) {
                    console.log(error)
                  }
                }}
              >
                <TextRegular textStyle={styles.buttonText}>Yes</TextRegular>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  ImageBackground: {
    width: '100%',
    flex: 1,
    height: 250,
    justifyContent: 'center'
  },
  headerContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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
  },
  buttonContainer: {
    padding: 15,
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: '#e74c3c'
  },
  confirmButton: {
    backgroundColor: '#2ecc71'
  }
})
