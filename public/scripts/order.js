window.addEventListener('pageshow', e => {
    hideLoading()
})

const cancelOrderBtn = document.querySelector('#cancel-order')
const cancelOrderModal = document.querySelector('#cancel-order-modal')
const confirmCancel = document.querySelector('#confirm-cancel-order-btn')
const keepOrder = document.querySelector('#keep-order-btn')
const orderId = window.location.pathname.split('/')[2]
const statusElement = document.getElementById('order-status');
const timelineElement = document.getElementById('order-timeline');
const actionsElement = document.getElementById('order-actions');
const paymentStatusElement = document.getElementById('payment-status');
const orderActions = document.querySelector('#order-actions')

const socket = io()

socket.on('order status changed', notification => {
    showNotification(notification.message)

    if (notification.orderId !== orderId) return;

    updateOrderStatus(notification.status);
    updateTimeline(notification.status);
    updateActions(notification.status);

    if (notification.paymentStatus) {
        updatePaymentStatus(notification.paymentStatus);
    }

})

function updateOrderStatus(status) {

    const styles = {
        Delivered: 'bg-green-100 text-green-700',
        Cancelled: 'bg-red-100 text-red-700',
        Preparing: 'bg-yellow-100 text-yellow-700',
        Baking: 'bg-orange-100 text-orange-700',
        'Out for Delivery': 'bg-blue-100 text-blue-700'
    };

    statusElement.className = `
        inline-flex items-center mt-4 px-6 py-3 rounded-full font-semibold
        ${styles[status] || 'bg-gray-100 text-gray-700'}
    `;

    statusElement.textContent = status;
}

function updateTimeline(status) {

    if (status === 'Cancelled') {

        timelineElement.className =
            'mt-12 flex items-center justify-center';

        timelineElement.innerHTML = `
            <div class="flex flex-col items-center">

                <div
                    class="w-14 h-14 rounded-full flex items-center justify-center
                           bg-red-100 border-2 border-red-500 text-red-600"
                >
                    <i class="fa-solid fa-xmark"></i>
                </div>

                <p class="mt-4 text-center text-sm font-semibold text-red-600">
                    Cancelled
                </p>

            </div>
        `;

        return;
    }

    const steps = [
        'Preparing',
        'Baking',
        'Out for Delivery',
        'Delivered'
    ];

    const currentStep = steps.indexOf(status);

    timelineElement.className =
        'mt-12 flex items-center justify-between';

    timelineElement.innerHTML = steps.map((step, index) => {

        const circleClass =
            index < currentStep
                ? 'bg-[#C9A36B] border-[#C9A36B] text-white'
                : index === currentStep
                ? 'bg-white border-[#C9A36B] text-[#C9A36B]'
                : 'bg-white border-[#E8DCCB] text-[#B8A89A]';

        const circleContent =
            index < currentStep
                ? '<i class="fa-solid fa-check"></i>'
                : index + 1;

        const connector =
            index !== steps.length - 1
                ? `
                    <div
                        class="
                            h-1 flex-1 mb-12
                            ${index < currentStep
                                ? 'bg-[#C9A36B]'
                                : 'bg-[#E8DCCB]'
                            }
                        "
                    ></div>
                  `
                : '';

        return `
            <div class="flex flex-col items-center flex-1">

                <div
                    class="
                        w-14 h-14 rounded-full flex items-center
                        justify-center font-semibold border-2
                        ${circleClass}
                    "
                >
                    ${circleContent}
                </div>

                <p class="mt-4 text-center text-sm font-medium">
                    ${step}
                </p>

            </div>

            ${connector}
        `;

    }).join('');
}

function updateActions(status) {

    if (status === 'Preparing' || status === 'Baking') {

        actionsElement.innerHTML = `
            <button
                id="cancel-order"
                class="
                    bg-red-500 hover:bg-red-600 text-white
                    font-semibold px-8 py-4 rounded-xl transition
                "
            >
                <i class="fa-solid fa-ban mr-2"></i>
                Cancel Order
            </button>
        `;

        return;
    }

    if (status === 'Out for Delivery') {

        actionsElement.innerHTML = `
            <a
                href="/orders/${orderId}/track"
                class="
                    bg-[#C9A36B] hover:bg-[#B89056]
                    text-[#2F241D] font-semibold
                    px-8 py-4 rounded-xl transition
                "
            >
                <i class="fa-solid fa-truck-fast mr-2"></i>
                Track Order
            </a>
        `;

        return;
    }

    if (status === 'Delivered' || status === 'Cancelled') {

        actionsElement.innerHTML = `
            <a
                href="/checkout?reorderId=${orderId}"
                class="
                    bg-[#C9A36B] hover:bg-[#B89056]
                    text-[#2F241D] font-semibold
                    px-8 py-4 rounded-xl transition
                "
                onclick='showLoading("Preparing your previous order...")'
            >
                <i class="fa-solid fa-rotate-right mr-2"></i>
                Reorder
            </a>
        `;

        return;
    }

    actionsElement.innerHTML = '';
}

function updatePaymentStatus(status) {

    paymentStatusElement.textContent = status;

    paymentStatusElement.classList.remove(
        'bg-green-100',
        'text-green-700',
        'bg-yellow-100',
        'text-yellow-700'
    );

    if (status === 'Paid') {

        paymentStatusElement.classList.add(
            'bg-green-100',
            'text-green-700'
        );

    } else {

        paymentStatusElement.classList.add(
            'bg-yellow-100',
            'text-yellow-700'
        );

    }
}


async function cancelOrder(e) {

    showLoading('Cancelling your order...')

    await fetch(`/orders/${orderId}/cancel`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        }
    })

    hideLoading()

    window.location.reload()
} 

orderActions.addEventListener('click', e => {
    const target = e.target.closest('button, a')

    if (!target) return


    if (target.id === 'cancel-order') {

        // Open cancel modal

        cancelOrderModal.classList.remove('hidden')

    }


    if (target.id === 'track-order') {

        // Handle tracking

    }
})

keepOrder.addEventListener('click', e => {
    cancelOrderModal.classList.add('hidden')
})

confirmCancel.addEventListener('click', cancelOrder)