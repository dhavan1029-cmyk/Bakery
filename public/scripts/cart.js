const socket = io()

socket.on('order status changed', notification => {
    showNotification(notification.message)
})


const items = document.querySelectorAll('.items')
const removeBtns = document.querySelectorAll('.remove-btn')
const increaseBtns = document.querySelectorAll('.increase-btn')
const decreaseBtns = document.querySelectorAll('.decrease-btn')
const cart = document.querySelector('#cart')
const emptyCart = document.querySelector('#emptyCart')
const subtotal = document.querySelector('#subtotal')
const total = document.querySelector('#total')
const cartWarning = document.querySelector("#cartWarning");
const checkoutBtn = document.querySelector('#checkoutBtn')


function updateCartWarning() {

    const unavailableItems =
        document.querySelectorAll('.unavailable');

    const quantityWarnings =
        document.querySelectorAll('.quantity-exceeded-warning:not(.hidden)');

    const hasProblems =
        unavailableItems.length > 0 ||
        quantityWarnings.length > 0;

    checkoutBtn.disabled = hasProblems;

    cartWarning.classList.toggle(
        'hidden',
        unavailableItems.length === 0
    );
}

async function removeItem (e) {
    showLoading('Removing item from your cart...')

    const cartItem = e.currentTarget.closest('.items')
        
    const res = await fetch('/cart', {
        method: 'DELETE',
        body: JSON.stringify({
            itemId: e.currentTarget.dataset.id
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    hideLoading()

    const updatedCartInfo = await res.json()

    if(!updatedCartInfo.success) {
        alert(updatedCartInfo.message)
        return
    }

    cartItem.remove()

    subtotal.textContent = '₹' + updatedCartInfo.subtotal
    total.textContent = '₹' + updatedCartInfo.total

    if(!document.querySelector('.items')) {
        cart.classList.add('hidden')
        emptyCart.classList.remove('hidden')
    }

    updateCartWarning()

}


async function changeQty(e) {

    const qtyBtn = e.currentTarget;
    const qty = qtyBtn.parentElement.querySelector('.quantity');
    const item = qtyBtn.closest('.items');
    const lineTotal = item.querySelector('.line-total');
    const quantityExceededWarning =
        item.querySelector('.quantity-exceeded-warning');

    const isIncrease =
        qtyBtn.classList.contains('increase-btn');

    const isDecrease =
        qtyBtn.classList.contains('decrease-btn');

    const currentQty = +qty.textContent;
    const maxQty = +qtyBtn.getAttribute('max');

    // Don't allow increasing beyond the client-side limit.
    if (currentQty >= maxQty && isIncrease) {
        return;
    }

    if (currentQty <= 1 && isDecrease) {
        showLoading();
    }

    try {

        const res = await fetch('/cart', {
            method: 'PATCH',

            body: JSON.stringify({
                productId: qtyBtn.dataset.id,
                updateQty: isIncrease ? 1 : -1
            }),

            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            return;
        }

        const updatedCartDetails = await res.json();

        if (!updatedCartDetails.success) {
            alert(updatedCartDetails.message);
            return;
        }

        /*
         * Only update the quantity-exceeded UI after
         * the server confirms the quantity change.
         */
        if (
            quantityExceededWarning &&
            isDecrease &&
            !quantityExceededWarning.classList.contains('hidden') &&
            updatedCartDetails.qty <= maxQty
        ) {

            quantityExceededWarning.classList.add('hidden');

            item.classList.remove(
                'border-2',
                'border-red-200'
            );

            updateCartWarning()
        }

        if (updatedCartDetails.qty <= 0) {

            item.remove();

            if (!document.querySelector('.items')) {

                cart.classList.add('hidden');
                emptyCart.classList.remove('hidden');

            }

            updateCartWarning();

        } else {

            qty.textContent = updatedCartDetails.qty;

            lineTotal.textContent =
                '₹' + updatedCartDetails.lineTotal;
        }

        subtotal.textContent =
            '₹' + updatedCartDetails.subtotal;

        total.textContent =
            '₹' + updatedCartDetails.total;

    } catch (err) {

        console.error(err);

    } finally {

        hideLoading();

    }
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