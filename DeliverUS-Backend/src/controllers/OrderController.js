import { Order, Product, Restaurant, User, sequelizeSession } from '../models/models.js'
import moment from 'moment'
import { Op } from 'sequelize'
const generateFilterWhereClauses = function (req) {
  const filterWhereClauses = []
  if (req.query.status) {
    switch (req.query.status) {
      case 'pending':
        filterWhereClauses.push({
          startedAt: null
        })
        break
      case 'in process':
        filterWhereClauses.push({
          [Op.and]: [
            {
              startedAt: {
                [Op.ne]: null
              }
            },
            { sentAt: null },
            { deliveredAt: null }
          ]
        })
        break
      case 'sent':
        filterWhereClauses.push({
          [Op.and]: [
            {
              sentAt: {
                [Op.ne]: null
              }
            },
            { deliveredAt: null }
          ]
        })
        break
      case 'delivered':
        filterWhereClauses.push({
          sentAt: {
            [Op.ne]: null
          }
        })
        break
    }
  }
  if (req.query.from) {
    const date = moment(req.query.from, 'YYYY-MM-DD', true)
    filterWhereClauses.push({
      createdAt: {
        [Op.gte]: date
      }
    })
  }
  if (req.query.to) {
    const date = moment(req.query.to, 'YYYY-MM-DD', true)
    filterWhereClauses.push({
      createdAt: {
        [Op.lte]: date.add(1, 'days') // FIXME: se pasa al siguiente día a las 00:00
      }
    })
  }
  return filterWhereClauses
}

// Returns :restaurantId orders
const indexRestaurant = async function (req, res) {
  const whereClauses = generateFilterWhereClauses(req)
  whereClauses.push({
    restaurantId: req.params.restaurantId
  })
  try {
    const orders = await Order.findAll({
      where: whereClauses,
      include: {
        model: Product,
        as: 'products'
      }
    })
    res.json(orders)
  } catch (err) {
    res.status(500).send(err)
  }
}

// Hecho(Lo dejo temporalmente para que se vea lo que pedian): Implement the indexCustomer function that queries orders from current logged-in customer and send them back.
// Orders have to include products that belongs to each order and restaurant details
// sort them by createdAt date, desc.
const indexCustomer = async function (req, res) {
  try {
    const orders = await Order.findAll(
      {
        where: { userId: req.user.id },
        include: [{
          model: Product,
          as: 'products'
        },
        {
          model: Restaurant,
          as: 'restaurant'
        }
        ],
        order: [['createdAt', 'DESC']]
      })
    res.json(orders)
  } catch (err) {
    res.status(500).send(err)
  }
}

// Hecho(Lo dejo temporalmente para que se vea lo que pedian): Implement the create function that receives a new order and stores it in the database.
// Take into account that:
// 1. If price is greater than 10€, shipping costs have to be 0.
// 2. If price is less or equals to 10€, shipping costs have to be restaurant default shipping costs and have to be added to the order total price
// 3. In order to save the order and related products, start a transaction, store the order, store each product linea and commit the transaction
// 4. If an exception is raised, catch it and rollback the transaction

const create = async (req, res) => {
  const transaction = await sequelizeSession.transaction()

  try {
    const orderData = req.body

    // Obtener restaurante para saber sus gastos de envío
    const restaurant = await Restaurant.findByPk(orderData.restaurantId)
    let shippingCosts = 0
    let totalPrice = 0

    for (const item of orderData.products) {
      const dbProduct = await Product.findByPk(item.productId)
      totalPrice += dbProduct.price * item.quantity
    }

    if (totalPrice <= 10) {
      shippingCosts = restaurant.shippingCosts
      totalPrice += shippingCosts
    }

    // Crear pedido
    const order = await Order.create({
      price: totalPrice,
      address: orderData.address,
      restaurantId: orderData.restaurantId,
      userId: req.user.id,
      shippingCosts
    }, { transaction })

    for (const item of orderData.products) {
      const dbProduct = await Product.findByPk(item.productId)

      await order.addProduct(dbProduct.id, {
        through: {
          quantity: item.quantity, //  del request
          unityPrice: dbProduct.price // de la BD
        },
        transaction
      })
    }
    // Confirmar transacción
    await transaction.commit()

    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'unityPrice'] }
        },
        {
          model: Restaurant,
          as: 'restaurant'
        }
      ]
    })

    res.status(200).json(createdOrder)
  } catch (error) {
    // Revertir si algo falla
    await transaction.rollback()
    res.status(500).json({ error: error.message })
  }
}

// Hecho(Lo dejo temporalmente para que se vea lo que pedian): Implement the update function that receives a modified order and persists it in the database.
// Take into account that:
// 1. If price is greater than 10€, shipping costs have to be 0.
// 2. If price is less or equals to 10€, shipping costs have to be restaurant default shipping costs and have to be added to the order total price
// 3. In order to save the updated order and updated products, start a transaction, update the order, remove the old related OrderProducts and store the new product lines, and commit the transaction
// 4. If an exception is raised, catch it and rollback the transaction
const update = async function (req, res) {
  const transaction = await sequelizeSession.transaction()

  try {
    const orderData = req.body
    const orderId = req.params.orderId

    // Obtener el restaurante para calcular gastos de envío
    const restaurant = await Restaurant.findByPk(orderData.restaurantId)

    if (!restaurant) {
      await transaction.rollback()
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    // Calcular gastos de envío y precio total
    let shippingCosts = 0
    let totalPrice = orderData.price

    if (orderData.price <= 10) {
      shippingCosts = restaurant.shippingCosts
      totalPrice += shippingCosts
    }

    // Obtener la orden existente
    const order = await Order.findByPk(orderId, { transaction })

    if (!order) {
      await transaction.rollback()
      return res.status(404).json({ error: 'Order not found' })
    }

    // Actualizar datos de la orden
    await order.update({
      price: totalPrice,
      address: orderData.address,
      restaurantId: orderData.restaurantId,
      shippingCosts
    }, { transaction })

    // Eliminar productos antiguos relacionados
    await order.setProducts([], { transaction })

    // Crear nuevas líneas de productos
    for (const product of orderData.products) {
      await order.addProduct(product.productId, {
        through: {
          quantity: product.quantity,
          unityPrice: product.unityPrice
        },
        transaction
      })
    }

    // Confirmar transacción
    await transaction.commit()

    res.status(200).json(order)
  } catch (error) {
    // Revertir transacción en caso de error
    await transaction.rollback()
    res.status(500).json({ error: error.message })
  }
}
// TODO: Implement the destroy function that receives an orderId as path param and removes the associated order from the database.
// Take into account that:
// 1. The migration include the "ON DELETE CASCADE" directive so OrderProducts related to this order will be automatically removed.
const destroy = async function (req, res) {
  const transaction = await sequelizeSession.transaction()

  try {
    const orderId = req.params.orderId // el nombre tiene que coincidir con el del path param de la ruta

    // Buscar la orden
    const order = await Order.findByPk(orderId, { transaction })

    if (!order) {
      await transaction.rollback()
      return res.status(404).json({ error: 'Order not found' })
    }

    // Eliminar la orden
    await order.destroy({ transaction })

    // Confirmar transacción
    await transaction.commit()

    res.status(200).json({ message: 'Order deleted successfully' })
  } catch (error) {
    // Revertir si algo falla
    await transaction.rollback()
    res.status(500).json({ error: error.message })
  }
}
const confirm = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (!order) {
      return res.status(404).send('Orden no encontrada')
    }
    const estado = order.getStatus()
    if (estado !== 'pending') {
      return res.status(422).send('Solo se confirman pedidos que esten pendientes de confirmación')
    }
    order.startedAt = new Date()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const send = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.sentAt = new Date()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const deliver = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.deliveredAt = new Date()
    const updatedOrder = await order.save()
    const restaurant = await Restaurant.findByPk(order.restaurantId)
    const averageServiceTime = await restaurant.getAverageServiceTime()
    await Restaurant.update({ averageServiceMinutes: averageServiceTime }, { where: { id: order.restaurantId } })
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const show = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId']
      },
      {
        model: User,
        as: 'user',
        attributes: ['firstName', 'email', 'avatar', 'userType']
      },
      {
        model: Product,
        as: 'products'
      }]
    })
    res.json(order)
  } catch (err) {
    res.status(500).send(err)
  }
}

const analytics = async function (req, res) {
  const yesterdayZeroHours = moment().subtract(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const todayZeroHours = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  try {
    const numYesterdayOrders = await Order.count({
      where:
      {
        createdAt: {
          [Op.lt]: todayZeroHours,
          [Op.gte]: yesterdayZeroHours
        },
        restaurantId: req.params.restaurantId
      }
    })
    const numPendingOrders = await Order.count({
      where:
      {
        startedAt: null,
        restaurantId: req.params.restaurantId
      }
    })
    const numDeliveredTodayOrders = await Order.count({
      where:
      {
        deliveredAt: { [Op.gte]: todayZeroHours },
        restaurantId: req.params.restaurantId
      }
    })

    const invoicedToday = await Order.sum(
      'price',
      {
        where:
        {
          createdAt: { [Op.gte]: todayZeroHours }, // FIXME: Created or confirmed?
          restaurantId: req.params.restaurantId
        }
      })
    res.json({
      restaurantId: req.params.restaurantId,
      numYesterdayOrders,
      numPendingOrders,
      numDeliveredTodayOrders,
      invoicedToday
    })
  } catch (err) {
    res.status(500).send(err)
  }
}

const OrderController = {
  indexRestaurant,
  indexCustomer,
  create,
  update,
  destroy,
  confirm,
  send,
  deliver,
  show,
  analytics
}
export default OrderController
