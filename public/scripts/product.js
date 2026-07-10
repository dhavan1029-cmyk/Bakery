const addToCart = document.querySelector('#addToCart')
const buyNow = document.querySelector('#buyNow')
const toast = document.querySelector('#toast')
const quantityInp = document.querySelector('#quantity')

function showToast(err){

    toast.classList.remove('translate-x-[120%]', 'opacity-0')
    const statusIcon = !err ? document.querySelector('#successToastIcon') : document.querySelector('#errToastIcon')
    statusIcon.classList.remove('hidden')
    addToCart.disabled = true

    setTimeout(() => {
        toast.classList.add('translate-x-[120%]', 'opacity-0')
        statusIcon.classList.add('hidden')
        addToCart.disabled = false
    }, 5000)
}

async function addItem(e) {
    try{
        await fetch('/cart', {
            method: 'POST',
            body: JSON.stringify({
                productId: e.currentTarget.getAttribute('data-id'),
                quantity: +quantityInp.value
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        showToast(false)

    } catch (err) {

    }

}

addToCart.addEventListener('click', addItem)
