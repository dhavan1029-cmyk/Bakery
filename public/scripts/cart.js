const items = document.querySelectorAll('.items')
const removeBtn = document.querySelectorAll('.remove-btn')
const increaseBtn = document.querySelectorAll('.increase-btn')
const decreaseBtn = document.querySelectorAll('.decrease-btn')
const cart = document.querySelector('#cart')
const emptyCart = document.querySelector('#emptyCart')

removeBtn.forEach(btn => {
    btn.addEventListener('click', async function (e) {
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

        cartItem.remove()

        if(!document.querySelector('.items')) {
            cart.classList.add('hidden')
            emptyCart.classList.remove('hidden')
        }
    })
})

