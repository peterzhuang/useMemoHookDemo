import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';
import useHttp from '../../hooks/http';
import uuidV4 from "uuid/v4";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Should not get there!');
  }
};



const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const {isLoading, data, error, sendRequest, reqExtra, reqIdentifier, clear } = useHttp();
  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  useEffect(() => {
    // console.log('RENDERING INGREDIENTS', userIngredients);
    if(!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT') {
      dispatch({ type: 'DELETE', id: reqExtra })
      console.log("dispatching remove!")
    } else if(!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT') {
      dispatch({
              type: 'ADD',
              // ingredient: { id: data.name, ...reqExtra }
              ingredient: { id: uuidV4(), ...reqExtra }
            });
      console.log("dispatching add!")
    }
    
  }, [data, reqExtra, reqIdentifier, isLoading, error ]);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients);
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = useCallback(ingredient => {
    sendRequest('https://react-hooks-update.firebaseio.com/ingredients.json', 'POST', JSON.stringify(ingredient), ingredient, 'ADD_INGREDIENT');
    // dispatchHttp({ type: 'SEND' });
    // fetch('https://react-hooks-update.firebaseio.com/ingredients.json', {
    //   method: 'POST',
    //   body: JSON.stringify(ingredient),
    //   headers: { 'Content-Type': 'application/json' }
    // })
    //   .then(response => {
    //     dispatchHttp({ type: 'RESPONSE' });
    //     return response.json();
    //   })
    //   .then(responseData => {
    //     // setUserIngredients(prevIngredients => [
    //     //   ...prevIngredients,
    //     //   { id: responseData.name, ...ingredient }
    //     // ]);
    //     dispatch({
    //       type: 'ADD',
    //       ingredient: { id: responseData.name, ...ingredient }
    //     });
    //   });
  }, [sendRequest]);

  const removeIngredientHandler = useCallback(ingredientId => {
    // dispatchHttp({ type: 'SEND' });
    sendRequest(`https://react-hooks-update.firebaseio.com/ingredients/${ingredientId}.json`, 'DELETE', null, ingredientId, 'REMOVE_INGREDIENT');
  }, [sendRequest]);

  // const clearError = useCallback(() => {
  //   // dispatchHttp({ type: 'CLEAR' });
  //   clear();
  // }, []);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
      />
    );
  }, [userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error && (
        <ErrorModal onClose={clear}>{error}</ErrorModal>
      )}

      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
};

export default Ingredients;
