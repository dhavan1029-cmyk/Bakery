const cancelOrderBtns = document.querySelectorAll('.cancel-order')
const cancelOrderModal = document.querySelector('#cancel-order-modal')
const confirmCancel = document.querySelector('#confirm-cancel-order-btn')
const keepOrder = document.querySelector('#keep-order-btn')

let orderId;
cancelOrderBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        orderId = e.currentTarget.getAttribute('data-id')
        cancelOrderModal.classList.remove('hidden')
    })
})

keepOrder.addEventListener('click', (e) => {
    cancelOrderModal.classList.add('hidden')
})

export async function cancelOrder(e) {
    await fetch(`/orders/${orderId}/cancel`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        }
    })

    window.location.reload()
} 

confirmCancel.addEventListener('click', cancelOrder)