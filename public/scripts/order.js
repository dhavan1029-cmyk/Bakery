// import { cancelOrder } from "./orders.js";

const cancelOrderBtn = document.querySelector('#cancel-order')
const cancelOrderModal = document.querySelector('#cancel-order-modal')
const confirmCancel = document.querySelector('#confirm-cancel-order-btn')
const keepOrder = document.querySelector('#keep-order-btn')
const orderId = window.location.pathname.split('/')[2]

cancelOrderBtn.addEventListener('click', e => {
    cancelOrderModal.classList.remove('hidden')
})


async function cancelOrder(e) {
    await fetch(`/orders/${orderId}/cancel`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        }
    })

    window.location.reload()
} 


keepOrder.addEventListener('click', e => {
    cancelOrderModal.classList.add('hidden')
})

confirmCancel.addEventListener('click', cancelOrder)