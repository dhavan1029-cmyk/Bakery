const noProducts = document.querySelector('#noProducts')
const productCards = [...document.querySelector('#products').children]
const filters = document.querySelectorAll('#cakes, #pastries, #breads, #cookies, #all')

const activeClass = 'bg-[#C9A36B] px-6 py-3 rounded-full font-semibold'
const inactiveClass = "bg-white border border-[#E8DCCB] px-6 py-3 rounded-full"

if(!products.length){
    noProducts.classList.remove('hidden')
}

let activeFilter = document.querySelector('#all')

function updateFilterClass(clickedFilter){
    clickedFilter.className = activeClass
    activeFilter.className = inactiveClass
    activeFilter = clickedFilter
}

function filterProducts(filter){
    let productCount = 0

    productCards.forEach(card => {
        const category = card.getAttribute('category')

        if(filter.id.toLowerCase() === category.toLowerCase() || filter.id === 'all'){
            card.classList.remove('hidden') 
            productCount++
        }else{
            card.classList.add('hidden')
        }

    })


    if(productCount < 1) noProducts.classList.remove('hidden')
    else noProducts.classList.add('hidden')
}

filters.forEach(filter => {
    filter.addEventListener('click', function(e){
        
        filterProducts(e.target)
        updateFilterClass(e.target)
        
    })
});