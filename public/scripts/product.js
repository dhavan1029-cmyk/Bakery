const addToCart = document.querySelector('#addToCart')
const buyNow = document.querySelector('#buyNow')
const toast = document.querySelector('#toast')
const quantityInp = document.querySelector('#quantity')
const toastMessage = document.querySelector('#toastMessage')
const successToastIcon = document.querySelector('#successToastIcon')
const errToastIcon = document.querySelector('#errToastIcon')
const preorderToastIcon = document.querySelector('#preorderToastIcon')
const productUnavailable = document.querySelector('#productUnavailable')
const productAvailable = document.querySelector('#productAvailable')

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

if(unavailable){
    showToast({success: false, reason: 'product_unavailable', message: 'Product is currently unavailable'})
}

async function addItem(e) {
    try{
        const res = await fetch('/cart', {
            method: 'POST',
            body: JSON.stringify({
                productId: e.currentTarget.getAttribute('data-id'),
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
    // console.log()
    if(!Number.isInteger(+quantity) || quantity < 1) showToast({success: false, message: 'Invalid Quantity'})
    else if(quantity >= 20) showToast({success: false, reason: 'preorder_required', message: 'Orders above 20 items require a preorder.'})
    else window.location.href = `/checkout?productID=${buyNow.getAttribute('data-id')}&quantity=${quantity}`
}

addToCart.addEventListener('click', addItem)

buyNow.addEventListener('click', buyItem)