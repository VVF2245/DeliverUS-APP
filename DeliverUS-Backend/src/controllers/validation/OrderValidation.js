import { Restaurant, Product, Order } from "#root/src/models/models.js"
import { check } from 'express-validator'

// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant
const create = [
    check('restaurantId').exists().withMessage('restaurantId is required').isInt().custom( async (value) => {
        const restaurant = await Restaurant.findByPk(value)
        if (!restaurant) throw new Error('Restaurant not found')
    }),
    check('products').exists().isArray({ min: 1 }).custom( async (products, {req}) => {
        const productIds = products.map(p => p.productId)
        const dbProducts = await Product.findAll({
            where: { id: productIds}
        })

        const restaurantIdSet = new Set(dbProducts.map(p => p.restaurantId))
        if (restaurantIdSet.size > 1) throw new Error('All products must belong to the same restaurant')
        
        if (req.body.restaurantId && !restaurantIdSet.has(req.body.restaurantId)) {
            throw new Error('Products do not match the restaurantId in the body')
        }
    }),
    check('products.*.productId').exists().isInt().custom( async (value) => {
        const product = await Product.findByPk(value)
        if (!product) throw new Error('Product does not exist')
        if (!product.availability) throw new Error('Product not available')
    }),
    check('products.*.quantity').exists().isInt({ min: 1 })
]
// TODO: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.
const update = [
    check('restaurantId').not().exists(),
    check('products').exists().isArray({ min: 1 }).custom( async (products, { req }) => {
        const order = await Order.findByPk(req.params.id)
        const productIds = products.map(p => p.productId)
        const dbProducts = await Product.findAll({
            where: { id: productIds}
        })

        const restaurantIdSet = new Set(dbProducts.map(p => p.restaurantId))
        if (restaurantIdSet.size > 1) throw new Error('All products must belong to the same restaurant')

        if ( !order ) throw new Error('Order not found')
        if ( order.getStatus() !== 'pending' ) throw new Error('Order must be pending to edit')
        
    }),
    check('products.*.productId').exists().isInt().custom( async (value) => {
        const product = await Product.findByPk(value)
        if (!product) throw new Error('Product does not exist')
        if (!product.availability) throw new Error('Product not available')
    }),
    check('products.*.quantity').exists().isInt({ min: 1 }),
]

export { create, update }
