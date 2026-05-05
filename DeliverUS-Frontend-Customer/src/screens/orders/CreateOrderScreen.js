import { useContext, useState } from 'react'
import { StyleSheet, View, FlatList, Pressable, Alert } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { CartContext } from '../../context/CartContext'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { createOrder } from '../../api/OrderEndpoints'
import DeleteModal from '../../components/DeleteModal'
import ConfirmModal from '../../components/ConfirmModal.js'

export default function CreateOrderScreen({ navigation }) {
  const {
    cartItems,
    removeProduct,
    updateQuantity,
    clearCart,
    getTotalPrice,
    restaurantId
  } = useContext(CartContext)
  const { loggedInUser } = useContext(AuthorizationContext)
  const [loading, setLoading] = useState(false)
  const [orderToDismiss, setOrderToDismiss] = useState(false)
  const [orderToConfirm, setOrderToConfirm] = useState(false)

  const handleRemoveProduct = productId => {
    removeProduct(productId)
    showMessage({
      message: 'Product removed from cart',
      type: 'success',
      style: GlobalStyles.flashStyle,
      titleStyle: GlobalStyles.flashTextStyle
    })
  }

  const handleUpdateQuantity = (productId, quantity) => {
    updateQuantity(productId, quantity)
  }

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      showMessage({
        message: 'Your cart is empty',
        type: 'warning',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      return
    }

    Alert.alert(
      'Confirm Order',
      `Total: ${getTotalPrice().toFixed(2)}€\n\nAre you sure you want to place this order?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true)
            try {
              const orderData = {
                restaurantId: restaurantId,
                products: cartItems.map(item => ({
                  productId: item.id,
                  quantity: item.quantity
                }))
              }

              await createOrder(orderData)

              clearCart()
              showMessage({
                message: 'Order confirmed successfully!',
                type: 'success',
                style: GlobalStyles.flashStyle,
                titleStyle: GlobalStyles.flashTextStyle
              })

              navigation.navigate('OrdersScreen')
            } catch (error) {
              showMessage({
                message: `Error creating order: ${error.message}`,
                type: 'danger',
                style: GlobalStyles.flashStyle,
                titleStyle: GlobalStyles.flashTextStyle
              })
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleCancelOrder = () => {
    Alert.alert(
      'Dismiss Order',
      'Are you sure you want to dismiss this order? All products will be removed.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Dismiss',
          onPress: () => {
            clearCart()
            showMessage({
              message: 'Order dismissed',
              type: 'info',
              style: GlobalStyles.flashStyle,
              titleStyle: GlobalStyles.flashTextStyle
            })
            navigation.navigate('OrdersScreen')
          },
          style: 'destructive'
        }
      ]
    )
  }

  const renderProductItem = ({ item }) => {
    return (
      <View style={styles.productItem}>
        <View style={styles.productInfo}>
          <TextSemiBold textStyle={styles.productName}>
            {item.name}
          </TextSemiBold>
          <TextRegular textStyle={styles.productPrice}>
            {item.price.toFixed(2)}€ x {item.quantity} ={' '}
            {(item.price * item.quantity).toFixed(2)}€
          </TextRegular>
        </View>
        <View style={styles.productControls}>
          <Pressable
            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
            style={styles.quantityButton}
          >
            <MaterialCommunityIcons name="minus" size={16} color="white" />
          </Pressable>
          <TextSemiBold textStyle={styles.quantityText}>
            {item.quantity}
          </TextSemiBold>
          <Pressable
            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
            style={styles.quantityButton}
          >
            <MaterialCommunityIcons name="plus" size={16} color="white" />
          </Pressable>
          <Pressable
            onPress={() => handleRemoveProduct(item.id)}
            style={[
              styles.quantityButton,
              { marginLeft: 10, backgroundColor: GlobalStyles.brandPrimary }
            ]}
          >
            <MaterialCommunityIcons name="delete" size={16} color="white" />
          </Pressable>
        </View>
      </View>
    )
  }

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <TextRegular textStyle={styles.emptyText}>
          Your cart is empty
        </TextRegular>
      </View>
    )
  }

  const renderFooter = () => {
    if (cartItems.length === 0) return null

    return (
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <TextSemiBold textStyle={styles.totalLabel}>Total:</TextSemiBold>
          <TextSemiBold textStyle={styles.totalPrice}>
            {getTotalPrice().toFixed(2)}€
          </TextSemiBold>
        </View>
        <View style={styles.buttonsContainer}>
          <Pressable
            onPress={() => setOrderToDismiss(true)}
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
          >
            <MaterialCommunityIcons name="close" size={20} color="white" />
            <TextRegular textStyle={styles.buttonText}>Dismiss</TextRegular>
          </Pressable>
          <Pressable
            onPress={() => setOrderToConfirm(true)}
            style={[styles.button, styles.confirmButton]}
            disabled={loading}
          >
            <MaterialCommunityIcons name="check" size={20} color="white" />
            <TextRegular textStyle={styles.buttonText}>Confirm</TextRegular>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextSemiBold textStyle={styles.headerTitle}>Order Review</TextSemiBold>
        <TextRegular textStyle={styles.headerSubtitle}>
          You can edit or remove products before confirming
        </TextRegular>
      </View>

      <FlatList
        data={cartItems}
        renderItem={renderProductItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        style={styles.listContainer}
      />
      {renderFooter()}
      <DeleteModal
        isVisible={orderToDismiss === true}
        onCancel={() => setOrderToDismiss(false)}
        onConfirm={() => handleCancelOrder}
      ></DeleteModal>
      <ConfirmModal
        isVisible={orderToConfirm === true}
        onCancel={() => setOrderToConfirm(false)}
        onConfirm={() => handleConfirmOrder}
      ></ConfirmModal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlobalStyles.brandBackground
  },
  header: {
    padding: 15,
    backgroundColor: GlobalStyles.brandPrimary,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 5
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 12
  },
  listContainer: {
    flex: 1,
    padding: 10
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  productInfo: {
    flex: 1,
    marginRight: 10
  },
  productName: {
    fontSize: 14,
    marginBottom: 5
  },
  productPrice: {
    fontSize: 12,
    color: '#666'
  },
  productControls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    backgroundColor: GlobalStyles.brandSecondary,
    borderRadius: 4,
    padding: 6,
    marginHorizontal: 2
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 12
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  },
  footer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  totalLabel: {
    fontSize: 16
  },
  totalPrice: {
    fontSize: 20,
    color: GlobalStyles.brandSuccess
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  confirmButton: {
    backgroundColor: GlobalStyles.brandSuccess
  },
  cancelButton: {
    backgroundColor: GlobalStyles.brandPrimary
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  }
})
