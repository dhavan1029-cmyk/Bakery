const items = document.querySelectorAll('.items')
const removeBtns = document.querySelectorAll('.remove-btn')
const increaseBtns = document.querySelectorAll('.increase-btn')
const decreaseBtns = document.querySelectorAll('.decrease-btn')
const cart = document.querySelector('#cart')
const emptyCart = document.querySelector('#emptyCart')
const subtotal = document.querySelector('#subtotal')
const total = document.querySelector('#total')


async function removeItem (e) {

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

    const updatedTotal = await res.json()
    cartItem.remove()

    subtotal.textContent = '₹' + updatedTotal.subtotal
    total.textContent = '₹' + updatedTotal.total

    if(!document.querySelector('.items')) {
        cart.classList.add('hidden')
        emptyCart.classList.remove('hidden')
    }

}

async function changeQty (e) {
    const qty = e.currentTarget.parentElement.querySelector('.quantity')
    const item = e.currentTarget.closest('.items')
    const lineTotal = item.querySelector('.line-total')
    
    const res = await fetch('/cart', {
        method: 'PATCH',
        body: JSON.stringify({
            productId: e.currentTarget.getAttribute('data-id'),
            updateQty: e.currentTarget.classList.contains('increase-btn') ? 1 : -1
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })

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