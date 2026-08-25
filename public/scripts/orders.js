window.addEventListener('pageshow', e => {
    hideLoading()
})

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


const socket = io()

socket.on('order status changed', notification => {
    showNotification(notification.message)
    updateOrderCard(notification);
})


function updateOrderCard(data) {

    const {
        orderId,
        status,
        paymentStatus,
        paymentMethod,
        total,
        subtotal,
        deliveryFee
    } = data;

    const orderCard = document.querySelector(
        `[data-order-id="${orderId}"]`
    );

    console.log(orderCard)

    // Order isn't present on this page
    if (!orderCard) return;


    /*
    |--------------------------------------------------------------------------
    | UPDATE CARD STATUS
    |--------------------------------------------------------------------------
    */

    orderCard.dataset.status = status;


    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS BADGE
    |--------------------------------------------------------------------------
    */

    updateStatusBadge(orderCard, status);


    /*
    |--------------------------------------------------------------------------
    | UPDATE CANCELLED MESSAGE
    |--------------------------------------------------------------------------
    */

    updateCancelledMessage(orderCard, status);


    /*
    |--------------------------------------------------------------------------
    | UPDATE PRODUCT OPACITY
    |--------------------------------------------------------------------------
    */

    const products = orderCard.querySelector('.order-products');

    if (products) {

        products.classList.toggle(
            'opacity-60',
            status === 'Cancelled'
        );

    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE PAYMENT
    |--------------------------------------------------------------------------
    */

    updatePayment(orderCard, paymentMethod, paymentStatus);


    /*
    |--------------------------------------------------------------------------
    | UPDATE PRICE
    |--------------------------------------------------------------------------
    */

    updatePrice(
        orderCard,
        subtotal,
        deliveryFee,
        total
    );


    /*
    |--------------------------------------------------------------------------
    | UPDATE ACTION BUTTONS
    |--------------------------------------------------------------------------
    */

    updateOrderActions(orderCard, {
        orderId,
        status
    });

}

function updateStatusBadge(orderCard, status) {

    const badge = orderCard.querySelector('.order-status');

    if (!badge) return;


    const statusText = badge.querySelector('.order-status-text');
    const statusIcon = badge.querySelector('.order-status-icon');


    const styles = {

        Delivered: [
            'bg-green-100',
            'text-green-700'
        ],

        Cancelled: [
            'bg-red-100',
            'text-red-700'
        ],

        Baking: [
            'bg-orange-100',
            'text-orange-700'
        ],

        'Out for Delivery': [
            'bg-blue-100',
            'text-blue-700'
        ],

        Preparing: [
            'bg-yellow-100',
            'text-yellow-700'
        ]

    };


    // Remove old status classes

    badge.classList.remove(
        'bg-green-100',
        'text-green-700',
        'bg-red-100',
        'text-red-700',
        'bg-orange-100',
        'text-orange-700',
        'bg-blue-100',
        'text-blue-700',
        'bg-yellow-100',
        'text-yellow-700'
    );


    // Add new status classes

    const newStyles = styles[status] || [
        'bg-gray-100',
        'text-gray-700'
    ];

    badge.classList.add(...newStyles);


    // Update text

    if (statusText) {
        statusText.textContent = status;
    }


    // Update icon

    if (statusIcon) {

        const icons = {

            Delivered: 'fa-circle-check',

            Cancelled: 'fa-circle-xmark',

            'Out for Delivery': 'fa-truck',

            Baking: 'fa-fire',

            Preparing: 'fa-clock'

        };

        const icon = icons[status] || 'fa-clock';


        statusIcon.innerHTML = `
            <i class="fa-solid ${icon} mr-2"></i>
        `;

    }

}

function updateCancelledMessage(orderCard, status) {

    const message = orderCard.querySelector(
        '.cancelled-message'
    );

    if (!message) return;


    if (status === 'Cancelled') {

        message.classList.remove('hidden');
        message.classList.add('flex');

    } else {

        message.classList.remove('flex');
        message.classList.add('hidden');

    }

}

function updatePayment(
    orderCard,
    paymentMethod,
    paymentStatus
) {

    const methodElement = orderCard.querySelector(
        '.payment-method'
    );

    const statusElement = orderCard.querySelector(
        '.payment-status'
    );


    if (methodElement) {

        methodElement.textContent =
            paymentMethod === 'cod'
                ? 'Cash on Delivery'
                : 'Online Payment';

    }


    if (statusElement) {

        statusElement.textContent =
            paymentStatus || '—';


        statusElement.classList.remove(
            'bg-green-100',
            'text-green-700',
            'bg-yellow-100',
            'text-yellow-700'
        );


        if (paymentStatus === 'Paid') {

            statusElement.classList.add(
                'bg-green-100',
                'text-green-700'
            );

        } else {

            statusElement.classList.add(
                'bg-yellow-100',
                'text-yellow-700'
            );

        }

    }

}

function updatePrice(
    orderCard,
    subtotal,
    deliveryFee,
    total
) {

    const subtotalElement =
        orderCard.querySelector('.order-subtotal');

    const deliveryElement =
        orderCard.querySelector('.order-delivery-fee');

    const totalElement =
        orderCard.querySelector('.order-total');


    if (subtotalElement && subtotal !== undefined) {

        subtotalElement.textContent =
            `₹${subtotal}`;

    }


    if (deliveryElement && deliveryFee !== undefined) {

        deliveryElement.textContent =
            `₹${deliveryFee}`;

    }


    if (totalElement && total !== undefined) {

        totalElement.textContent =
            `₹${total}`;

    }

}

function updateOrderActions(orderCard, { orderId, status }) {

    const actions = orderCard.querySelector(
        '.order-actions'
    );

    if (!actions) return;


    let html = `

        <a
            href="/orders/${orderId}"
            class="px-6 py-3 rounded-xl bg-[#C9A36B] hover:bg-[#B89056] font-semibold transition"
        >
            <i class="fa-solid fa-eye mr-2"></i>
            View Details
        </a>

    `;


    /*
    |--------------------------------------------------------------------------
    | CANCEL
    |--------------------------------------------------------------------------
    */

    if (['Preparing', 'Baking'].includes(status)) {

        html += `

            <button
                type="button"
                class="cancel-order px-6 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                data-id="${orderId}"
            >

                <i class="fa-solid fa-xmark mr-2"></i>

                Cancel Order

            </button>

        `;

    }


    /*
    |--------------------------------------------------------------------------
    | REORDER
    |--------------------------------------------------------------------------
    */

    if (['Delivered', 'Cancelled'].includes(status)) {

        html += `

            <button
                type="button"
                class="reorder px-6 py-3 rounded-xl border border-[#E8DCCB] hover:bg-white transition"
                data-id="${orderId}"
            >

                <i class="fa-solid fa-rotate-right mr-2"></i>

                Reorder

            </button>

        `;

    }


    /*
    |--------------------------------------------------------------------------
    | TRACK
    |--------------------------------------------------------------------------
    */

    if (status === 'Out for Delivery') {

        html += `

            <a
                href="/orders/${orderId}"
                class="track-order px-6 py-3 rounded-xl border border-[#E8DCCB] hover:bg-white transition"
            >

                <i class="fa-solid fa-location-dot mr-2"></i>

                Track Order

            </a>

        `;

    }


    actions.innerHTML = html;

}




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
    
    showLoading('Cancelling your order...')

    await fetch(`/orders/${cancelOrderId}/cancel`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        }
    }) 

    hideLoading()

    window.location.reload()
} 



function reorder(e) {
    const reorderId = e.currentTarget.getAttribute('data-id')

    showLoading('Preparing your previous order...');
    ('dfdf')
    window.location.href = `/checkout?reorderId=${reorderId}`
} 


confirmCancel.addEventListener('click', async (e) => {
    await cancelOrder(e)
})

reorderBtns.forEach(btn => {
    btn.addEventListener('click', reorder)
})