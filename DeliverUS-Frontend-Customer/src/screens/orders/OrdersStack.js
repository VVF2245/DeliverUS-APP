import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import OrdersScreen from './OrdersScreen'
import OrderDetailScreen from './OrderDetailScreen'
import CreateOrderScreen from './CreateOrderScreen'
import RestaurantDetailScreen from '../restaurants/RestaurantDetailScreen'

const Stack = createNativeStackNavigator()

export default function OrdersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrdersScreen"
        component={OrdersScreen}
        options={{
          title: 'My Orders'
        }}
      />
      <Stack.Screen
        name="OrderDetailScreen"
        component={OrderDetailScreen}
        options={{
          title: 'Order Detail'
        }}
      />
      <Stack.Screen
        name="CreateOrderScreen"
        component={CreateOrderScreen}
        options={{
          title: 'Confirm Order'
        }}
      />
      <Stack.Screen
        name="RestaurantDetailScreen"
        component={RestaurantDetailScreen}
        options={{
          title: 'Restaurant Detail'
        }}
      />
    </Stack.Navigator>
  )
}
