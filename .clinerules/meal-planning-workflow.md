# Weekly Meal Planning Workflow with Tandoor (Using Previous Week's Plan)

## Objective
Generate a weekly meal plan using recipes from Tandoor, potentially creating simple new recipes based on ingredients, add the final plan to the Tandoor calendar using the MCP server tools, considering the previous week's plan to avoid repetition.

## Phase 1: Gather Requirements & Context

1.  **Initiate:** User expresses desire for a weekly meal plan.
2.  **Fetch Previous Week's Plan (Assistant uses `get_meal_plans`):**
    *   *Assistant Logic:* Calculate the date range for the previous 7 days (or a relevant period).
    *   *Assistant uses:* `get_meal_plans` with the calculated `from_date` and `to_date`.
    *   *Assistant Logic:* Extract recipe IDs/names from the fetched plan to know what was recently eaten.
    *   *Assistant informs (Optional):* "Okay, last week we had [Recipe X, Recipe Y...]. I'll try to suggest different options unless you'd like those again."
3.  **Clarify Scope (Assistant asks):**
    *   "Do you already have specific meals in mind for this week, or would you like suggestions (keeping last week's meals in mind)?"
    *   "How many people are we planning for?" (Default: Assume 2 if unspecified)
    *   "How many days should the plan cover?" (Default: 7)
    *   "How many main meals (e.g., dinners) per day should we plan? Are leftovers expected?" (Determines number of unique recipes needed).

## Phase 2: Recipe Selection / Generation

*   **Scenario A: User knows some meals:**
    *   *Assistant asks:* "Great! Please list the meals you'd like to include."
    *   *Assistant uses:* `get_recipes` tool with names/keywords to find Tandoor recipe IDs. Confirms matches if ambiguous.
    *   If meals are missing, proceed to Scenario B/C.

*   **Scenario B: User wants suggestions:**
    *   *Assistant asks:* "Okay, what kind of food do you enjoy? Any preferences (cuisine, ingredients)?" OR "List ingredients/ideas you have."
    *   *Assistant uses:* `get_recipes` with relevant `query`, `keywords`, or `foods` to find suitable recipes, potentially de-prioritizing recipes from the previous week's plan.
    *   *Assistant presents:* List of 5-10 recipe suggestions (ID, Name, Description).
    *   *Assistant asks:* "Which of these look good? Or search again?"

*   **Scenario C: User provides ingredients (for simple recipes):**
    *   *Assistant asks:* "Please list the main ingredients you have."
    *   *Assistant Logic:* Propose simple recipe concepts based on ingredients, avoiding recipes similar to the previous week's plan if possible.
    *   *Assistant asks:* "How about these simple meal ideas: [List ideas]? Create basic recipes in Tandoor?"
    *   *Assistant uses:* `create_tandoor_recipe` if approved, generating basic ingredients/instructions. Uses returned IDs.

## Phase 3: Plan Construction & Review

1.  **Assign Recipes:**
    *   *Assistant uses:* `get_meal_types` to confirm target meal ID (e.g., "Dinner").
    *   *Assistant proposes:* Day-by-day assignment using selected/generated recipe IDs. (e.g., "Monday: [Recipe A], Tuesday: [Recipe B]...")
2.  **Present Plan:**
    *   *Assistant shows:* Proposed weekly schedule.
    *   *Assistant asks:* "Here's the proposed plan. How does this look? Any changes?"
3.  **Iterate:** Adjust plan based on user feedback.

## Phase 4: Finalize and Add to Tandoor

1.  **Confirmation:** User approves the final plan.
2.  **Execute (Assistant):** For each planned meal:
    *   Use `create_tandoor_meal_plan` tool with:
        *   `recipes`: `[recipe_id]`
        *   `start_date`: Specific date (YYYY-MM-DD).
        *   `meal_type`: Meal type name (e.g., "Dinner").
        *   `servings`: Number specified earlier.
        *   `title`: (Optional) Recipe name or custom title.
    *   Confirm success for each entry.
3.  **Completion:** Inform user plan added to Tandoor.

*(History is checked directly from Tandoor using get_meal_plans at the start)*
