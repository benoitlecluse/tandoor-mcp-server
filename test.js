#!/usr/bin/env node

// Simple test script for the Tandoor MCP server
// This script simulates MCP requests to test the server functionality

// const { spawn } = require('child_process');
import spawn from 'child_process';
// const path = require('path');
import path from 'path';
// const readline = require('readline');
import readline from 'readline';

// Configuration
const TANDOOR_URL = process.env.TANDOOR_URL;
const TANDOOR_API_TOKEN = process.env.TANDOOR_API_TOKEN;

if (!TANDOOR_API_TOKEN) {
  console.error('Error: TANDOOR_API_TOKEN environment variable is required.');
  console.error('Please set it before running this script:');
  console.error('  $env:TANDOOR_API_TOKEN = "your-api-token"');
  process.exit(1);
}

// Start the MCP server process
const serverProcess = spawn('node', [path.join(__dirname, 'build', 'index.js')], {
  env: {
    ...process.env,
    TANDOOR_URL,
    TANDOOR_API_TOKEN
  },
  stdio: ['pipe', 'pipe', process.stderr]
});

// Create interface for reading from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Handle server output
let buffer = '';
serverProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  
  // Process complete JSON messages
  let endIndex;
  while ((endIndex = buffer.indexOf('\n')) !== -1) {
    const message = buffer.slice(0, endIndex);
    buffer = buffer.slice(endIndex + 1);
    
    try {
      const parsed = JSON.parse(message);
      if (parsed.result) {
        console.log('\nServer response:', JSON.stringify(parsed.result, null, 2));
      }
    } catch (err) {
      console.error('Error parsing server response:', err);
    }
  }
});

// Function to send a request to the server
function sendRequest(method, params) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };
  
  const requestStr = JSON.stringify(request) + '\n';
  serverProcess.stdin.write(requestStr);
  console.log(`\nSent ${method} request to server.`);
}

// Test functions
function testCreateRecipe() {
  sendRequest('call_tool', {
    name: 'create_tandoor_recipe',
    arguments: {
      name: 'Test Recipe from Script',
      description: 'A recipe created by the test script.',
      servings: 2,
      ingredients_block: '1 test item\n2 more test items',
      instructions_block: '1. Do the first test step.\n2. Do the second test step.'
    }
  });
}

function testCreateMealPlan(recipeId) {
  if (!recipeId) {
    console.error('Error: Recipe ID is required for creating a meal plan.');
    return;
  }
  
  sendRequest('call_tool', {
    name: 'create_tandoor_meal_plan',
    arguments: {
      title: 'Test Meal from Script',
      recipes: [parseInt(recipeId, 10)],
      start_date: '2025-03-29',
      meal_type: 'Dinner',
      servings: 2,
      note: 'Meal plan entry created by test script.'
    }
  });
}

function listTools() {
  sendRequest('list_tools', {});
}

// Main menu
function showMenu() {
  console.log('\n=== Tandoor MCP Server Test Menu ===');
  console.log('1. List available tools');
  console.log('2. Test create_tandoor_recipe');
  console.log('3. Test create_tandoor_meal_plan');
  console.log('q. Quit');
  
  rl.question('\nSelect an option: ', (answer) => {
    switch (answer.trim().toLowerCase()) {
      case '1':
        listTools();
        setTimeout(showMenu, 1000);
        break;
      case '2':
        testCreateRecipe();
        setTimeout(showMenu, 1000);
        break;
      case '3':
        rl.question('Enter recipe ID: ', (recipeId) => {
          testCreateMealPlan(recipeId);
          setTimeout(showMenu, 1000);
        });
        break;
      case 'q':
        console.log('Shutting down...');
        serverProcess.kill();
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('Invalid option.');
        showMenu();
        break;
    }
  });
}

// Start the test
console.log('Starting Tandoor MCP server test...');
console.log(`Using Tandoor URL: ${TANDOOR_URL}`);
console.log('Waiting for server to initialize...');

// Give the server a moment to start up
setTimeout(() => {
  console.log('Server should be ready now.');
  showMenu();
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  serverProcess.kill();
  rl.close();
  process.exit(0);
});
