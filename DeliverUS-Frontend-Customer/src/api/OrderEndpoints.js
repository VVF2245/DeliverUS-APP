import { get, post, put, destroy } from './helpers/ApiRequestsHelper'
function getUserOrders() {
  return get('orders')
}
function getDetail(id) {
  return get(`orders/${id}`)
}
function createOrder(cart) {
  return post('orders', cart)
}
function updateOrder(orderId, cart) {
  console.log(cart)
  return put(`orders/${orderId}`, cart)
}

function remove(id) {
  return destroy(`orders/${id}`)
}
export { getUserOrders, getDetail, createOrder, updateOrder, remove }
