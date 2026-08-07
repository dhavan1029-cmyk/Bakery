const items = document.querySelectorAll('.items')
const removeBtns = document.querySelectorAll('.remove-btn')
const increaseBtns = document.querySelectorAll('.increase-btn')
const decreaseBtns = document.querySelectorAll('.decrease-btn')
const cart = document.querySelector('#cart')
const emptyCart = document.querySelector('#emptyCart')
const subtotal = document.querySelector('#subtotal')
const total = document.querySelector('#total')
const cartWarning = document.querySelector("#cartWarning");


function updateCartWarning() {

    if (cartWarning.classList.contains('hidden')) return;

    const unavailableItems = document.querySelectorAll(".unavailable")
    if (!unavailableItems.length) {
        cartWarning.classList.add('hidden');
    }
}

async function removeItem (e) {
    showLoading('Removing item from your cart...')

    const cartItem = e.currentTarget.closest('.items')
        
    const res = await fetch('/cart', {
        method: 'DELETE',
        body: JSON.stringify({
            itemId: e.currentTarget.getAttribute('data-id')
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    hideLoading()

    const updatedTotal = await res.json()
    cartItem.remove()

    subtotal.textContent = '₹' + updatedTotal.subtotal
    total.textContent = '₹' + updatedTotal.total

    if(!document.querySelector('.items')) {
        cart.classList.add('hidden')
        emptyCart.classList.remove('hidden')
    }

    updateCartWarning()

}

async function changeQty (e) {
    const qtyBtn = e.currentTarget
    const qty = qtyBtn.parentElement.querySelector('.quantity')
    const item = qtyBtn.closest('.items')
    const lineTotal = item.querySelector('.line-total')
    const quantityExceededWarning = item.querySelector('.quantity-exceeded-warning')

    if(+qty.textContent <= 1 && qtyBtn.classList.contains('decrease-btn')) showLoading()

    if(!quantityExceededWarning.classList.contains('hidden') && qtyBtn.classList.contains('decrease-btn') && +qty.textContent - 1 <= +qtyBtn.getAttribute('max')){
        quantityExceededWarning.classList.add('hidden')
        item.classList.remove('border-2', 'border-red-200')
    }

    if(+qty.textContent >= +qtyBtn.getAttribute('max') && qtyBtn.classList.contains('increase-btn')) return


    const res = await fetch('/cart', {
        method: 'PATCH',
        body: JSON.stringify({
            productId: qtyBtn.getAttribute('data-id'),
            updateQty: qtyBtn.classList.contains('increase-btn') ? 1 : -1
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    hideLoading()

    const updatedCartDetails = await res.json()

    if(updatedCartDetails.qty <= 0) {
        item.remove()
        if(!document.querySelector('.items')){
            cart.classList.add('hidden')
            emptyCart.classList.remove('hidden')
        }
    } else {
        qty.textContent = updatedCartDetails.qty
        lineTotal.textContent = '₹' + updatedCartDetails.lineTotal
    }

    subtotal.textContent = '₹' + updatedCartDetails.subtotal
    total.textContent = '₹' + updatedCartDetails.total

}   

removeBtns.forEach(btn => {
    btn.addEventListener('click', removeItem)
})

decreaseBtns.forEach(btn => {
    btn.addEventListener('click', changeQty)
})

increaseBtns.forEach(btn => {
    btn.addEventListener('click', changeQty)
})