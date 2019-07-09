const el = q => document.querySelector(q);
const cel = q => document.querySelector(`.${q}`);
const iel = q => document.querySelector(`#${q}`);

export const elements = {
  searchInput: el('.search__field'),
  searchForm: el('.search'),
  searchResultList: el('.results__list'),
  searchResult: el('.results'),
  searchResPages: el('.results__pages'),
  recipe: el('.recipe'),
  shopping: el('.shopping__list')
};

export const elementStrings = {
  loader: 'loader'
}

export const renderLoader = parent => {
  const loader = `
    <div class="${elementStrings.loader}">
      <svg>
        <use href="img/icons.svg#icon-cw"></use>
      </svg>
    </div>
  `;
  parent.insertAdjacentHTML('afterbegin', loader);
};

export const clearLoader = () => {
  const loader = cel(elementStrings.loader);
  if (loader)
    loader.parentElement.removeChild(loader);
};