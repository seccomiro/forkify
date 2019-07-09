import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader } from './views/base';

// Global state of the app
//  Search objet
//  Current recipe objet
//  Shooping list object
//  Liked recipes
const state = {};

////////////////////
// SEARCH CONTROLLER
////////////////////
const controlSearch = async () => {
  // 1. get the query from the view
  const query = searchView.getInput();
  if (query) {
    // 2. new search object and add it to state
    state.search = new Search(query);

    // 3. prepare UI for results
    searchView.clearInput();
    searchView.clearResult();
    renderLoader(elements.searchResult);

    try {
      // 4. search for recipes (async)
      await state.search.getResults();
  
      // 5. render results on UI
      // console.log(state.search.result);
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert('Something went wrong with the search.');
      console.error(error);
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const button = e.target.closest('.btn-inline');
  if (button) {
    const goToPage = parseInt(button.dataset.goto, 10);
    searchView.clearResult();
    searchView.renderResults(state.search.result, goToPage);
  }
});

////////////////////
// RECIPE CONTROLLER
////////////////////

const controlRecipe = async () => {
  const id = window.location.hash.replace('#', '');
  
  if (id) {
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
  
    if (state.search)
      searchView.highlightSelected(id);

    state.recipe = new Recipe(id);
    try {
      await state.recipe.getRecipe();
      state.recipe.calcTime();
      state.recipe.calcServings();

      // console.log(state.recipe);

      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (error) {
      alert('Error processing recipe.');
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

////////////////////
// LIST CONTROLLER
////////////////////

const controlList = () => {
  // Create a new list if there is none yet
  if (!state.list)
    state.list = new List();
  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(ing => {
    const item = state.list.addItem(ing.count, ing.unit, ing.ingredient);
    listView.renderItem(item);
  });
};

// Handling recipe buttons clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.servings > 1)
      state.recipe.updateServings('dec');
  } else if (e.target.matches('.btn-increase, .btn-increase *'))
    state.recipe.updateServings('inc');
  else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    controlList();
  }
  recipeView.updateServingsIngredients(state.recipe);
  // console.log(state.recipe);
});

window.l = new List();