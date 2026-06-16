// ======================
// ELEMENTS
// ======================

const noProducts = document.querySelector('#noProducts');
const productCards = [...document.querySelector('#products').children];
const filters = document.querySelectorAll(
    '#cakes, #pastries, #breads, #cookies, #all'
);

const productSearchBar = document.querySelector('#productSearchBar');
const searchResultsBox = document.querySelector('#searchResults');
const loadingAnimation = document.querySelector('#loadingAnimation');
const noSearchResults = document.querySelector('#noSearchResults');

// ======================
// FILTER STYLES
// ======================

const activeClass =
    'bg-[#C9A36B] px-6 py-3 rounded-full font-semibold';

const inactiveClass =
    'bg-white border border-[#E8DCCB] px-6 py-3 rounded-full';

let activeFilter = document.querySelector('#all');

// ======================
// MENU FILTERS
// ======================

if (!products.length) {
    noProducts.classList.remove('hidden');
}

function updateFilterStyles(clickedFilter) {
    activeFilter.className = inactiveClass;
    clickedFilter.className = activeClass;
    activeFilter = clickedFilter;
}

function filterProducts(filterId) {
    let visibleProducts = 0;

    productCards.forEach(card => {
        const category = card.getAttribute('category');

        const shouldShow =
            filterId === 'all' ||
            category.toLowerCase() === filterId.toLowerCase();

        card.classList.toggle('hidden', !shouldShow);

        if (shouldShow) {
            visibleProducts++;
        }
    });

    noProducts.classList.toggle(
        'hidden',
        visibleProducts > 0
    );
}

filters.forEach(filter => {
    filter.addEventListener('click', () => {
        filterProducts(filter.id);
        updateFilterStyles(filter);
    });
});

// ======================
// SEARCH
// ======================

let resultElements = [];

async function fetchSearchResults(searchValue) {
    const response = await fetch(
        `/search?q=${encodeURIComponent(searchValue)}`
    );

    return response.json();
}

function clearSearchResults() {
    resultElements.forEach(element => element.remove());
    resultElements = [];
}

function showLoading() {
    loadingAnimation.classList.remove('hidden');
}

function hideLoading() {
    loadingAnimation.classList.add('hidden');
}

function createResultElement(product) {
    const element = document.createElement('a');

    element.href = `/product/${product._id}`;

    element.className =
        'flex items-center gap-4 p-4 hover:bg-[#F8F4EE] transition border-b border-[#F3ECE3]';

    element.innerHTML = `
        <div class="w-14 h-14 rounded-lg bg-[#E8DCCB] overflow-hidden">

            <img
                src="${product.image}"
                class="w-full h-full object-cover"
            >

        </div>

        <div>

            <h4 class="font-semibold">
                ${product.name}
            </h4>

            <p class="text-sm text-[#6B5B50]">
                ₹${product.price}
            </p>

        </div>
    `;

    return element;
}

async function handleSearch(searchValue) {

    clearSearchResults();

    if (!searchValue.trim()) {
        searchResultsBox.classList.add('hidden');
        return;
    }

    searchResultsBox.classList.remove('hidden');

    noSearchResults.classList.add('hidden');

    showLoading();

    const data = await fetchSearchResults(searchValue);

    hideLoading();

    if (!data.products.length) {
        noSearchResults.classList.remove('hidden');
        return;
    }

    resultElements = data.products.map(createResultElement);

    searchResultsBox.append(...resultElements);
}

productSearchBar.addEventListener('input', e => {
    handleSearch(e.target.value);
});

// ======================
// CLOSE SEARCH DROPDOWN
// ======================

document.addEventListener('click', e => {

    const clickedInsideSearch =
        searchResultsBox.contains(e.target) ||
        productSearchBar.contains(e.target);

    if (clickedInsideSearch) return;

    searchResultsBox.classList.add('hidden');

    noSearchResults.classList.add('hidden');

    clearSearchResults();

});