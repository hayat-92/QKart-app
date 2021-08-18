const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  let cart=await Cart.findOne({email:user.email})
  if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not have a cart')
  }
  return cart

};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  try {
    usrscart=await Cart.findOne({email: user.email})
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR)
  }
  if(!usrscart){
    usrscart=await Cart.create({ email: user.email })
  }

  // console.log(`Faisal_User${val}`)

  if (usrscart) {
    for (prod of usrscart.cartItems) {
      if ((prod.product)._id.toString() == productId.toString()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Product already in cart. Use the cart sidebar to update or remove product from cart')
      }
    }
  }

  let product= await Product.findById(productId);

  if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database")
  }else{
    let item = { product: product, quantity: quantity };
    try {
      usrscart.cartItems.push(item)
    } catch (error) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR)
    }
    
    await usrscart.save()
  }

  return usrscart



};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  try {
    usrscart=await Cart.findOne({email: user.email})
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR)
  }
  if(!usrscart){
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart. Use POST to create cart and add a product")
  }

  let product= await Product.findById(productId);

  if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database")
  }

  if (usrscart) {
    let indexof_prod= usrscart.cartItems.findIndex((element)=> element.product._id.toString() == productId)

    if(indexof_prod == -1){
      throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart")
    }else{
      usrscart.cartItems[indexof_prod].quantity=quantity
      await usrscart.save()
    }

  }

  return usrscart

};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  let usrscart=await Cart.findOne({email: user.email})

  if(!usrscart){
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart.")
  }

  if (usrscart) {
    let indexof_prod= usrscart.cartItems.findIndex((element)=> {
      if(element.product._id == productId){
        return true
      }else{
        return false
      }
    })

    if(indexof_prod == -1){
      throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart")
    }else{
      usrscart.cartItems.splice(indexof_prod, 1);
      await usrscart.save()
    }  
  }

};


const checkout = async (user) => {

  let cart= await getCartByUser(user); //same cart you are fetching it here using getCartByUser() and below using finOne() use the same
  // suggestion to make it simple
  console.log(user)
  console.log(`Faisal_Checkout-${cart}`)

  if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND)
  }

  let total=0
  for(element of cart.cartItems){
    total = total + element.product.cost*element.quantity
  }

  if(total==0){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty') // cart will be empty only when cart.cartItems.length is 0 why total=0
  }

  let hasSetNonDefaultAddress = await user.hasSetNonDefaultAddress();
  if (!hasSetNonDefaultAddress) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address not set");
  }

  /*
  add this also
 let hasSetNonDefaultAddress = await user.hasSetNonDefaultAddress();
  if (!hasSetNonDefaultAddress) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address not set");
  }

   */
  if(user.address === config.default_address){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Address not set')
  }

  if(user.walletMoney < total){
    throw new ApiError(httpStatus.BAD_REQUEST, 'Wallet balance not sufficient to place order')
  }

  user.walletMoney -= total

  await user.save()

  let crt= await Cart.findOne({email:user.email}) // no need again as you have done above same,  use that cart.cartItems = []
  crt.cartItems=[]
  await crt.save()

};



module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
