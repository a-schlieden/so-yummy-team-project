import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import RecipeDescriptionField from './RecipeDescriptionFields/RecipeDescriptionFields';
import RecipeIngredientsFields from './RecipeIngredientsFields/RecipeIngredientsFields';
import RecipePreparationFields from './RecipePreparationFields/RecipePreparationFields';

import { addMyRecipes } from 'redux/myRecipes/myRecipesOperation';
import { selectMyRecipesError } from 'redux/myRecipes/myRecipesSelectors';
import { initialIngredients, initialValues } from '../helpers/vars';

import { AddRecipeFormComponent } from './AddRecipeForm.styled';

const AddRecipeForm = () => {
  const [descriptionFields, setDescriptionFields] = useState(initialValues);
  const [descriptionFieldsReady, setDescriptionFieldsReady] = useState(false);

  const [ingredientsState, setIngredientsState] = useState(initialIngredients);
  const [ingredientsStateReady, setIngredientsStateReady] = useState(false);

  const [textareaContent, setTextareaContent] = useState([]);
  const [textareaReady, setTextareaReady] = useState(false);

  const [isValid, setIsValid] = useState(false);

  const photo = useRef(null);

  const error = useSelector(selectMyRecipesError);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      const isIngredientsFieldsEmpty = !ingredientsState.every(
        item => item._id.length !== 0
      );

      const isMeasureFieldsEmpty = !ingredientsState.every(
        item => item.quantity.length !== 0
      );

      const isTrue = !isIngredientsFieldsEmpty && !isMeasureFieldsEmpty;
      setIngredientsStateReady(isTrue);
    }, 1);
  }, [ingredientsState, setIngredientsStateReady]);

  useEffect(() => {
    if (descriptionFieldsReady && ingredientsStateReady && textareaReady) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [descriptionFieldsReady, ingredientsStateReady, textareaReady]);

  const submitHandler = async event => {
    event.preventDefault();

    const formData = new FormData();

    const ingredients = ingredientsState.map(item => ({
      id: item._id,
      measure: item.quantity,
    }));
    const { title, description, category, time } = descriptionFields;

    if (photo.current) {
      formData.set('recipeImage', photo.current);
    }

    formData.set('title', title);
    formData.set('description', description);
    formData.set('category', category);
    formData.set('time', time);
    formData.set('ingredients', JSON.stringify(ingredients));
    formData.set('instructions', JSON.stringify(textareaContent));

    Promise.resolve(dispatch(addMyRecipes(formData))).then(() => {
      if (!error) {
        navigate('/my', { replace: true });
      }
    });
  };

  useEffect(() => {
    if (!error) return;

    Notify.failure(error);
  }, [error]);

  const initialDataChangeHandler = (name, value) => {
    setDescriptionFields(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const incrementHandler = () => {
    return setIngredientsState(prevCount => [
      ...prevCount,
      {
        id: nanoid(),
        ingredient: '',
        quantity: '',
      },
    ]);
  };

  const decrementHandler = () => {
    const tmp = [...ingredientsState];
    if (tmp.length === 1) {
      Notify.failure('Sorry, you need to add at least one ingredient');
      return;
    }
    tmp.splice(ingredientsState.length - 1, 1);
    return setIngredientsState(tmp);
  };

  const deleteHandler = event => {
    if (ingredientsState.length > 1) {
      const newIngredients = ingredientsState.filter(item => {
        return item.id.toString() !== event.target.closest('li').id.toString();
      });

      setIngredientsState(newIngredients);
    } else {
      Notify.failure('Sorry, you need to add at least one ingredient');
      return;
    }
  };

  const changeIngredientHandler = (id, _id) => {
    const changedIngredients = ingredientsState.map(item => {
      if (item.id === id) {
        return { ...item, _id };
      }

      return item;
    });

    setIngredientsState(changedIngredients);
  };

  const changeMeasureHandler = (id, content) => {
    const changedIngredients = ingredientsState.map(item => {
      if (id === item.id) {
        return { ...item, quantity: content };
      }

      return item;
    });

    setIngredientsState(changedIngredients);
  };

  const textareaChangeHandler = event => {
    setTextareaContent(event.target.value.split('\n'));
  };

  return (
    <AddRecipeFormComponent onSubmit={submitHandler}>
      <RecipeDescriptionField
        initialDataState={descriptionFields}
        changeHandler={initialDataChangeHandler}
        photo={photo}
        descriptionValidationStatusSetter={setDescriptionFieldsReady}
      />
      <RecipeIngredientsFields
        ingredients={ingredientsState}
        incrementHandler={incrementHandler}
        decrementHandler={decrementHandler}
        deleteHandler={deleteHandler}
        changeHandler={changeMeasureHandler}
        changeIngredientHandler={changeIngredientHandler}
      />
      <RecipePreparationFields
        isValid={isValid}
        value={textareaContent}
        onChange={textareaChangeHandler}
        preparationFieldsValidationStatusSetter={setTextareaReady}
      />
    </AddRecipeFormComponent>
  );
};

export default AddRecipeForm;
