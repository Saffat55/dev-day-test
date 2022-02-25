import inquirer from 'inquirer'

/**
 * Sorts themes by updated date, with the live store on top
 * @param themes: Array
 * @returns Array
 */
function sortThemes (themes) {
  return themes
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .sort((a, b) => a.role === 'main' ? -1 : b.role === 'main' ? 1 : 0)
};

/**
 * Prompt user for a choice of Shopify theme files.
 * @param themes: Array
 * @returns Object
 */
export async function selectTheme (themes) {
  return inquirer.prompt([{
    type: 'list',
    name: 'id',
    message: 'Select a theme',
    choices: sortThemes(themes).map(theme => ({
      name: `${theme.name} [${theme.role}]`,
      value: theme.id
    }))
  }])
};

/**
 * Prompt user to confirm the overwrite of local JSON files
 */
export async function confirmUpdate () {
  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'continue',
    message: 'Are you sure you want to overwrite the .json files?',
    choices: [{
      name: 'Yes',
      value: true
    }, {
      name: 'No',
      value: false
    }]
  }])
  return answer.continue
    ? null
    : process.exit()
};
