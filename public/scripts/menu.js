const noProducts = document.querySelector('#noProducts')
const productCards = document.querySelector('#products').children
const filters = document.querySelectorAll('#cakes, #pastries, #breads, #cookies, #all')

if(!products.length){
    noProducts.classList.remove('hidden')
}

let prevFilter = document.querySelector('#all')

filters.forEach(filter => {
    filter.addEventListener('click', function(e){
        Array.from(productCards).forEach(card => {
            const category = card.getAttribute('category')
            let availability = false

            if(filter.id.toLowerCase() !== category.toLowerCase() && filter.id !== 'all'){
                card.classList.add('hidden')
            }else{
                card.classList.remove('hidden')
                availability = true
            }

            if(!availability) noProducts.classList.add('hidden')
            
            prevFilter.className = "bg-white border border-[#E8DCCB] px-6 py-3 rounded-full"
            e.target.className = 'bg-[#C9A36B] px-6 py-3 rounded-full font-semibold'
            prevFilter = e.target
        })
    })
});