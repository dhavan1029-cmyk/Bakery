const cancelOrderBtns = document.querySelectorAll('.cancel-order')
const cancelOrderModal = document.querySelector('#cancel-order-modal')
const confirmCancel = document.querySelector('#confirm-cancel-order-btn')
const keepOrder = document.querySelector('#keep-order-btn')
const reorderBtns = document.querySelectorAll('.reorder')

let cancelOrderId;

cancelOrderBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        cancelOrderId = e.currentTarget.getAttribute('data-id')
        cancelOrderModal.classList.remove('hidden')
    })
})

keepOrder.addEventListener('click', (e) => {
    cancelOrderModal.classList.add('hidden')
})

async function cancelOrder(e) {
    // console.log(cancelOrderId)
    await fetch(`/orders/${cancelOrderId}/cancel`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        }
    })

    window.location.reload()
} 

async function reorder(e) {
    const reorderId = e.currentTarget.getAttribute('data-id')
    window.location.href = `/checkout?reorderId=${reorderId}`
} 


confirmCancel.addEventListener('click', async (e) => {
    await cancelOrder(e)
})

reorderBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        await reorder(e)
    })
})