import { useContext, useEffect, useState } from 'react'
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
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'

import { updateOrder, getDetail } from '../../api/OrderEndpoints.js'
import { CartContext } from '../../context/CartContext'

export default function OrderDetailScreen({ navigation, route }) {
  const { loadOrderIntoCart } = useContext(CartContext)
  const [order, setOrder] = useState({
    createdAt: new Date(),
    price: 0,
    shippingCosts: 0,
    restaurant: {}
  })
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [newAddress, setNewAddress] = useState('')

  const [showConfirmModal, setShowConfirmModal] = useState(false)

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
      showMessage({
        message: `Address updated successfully.`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
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
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
          source={
            order.restaurant?.heroImage
              ? {
                  uri: API_BASE_URL + '/' + order.restaurant.heroImage,
                  cache: 'force-cache'
                }
              : restaurantBackground
          }
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <TextSemiBold textStyle={styles.heroTitle}>
                {order.restaurant?.name}
              </TextSemiBold>

              <TextRegular
                textStyle={[
                  styles.heroStatus,
                  {
                    color:
                      order.status === 'pending'
                        ? '#ff6b6b'
                        : order.status === 'in process'
                          ? '#f39c12'
                          : order.status === 'sent'
                            ? '#f1c40f'
                            : '#2ecc71'
                  }
                ]}
              >
                {order.status?.toUpperCase()}
              </TextRegular>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.infoCard}>
          <TextSemiBold textStyle={styles.sectionTitle}>
            Order information
          </TextSemiBold>

          <TextRegular textStyle={styles.infoText}>
            Address: {order.address}
          </TextRegular>

          <TextRegular textStyle={styles.infoText}>
            Shipping: {order.shippingCosts?.toFixed(2)} €
          </TextRegular>

          <TextRegular textStyle={styles.totalText}>
            Total: {order.price.toFixed(2)} €
          </TextRegular>
        </View>

        <View style={styles.infoCard}>
          <TextSemiBold textStyle={styles.sectionTitle}>Timeline</TextSemiBold>

          <TextRegular textStyle={styles.infoText}>
            Created: {formatDate(order.createdAt)}
          </TextRegular>

          <TextRegular textStyle={styles.infoText}>
            Started: {formatDate(order.startedAt)}
          </TextRegular>

          <TextRegular textStyle={styles.infoText}>
            Sent: {formatDate(order.sentAt)}
          </TextRegular>

          <TextRegular textStyle={styles.infoText}>
            Delivered: {formatDate(order.deliveredAt)}
          </TextRegular>
        </View>

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
                Edit address
              </TextRegular>
            </Pressable>

            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                loadOrderIntoCart(order)
                navigation.navigate('RestaurantDetailScreen', {
                  id: order.restaurantId
                })
              }}
            >
              <TextRegular textStyle={styles.buttonText}>
                Edit order
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
  heroImage: {
    width: '100%',
    height: 240
  },
  heroImageStyle: {
    resizeMode: 'cover'
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end'
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'flex-start'
  },
  heroTitle: {
    fontSize: 30,
    color: 'white',
    marginBottom: 6
  },
  heroStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 18,
    borderRadius: 14,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 14,
    color: '#222'
  },
  totalText: {
    marginTop: 8,
    fontSize: 22,
    color: GlobalStyles.brandSuccess
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
    paddingHorizontal: 15,
    paddingTop: 15,
    flexDirection: 'row',
    gap: 10
  },
  button: {
    backgroundColor: '#2ecc71',
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center'
  },
  secondaryButton: {
    backgroundColor: '#3498db'
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
