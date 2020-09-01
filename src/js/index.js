import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * - Search Object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {}

/**
 * Search Controller
 */
const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();
    //console.log(query);

    // 2) Create new search object and add to state
    if(query) {
        state.search = new Search(query);
    }

    // 3) Prepare UI for results
    renderLoader(elements.searchRes);
    searchView.clearInput();
    searchView.clearResults();

    try {
        // 4) Search for recipes
        await state.search.getResults();
    
        // 5) Render result in UI
        clearLoader();
        searchView.renderResults(state.search.result);        
    } catch (error) {
        alert('Something went wrong with search');
        clearLoader();
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) { 
        const goToPage = parseInt(btn.dataset.goto, 10)
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/**
 * Recipe Controller
 */
const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected searcch item
        if (state.search)
            searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);


        try {
            // Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
    
            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServing();
    
            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
           
        } catch (error) {
            alert('Error while processing recipe!');
        }
    }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

elements.recipe.addEventListener('click', e => {
    // Decrease button is clicked
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServing('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServing('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }    
});

/**
 * List Controller
 */
window.l = new List();

