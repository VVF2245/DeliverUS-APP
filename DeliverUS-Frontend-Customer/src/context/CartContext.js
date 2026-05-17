import { createContext, useState } from 'react'

// Contexto para gestionar el carrito de compras de DeliverUS
const CartContext = createContext()

const CartContextProvider = props => {
  const [order, setOrder] = useState({ restaurantId: null, items: [], orderId: null, shippingCosts: 0 })

  const addProduct = (product, quantity, newRestaurantId, shippingCosts = 0) => {
    setOrder(prevOrder => {
      // Convertir a número para asegurar comparación correcta
      const newRestId = Number(newRestaurantId)
      const currentRestId = prevOrder.restaurantId
        ? Number(prevOrder.restaurantId)
        : null

      // Si cambió de restaurante, limpiar carrito
      if (currentRestId && currentRestId !== newRestId) {
        console.log(
          `Cambio de restaurante detectado: ${currentRestId} -> ${newRestId}. Limpiando carrito.`
        )
        return {
          restaurantId: newRestId,
          items: [{ ...product, quantity }],
          orderId: null,
          shippingCosts
        }
      }

      // Si es el primer producto
      if (!currentRestId) {
        console.log(`Primer producto añadido de restaurante ${newRestId}`)
        return {
          restaurantId: newRestId,
          items: [{ ...product, quantity }],
          orderId: prevOrder.orderId,
          shippingCosts
        }
      }

      // Mismo restaurante - buscar si el producto ya existe
      console.log(`Añadiendo a carrito del restaurante ${newRestId}`)
      const existingItem = prevOrder.items.find(item => item.id === product.id)

      if (existingItem) {
        console.log(`Producto ${product.id} ya existe. Actualizando cantidad.`)
        return {
          ...prevOrder,
          items: prevOrder.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
          shippingCosts
        }
      } else {
        console.log(`Producto ${product.id} es nuevo. Añadiendo.`)
        return {
          ...prevOrder,
          items: [...prevOrder.items, { ...product, quantity }],
          shippingCosts
        }
      }
    })
  }

  const removeProduct = productId => {
    setOrder(prevOrder => ({
      ...prevOrder,
      items: prevOrder.items.filter(item => item.id !== productId)
    }))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeProduct(productId)
    } else {
      setOrder(prevOrder => ({
        ...prevOrder,
        items: prevOrder.items.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      }))
    }
  }

  const clearCart = () => {
    setOrder({ restaurantId: null, items: [], orderId: null, shippingCosts: 0 })
  }

  const getTotalPrice = () => {
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  const getTotalPriceWithShipping = () => {
    const subtotal = getTotalPrice()
    // El backend aplica gastos de envío solo si el total es <= 10
    if (subtotal <= 10) {
      return subtotal + order.shippingCosts
    }
    return subtotal
  }

  const getTotalItems = () => {
    return order.items.reduce((total, item) => total + item.quantity, 0)
  }

  const loadOrderIntoCart = orderToEdit => {
    setOrder({
      restaurantId: orderToEdit.restaurantId,
      orderId: orderToEdit.id,
      shippingCosts: orderToEdit.shippingCosts || 0,
      items: orderToEdit.products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price ?? p.OrderProducts.unityPrice,
        quantity: p.OrderProducts.quantity
      }))
    })
  }

  return (
    <CartContext.Provider
      value={{
        cartItems: order.items,
        restaurantId: order.restaurantId,
        orderId: order.orderId,
        shippingCosts: order.shippingCosts,
        addProduct: addProduct,
        removeProduct: removeProduct,
        updateQuantity: updateQuantity,
        clearCart: clearCart,
        getTotalPrice: getTotalPrice,
        getTotalPriceWithShipping: getTotalPriceWithShipping,
        getTotalItems: getTotalItems,
        loadOrderIntoCart: loadOrderIntoCart
      }}
    >
      {props.children}
    </CartContext.Provider>
  )
}

export { CartContext }
export default CartContextProvider
