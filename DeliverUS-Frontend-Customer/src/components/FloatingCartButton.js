import { useContext } from 'react'
import { Pressable, View, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { CartContext } from '../context/CartContext'
import * as GlobalStyles from '../styles/GlobalStyles'
import TextSemiBold from './TextSemiBold'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function FloatingCartButton() {
  const navigation = useNavigation()
  const { cartItems, getTotalPrice } = useContext(CartContext)

  if (cartItems.length === 0) {
    return null
  }

  return (
    <Pressable
      style={styles.floatingCartButton}
      onPress={() => navigation.navigate('My Orders', { screen: 'CreateOrderScreen' })}
    >
      <View style={styles.cartBadge}>
        <TextSemiBold textStyle={styles.cartBadgeText}>
          {cartItems.length}
        </TextSemiBold>
      </View>
      <TextSemiBold textStyle={styles.cartButtonText}>
        {getTotalPrice().toFixed(2)}€
      </TextSemiBold>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color="white"
        style={styles.chevron}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  floatingCartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: GlobalStyles.brandSuccess,
    borderRadius: 50,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000
  },
  cartBadge: {
    backgroundColor: GlobalStyles.brandPrimary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12
  },
  cartButtonText: {
    color: 'white',
    fontSize: 14,
    marginRight: 5
  },
  chevron: {
    marginLeft: 5
  }
})
