// import { test, expect } from '@playwright/test';
// import { v4 as uuidv4 } from 'uuid';

// test.describe('Create a Subtask', () => {
//     test.beforeEach(async ({ page, request, isMobile }) => {
//         test.skip(isMobile, 'This feature is desktop only');
//         const testId = uuidv4();
//         const response = await request.post('/api/list', {
//             data: {
//                 name: `Test List ${testId}`,
//                 icon: 'mdi-format-list-bulleted',
//                 listType: 'simple',
//                 todos: [],
//             },
//         });
//         const list = await response.json();
//         console.log('create list response', list.id);

//         await page.goto(`/list/${list.id}`);
//         await page.waitForLoadState('networkidle');
//     });

//     test('can create a todo in a list', async ({ page, isMobile }) => {
//         test.skip(isMobile, 'This feature is desktop only');

//         await page.waitForLoadState('networkidle');

//         const newTodoInput = page.getByTestId('new-todo-input').locator('input');
//         const testId = uuidv4();
//         const todoName = `Todo ${testId}`;
//         await newTodoInput.fill(todoName);
//         await newTodoInput.press('Enter');

//         await page.reload();
//         await page.waitForLoadState('networkidle');

//         const listItemTitlesEls = await page.getByTestId('todo-title').all();
//         const listItemTitles = await Promise.all(listItemTitlesEls.map(navItem => navItem.textContent()));

//         expect(listItemTitles.includes(todoName)).toBeTruthy();
//     });

//     test('can add a subtask to a todo', async ({ page, isMobile }) => {
//         test.skip(isMobile, 'This feature is desktop only');

//         // Create a todo first
//         const newTodoInput = page.getByTestId('new-todo-input').locator('input');
//         const testId = uuidv4();
//         const todoName = `Todo with subtask ${testId}`;
//         await newTodoInput.fill(todoName);
//         await newTodoInput.press('Enter');

//         await page.waitForLoadState('networkidle');

//         // Click on the todo to open the detail view
//         const todoTitle = page.getByTestId('todo-title').filter({ hasText: todoName });
//         await todoTitle.click();

//         await page.waitForLoadState('networkidle');

//         // Add a subtask
//         const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
//         const subtaskName = `Subtask ${uuidv4()}`;
//         await subtaskInput.fill(subtaskName);
//         // Wait a bit for the reactive state to update and button to become enabled
//         await page.waitForTimeout(100);

//         const addSubtaskButton = page.getByTestId('add-subtask-button');
//         await addSubtaskButton.click();

//         // Wait for the subtask to be saved
//         await page.waitForLoadState('networkidle');

//         // Verify the subtask appears in the list
//         const subtasksList = page.getByTestId('subtasks-list');
//         await expect(subtasksList).toBeVisible();

//         const subtaskNameField = page.getByTestId('subtask-name-0').locator('input');
//         await expect(subtaskNameField).toHaveValue(subtaskName);
//     });

//     test('can mark a subtask as done', async ({ page, isMobile }) => {
//         test.skip(isMobile, 'This feature is desktop only');

//         // Create a todo first
//         const newTodoInput = page.getByTestId('new-todo-input').locator('input');
//         const testId = uuidv4();
//         const todoName = `Todo for completion test ${testId}`;
//         await newTodoInput.fill(todoName);
//         await newTodoInput.press('Enter');

//         await page.waitForLoadState('networkidle');

//         // Click on the todo to open the detail view
//         const todoTitle = page.getByTestId('todo-title').filter({ hasText: todoName });
//         await todoTitle.click();

//         await page.waitForLoadState('networkidle');

//         // Add a subtask
//         const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
//         const subtaskName = `Subtask to complete ${uuidv4()}`;
//         await subtaskInput.fill(subtaskName);
//         // Wait a bit for the reactive state to update and button to become enabled
//         await page.waitForTimeout(100);
//         await page.getByTestId('add-subtask-button').click();

//         await page.waitForLoadState('networkidle');

//         // Mark the subtask as done by clicking the checkbox
//         const subtaskCheckbox = page.getByTestId('subtask-checkbox-0').locator('input');
//         await subtaskCheckbox.click();

//         await page.waitForLoadState('networkidle');

//         // Reload and verify the subtask is still marked as done
//         await page.reload();
//         await page.waitForLoadState('networkidle');

//         const subtaskCheckboxAfterReload = page.getByTestId('subtask-checkbox-0').locator('input');
//         await expect(subtaskCheckboxAfterReload).toBeChecked();
//     });

//     // test('can delete a subtask', async ({ page, isMobile }) => {
//     //     test.skip(isMobile, 'This feature is desktop only');

//     //     // Create a todo first
//     //     const newTodoInput = page.getByTestId('new-todo-input').locator('input');
//     //     const testId = uuidv4();
//     //     const todoName = `Todo for delete test ${testId}`;
//     //     await newTodoInput.fill(todoName);
//     //     await newTodoInput.press('Enter');

//     //     await page.waitForLoadState('networkidle');

//     //     // Click on the todo to open the detail view
//     //     const todoTitle = page.getByTestId('todo-title').filter({ hasText: todoName });
//     //     await todoTitle.click();

//     //     await page.waitForLoadState('networkidle');

//     //     // Add a subtask
//     //     const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
//     //     const subtaskName = `Subtask to delete ${uuidv4()}`;
//     //     await subtaskInput.fill(subtaskName);
//     //     // Wait a bit for the reactive state to update and button to become enabled
//     //     await page.waitForTimeout(100);
//     //     await page.keyboard.press('enter');

//     //     await page.waitForLoadState('networkidle');

//     //     // Verify subtask exists
//     //     await expect(page.getByTestId('subtasks-list')).toBeVisible();

//     //     // Delete the subtask
//     //     const deleteButton = page.getByTestId('subtask-delete-0');
//     //     await deleteButton.click();

//     //     await page.waitForLoadState('networkidle');

//     //     // Verify subtask list is gone (no subtasks left)
//     //     await expect(page.getByTestId('subtasks-list')).not.toBeVisible();
//     // });

//     // test('can add multiple subtasks', async ({ page, isMobile }) => {
//     //     test.skip(isMobile, 'This feature is desktop only');

//     //     // Create a todo first
//     //     const newTodoInput = page.getByTestId('new-todo-input').locator('input');
//     //     const testId = uuidv4();
//     //     const todoName = `Todo with multiple subtasks ${testId}`;
//     //     await newTodoInput.fill(todoName);
//     //     await newTodoInput.press('Enter');

//     //     await page.waitForLoadState('networkidle');

//     //     // Click on the todo to open the detail view
//     //     const todoTitle = page.getByTestId('todo-title').filter({ hasText: todoName });
//     //     await todoTitle.click();

//     //     await page.waitForLoadState('networkidle');

//     //     // Add first subtask
//     //     const subtaskInput = page.getByTestId('add-subtask-input').locator('input');
//     //     const subtask1Name = `First subtask ${uuidv4()}`;
//     //     await subtaskInput.fill(subtask1Name);
//     //     // Wait a bit for the reactive state to update and button to become enabled
//     //     await page.waitForTimeout(100);
//     //     await subtaskInput.press('Enter');

//     //     await page.waitForLoadState('networkidle');

//     //     // Add second subtask
//     //     const subtask2Name = `Second subtask ${uuidv4()}`;
//     //     await subtaskInput.fill(subtask2Name);
//     //     // Wait a bit for the reactive state to update and button to become enabled
//     //     await page.waitForTimeout(100);
//     //     await subtaskInput.press('Enter');

//     //     await page.waitForLoadState('networkidle');

//     //     // Add third subtask using Enter key
//     //     const subtask3Name = `Third subtask ${uuidv4()}`;
//     //     await subtaskInput.fill(subtask3Name);
//     //     await subtaskInput.press('Enter');

//     //     await page.waitForLoadState('networkidle');

//     //     // Verify all subtasks exist
//     //     await expect(page.getByTestId('subtask-item-0')).toBeVisible();
//     //     await expect(page.getByTestId('subtask-item-1')).toBeVisible();
//     //     await expect(page.getByTestId('subtask-item-2')).toBeVisible();

//     //     // Verify subtask names
//     //     await expect(page.getByTestId('subtask-name-0').locator('input')).toHaveValue(subtask1Name);
//     //     await expect(page.getByTestId('subtask-name-1').locator('input')).toHaveValue(subtask2Name);
//     //     await expect(page.getByTestId('subtask-name-2').locator('input')).toHaveValue(subtask3Name);
//     // });
// });
