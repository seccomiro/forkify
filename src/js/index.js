import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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

      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
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

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // Handle the delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // Delete from state
    state.list.deleteItem(id);

    // Delete from UI
    listView.deleteItem(id);

  // Handle the count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

////////////////////
// LIKE CONTROLLER
////////////////////

const controlLike = () => {
  if (!state.likes)
    state.likes = new Likes();

  const currentId = state.recipe.id;

  // User has not likes current recipe
  if (!state.likes.isLiked(currentId)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    // Toggle the like button
    likesView.toggleLikeBtn(true);

    // Add like to the UI list
    likesView.renderLike(newLike);
  } else {
    // Remove like to the state
    state.likes.deleteLike(currentId);

    // Toggle the like button
    likesView.toggleLikeBtn(false);

    // Remove like to the UI list
    likesView.deleteLike(currentId);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

window.addEventListener('load', () => {
  state.likes = new Likes();
  state.likes.readStorage();
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe buttons clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  }
  else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    // Add ingredients to shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // Like controller
    controlLike();
  }
});