import chalk from 'chalk';
import figlet from 'figlet';
import { input, select, Separator, confirm } from '@inquirer/prompts';
import { displayKrakenTimeWithOffset, getServerStatus } from './lib/kraken_timestat.js'; // Import the functions
import { makeHttpsRequest } from './lib/callingserverwrap.js';
import { validateAssetString } from './lib/validating.js';

// Generate and display the CryPrice logo
const logo = figlet.textSync('CryPrice', {
  font: 'ANSI Shadow', // Use a 3D-like font
  horizontalLayout: 'full',
});

// Function to display the logo
function genLogo() {
  console.log(chalk.blueBright(logo));
}

// Function to clear the console and display the logo
function clearConsole() {
  process.stdout.write('\x1Bc'); // Clear the console
  genLogo();
}

// Function to prompt the user to select an option
async function main() {
  clearConsole(); // Clear and display the logo

  const answer = await select({
    message: 'Welcome to CryPrice. Select an Option to get started:',
    choices: [
      {
        name: 'Get Asset Info',
        value: 'assinf',
        description: 'Here, you can get information about assets and tradable asset pairs'
      },
      {
        name: 'Get Asset Pair Info',
        value: 'asspinf',
        description: 'Here, you can get information about asset pairs',
      },
      {
        name: 'Get Ticker(Asset Pair) Info',
        value: 'ticinf',
        description: 'Here, you can get information on asset pairs and their tickers',
      },
      {
        name: 'Get Charts',
        value: 'chart',
        description: 'Here, you can display real-time/historical cryptocurrency data live',
      },
      new Separator(),
      {
        name: 'Settings',
        value: 'setting',
        description: 'Go to settings',
      },
      {
        name: 'Information',
        value: 'info',
        description: 'CryPrice Info',
      },
      {
        name: 'Server Time & Status',
        value: 'server_info',
        description: 'Display real-time server time and status',
      },
      {
        name: 'Quit',
        value: 'quit',
        description: 'Quit the application',
      },
      new Separator(),
    ],
  });

  // Handle the user's selection
  switch (answer) {
    case 'assinf':
      console.log(chalk.green('You selected: Get Asset Info'));
  
      async function getAssetInfo() {
        // Ask the user for the asset type or name
        const { assetinf } = await inquirer.prompt([
          {
            type: 'input',
            name: 'assetinf',
            message: 'Please enter the asset type or name:',
            validate: (input) => validateAssetString(input) || 'Invalid asset input, please try again.'
          }
        ]);
  
        try {
          // Fetch data from API
          let response = await fetch(`${apiweb}/public/Assets?asset=` + assetinf);
          const data = await response.json();
  
          if (!response.ok || (data.error && data.error.length)) {
            throw new Error(data.error?.join(", ") || 'Network response was not ok');
          }
  
          // Output the result
          console.log(chalk.blue('Asset Information:'));
          if (data.result && data.result[assetinf.toUpperCase()]) {
            const assetData = data.result[assetinf.toUpperCase()];
            console.log(chalk.yellow(JSON.stringify(assetData, null, 2))); // Display data nicely formatted
          } else {
            console.log(chalk.red('Asset not found.'));
          }
  
          // Ask if user wants to get another asset info or go back to main menu
          const { nextAction } = await inquirer.prompt([
            {
              type: 'list',
              name: 'nextAction',
              message: 'What would you like to do next?',
              choices: [
                { name: 'Get another asset info', value: 'getAgain' },
                { name: 'Return to the main menu', value: 'mainMenu' }
              ]
            }
          ]);
  
          if (nextAction === 'getAgain') {
            getAssetInfo(); // Call the function again to input another asset
          } else {
            main(); // Return to the main menu
          }
  
        } catch (error) {
          console.error(chalk.red('Invalid Input or Network Error:', error.message));
          main();
        }
      }
  
      getAssetInfo();
      break;

    case 'asspinf':
      console.log(chalk.green('You selected: Get Asset Pair Info'));
      const assetpinf = await input({
        message: 'Please enter the asset pair type or name:',
      });
      // Handle asset pair info logic here
      break;

    case 'ticinf':
      console.log(chalk.green('You selected: Get Ticker Info'));
      // Add your logic to handle ticker info here
      break;

    case 'chart':
      console.log(chalk.green('You selected: Get Charts'));
      // Add your logic to handle chart display here
      break;

    case 'setting':
      console.log(chalk.green('You selected: Settings'));
      // Add your logic to handle settings here
      break;

    case 'info':
      console.log(chalk.green('You selected: Information'));
      // Add your logic to handle displaying CryPrice info here
      break;

    case 'server_info': {
      const utcOffset = await getValidUTCOffset();
      if (utcOffset !== null) { // If the user did not choose to go back to the main menu
        await displayRealTimeInfo(utcOffset); // Start displaying server info
      }
      break;
    }

    case 'quit':
      console.log(chalk.yellow('Quitting CryPrice...'));
      clearConsole();
      process.stdout.write('\x1Bc'); // Exit the application
      break;

    default:
      console.log(chalk.red('Invalid option selected'));
      break;
  }
}

// Function to prompt for a valid UTC offset and handle invalid inputs
async function getValidUTCOffset() {
  while (true) {
    const offsetInput = await input({
      message: 'Enter the UTC offset (e.g., -5 for UTC-5):',
    });

    const utcOffset = parseInt(offsetInput, 10);

    if (!isNaN(utcOffset) && utcOffset >= -12 && utcOffset <= 14) {
      return utcOffset; // Valid offset, return it
    } else {
      // Invalid offset, prompt user to retry or go back to main menu
      console.log(chalk.red('Invalid UTC offset. Please enter a value between -12 and 14.'));

      const retry = await confirm({
        message: 'Would you like to retry? (Select "No" to return to the main menu)',
        default: true,
      });

      if (!retry) {
        return null; // Return null to indicate going back to the main menu
      }
    }
  }
}

// Function to display the server time and status
async function displayRealTimeInfo(utcOffsetInput) {
  clearConsole(); // Clear the console and display the logo
  const serverTime = await displayKrakenTimeWithOffset(utcOffsetInput);
  const serverStatus = await getServerStatus();

  console.log(chalk.green(serverTime));
  console.log(chalk.yellow(serverStatus));

  // Prompt the user for the next action
  const actiontime = await select({
    message: 'What would you like to do next?',
    choices: [
      {
        name: 'Refresh',
        value: 'refresh',
        description: 'Refresh the server time and status'
      },
      {
        name: 'Back to Main Menu',
        value: 'main_menu',
        description: 'Return to the main menu'
      },
    ],
  });

  // Handle the user's selection for action time
  if (actiontime === 'refresh') {
    await displayRealTimeInfo(utcOffsetInput); // Call the function again to refresh
  } else {
    main(); // Go back to the main menu
  }
}

// Execute the main function
main().catch(err => console.error(err));
