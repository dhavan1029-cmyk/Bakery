const socket = io()

socket.on('order status changed', notification => {
    showNotification(notification.message)
})

const addToCart = document.querySelector('#addToCart')
const buyNow = document.querySelector('#buyNow')
const toast = document.querySelector('#toast')
const quantityInp = document.querySelector('#quantity')
const toastMessage = document.querySelector('#toastMessage')
const successToastIcon = document.querySelector('#successToastIcon')
const errToastIcon = document.querySelector('#errToastIcon')
const productUnavailable = document.querySelector('#productUnavailable')
const productAvailable = document.querySelector('#productAvailable')
const productName = document.querySelector('#productName')

successToastIcon.classList.add('hidden')

function showToast(productStatus){
    toast.classList.remove('translate-x-[120%]', 'opacity-0')
    let statusIcon;

    if(!productStatus.success && productStatus.reason === 'preorder_required'){
        statusIcon = preorderToastIcon
    } else if (!productStatus.success && productStatus.reason === 'product_unavailable') {
        statusIcon = errToastIcon
        productAvailable.classList.add('hidden')
        productUnavailable.classList.remove('hidden')
    } else if (!productStatus.success) {
        statusIcon = errToastIcon
    } else {
        statusIcon = successToastIcon
    }

    statusIcon.classList.remove('hidden')
    toastMessage.textContent = productStatus.message

    addToCart.disabled = true

    setTimeout(() => {
        toast.classList.add('translate-x-[120%]', 'opacity-0')

        statusIcon.classList.add('hidden')
        addToCart.disabled = false
    }, 5000)
}

if(+quantity > +quantityInp.max){
    showToast({success: false, reason: 'quantity_exceeded', message: `You can order upto ${quantityInp.max} ${productName.textContent.trim()}s per order`})
}

if(unavailable){
    showToast({success: false, reason: 'product_unavailable', message: 'Product is currently unavailable'})
}

async function addItem(e) {
    try{
        const productId = e.currentTarget.getAttribute('data-id')
        const res = await fetch('/cart', {
            method: 'POST',
            body: JSON.stringify({
                productId: productId,
                quantity: +quantityInp.value
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const productStatus = await res.json()
        if(productStatus.reason === 'login_required') {
            window.location.href = '/login?loginRequired=true'
            return
        }

        showToast(productStatus)
    } catch (err) {
        console.log(err)
    }

}

function buyItem(e){
    const quantity = quantityInp.value
    if(+quantity > +quantityInp.max) return



    if(!Number.isInteger(+quantity) || quantity < 1) showToast({success: false, message: 'Invalid Quantity'})
    else window.location.href = `/checkout?productID=${buyNow.getAttribute('data-id')}&quantity=${quantity}`
}

addToCart.addEventListener('click', addItem)

buyNow.addEventListener('click', buyItem)