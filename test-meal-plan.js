// Simple script to test creating a meal plan in Tandoor
import axios from 'axios';
import { exit } from 'process';

// Configuration
const TANDOOR_URL = process.env.TANDOOR_URL;
const TANDOOR_API_TOKEN = process.env.TANDOOR_API_TOKEN;
const RECIPE_ID = 133; // ID of the recipe we created earlier
const MEAL_TYPE = 'Dinner';
const START_DATE = '2025-03-29';

if (!TANDOOR_API_TOKEN) {
  console.error('Error: TANDOOR_API_TOKEN environment variable is required.');
  console.error('Please set it before running this script:');
  console.error('  $env:TANDOOR_API_TOKEN = "your-api-token"');
  exit(1);
}

// Create API client
const apiClient = axios.create({
  baseURL: TANDOOR_URL,
  headers: {
    'Authorization': `Bearer ${TANDOOR_API_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

async function main() {
  try {
    console.log(`Using Tandoor URL: ${TANDOOR_URL}`);
    console.log(`Testing with Recipe ID: ${RECIPE_ID}`);
    
    // 1. Find Meal Type ID
    console.log(`Finding meal type ID for "${MEAL_TYPE}"...`);
    const mealTypesResponse = await apiClient.get('/api/meal-type/');
    console.log('Meal types:', JSON.stringify(mealTypesResponse.data, null, 2));
    
    const mealType = mealTypesResponse.data.find(mt => 
      mt.name.toLowerCase() === MEAL_TYPE.toLowerCase()
    );
    
    if (!mealType) {
      console.error(`Error: Meal type "${MEAL_TYPE}" not found.`);
      console.log('Available meal types:', mealTypesResponse.data.map(mt => mt.name).join(', '));
      exit(1);
    }
    
    const mealTypeId = mealType.id;
    console.log(`Found Meal Type ID: ${mealTypeId} for "${MEAL_TYPE}"`);
    
    // 2. Create Meal Plan Entry
    console.log('Creating meal plan entry...');
    
    // Try with object format for recipe and meal_type
    const mealPlanPayload = {
      recipe: { id: RECIPE_ID },
      meal_type: { id: mealTypeId },
      from_date: `${START_DATE}T00:00:00`,
      servings: "2",
      title: "Test Meal Plan Entry",
      note: "Created by test script"
    };
    
    console.log('Payload:', JSON.stringify(mealPlanPayload, null, 2));
    
    try {
      const response = await apiClient.post('/api/meal-plan/', mealPlanPayload);
      console.log('Success! Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error creating meal plan:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Try alternative format
      console.log('\nTrying alternative format...');
      const altPayload = {
        recipe: RECIPE_ID,
        meal_type: mealTypeId,
        from_date: `${START_DATE}T00:00:00`,
        servings: "2",
        title: "Test Meal Plan Entry",
        note: "Created by test script"
      };
      
      console.log('Alternative payload:', JSON.stringify(altPayload, null, 2));
      
      try {
        const altResponse = await apiClient.post('/api/meal-plan/', altPayload);
        console.log('Success with alternative format! Response:', JSON.stringify(altResponse.data, null, 2));
      } catch (altError) {
        console.error('Error with alternative format:', altError.message);
        if (altError.response) {
          console.error('Response status:', altError.response.status);
          console.error('Response data:', JSON.stringify(altError.response.data, null, 2));
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main();
