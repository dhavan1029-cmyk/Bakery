const cancelOrderBtns = document.querySelectorAll('.cancel-order')
const cancelOrderModal = document.querySelector('#cancel-order-modal')
const confirmCancel = document.querySelector('#confirm-cancel-order-btn')
const keepOrder = document.querySelector('#keep-order-btn')
const reorderBtns = document.querySelectorAll('.reorder')
const filters = document.querySelectorAll('.filters')
const orders = document.querySelectorAll('.orders')
const noFilterResults = document.querySelector('#no-filter-results')


const activeFilterClass = 'filters px-6 py-3 rounded-full bg-[#C9A36B] text-[#2F241D] font-semibold'
const inactiveFilterClass = 'filters px-6 py-3 rounded-full border border-[#E8DCCB] hover:border-[#C9A36B] hover:bg-white transition'
let activeFilter = document.querySelector('#all')
filters.forEach(filter => {
    filter.addEventListener('click', e => {
        noFilterResults.classList.add('hidden')

        const unfilteredOrderClass = e.currentTarget.id === 'active' ? 'preparing' : e.currentTarget.id
        let unfilteredOrdersCount = 0

        orders.forEach(order => {
            if(order.classList.contains(unfilteredOrderClass) || unfilteredOrderClass === 'all'){
                order.classList.remove('hidden')
                unfilteredOrdersCount++
            }else {
                order.classList.add('hidden')
            }

        
        })

        if(unfilteredOrdersCount <= 0) {
            noFilterResults.classList.remove('hidden')
        }

        activeFilter.className = inactiveFilterClass
        e.currentTarget.className = activeFilterClass

        activeFilter = e.currentTarget 

    })
})

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