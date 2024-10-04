import chalk from 'chalk';
import figlet from 'figlet';
import { input, select, Separator, confirm } from '@inquirer/prompts';
import { displayKrakenTimeWithOffset, getServerStatus } from './lib/kraken_timestat.js'; // Import the functions
import { makeHttpsRequest } from './lib/callingserverwrap.js';

const apiweb = "https://api.kraken.com/0" 

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
        description: 'Here, you can get information about assets'
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
        try {
          // Function to validate the asset string before sending it to the API
          const validateAssetInput = (input) => {
            const regex = /^[A-Za-z0-9]+$/;
            if (!regex.test(input)) {
              throw new Error('Invalid input: The asset name must be alphanumeric (letters and numbers only).');
            }
            return true;
          };
      
          // Clear the console to remove previous outputs
          clearConsole();
      
          // Ask the user for the asset type or name with inline validation
          const assetinf = await input({
            message: 'Please enter the asset type or name:',
            validate: (input) => {
              try {
                validateAssetInput(input);
                return true;
              } catch (error) {
                return error.message; // Return error message if validation fails
              }
            },
          });
      
          // Log the input and start fetching data
          console.log(chalk.blue(`Fetching asset info for: ${assetinf}`));
      
          // Fetch data from the API
          const response = await fetch(`${apiweb}/public/Assets?asset=${assetinf}`);
      
          // Check if the response is okay (status 2xx)
          if (!response.ok) {
            throw new Error('Failed to fetch data from the server.');
          }
      
          // Parse the response data
          const data = await response.json();
      
          // Check if the API returned any errors
          if (data.error && data.error.length > 0) {
            console.log(chalk.red(`Error: ${data.error.join(', ')}. Invalid input, please try again.`));
          } else if (Object.keys(data.result).length > 0) {
            // Get the first asset in the result and display its details
            const assetKey = Object.keys(data.result)[0];
            const assetData = data.result[assetKey];
      
            // Display asset data in a formatted box
            console.log(chalk.yellow('Asset Information:'));
            console.log(chalk.green('----------------------------------------'));
            console.log(chalk.green(`Asset Name:        ${assetData.altname}`));
            console.log(chalk.green(`Asset Class:       ${assetData.aclass}`));
            console.log(chalk.green(`Decimals:          ${assetData.decimals}`));
            console.log(chalk.green(`Display Decimals:  ${assetData.display_decimals}`));
            console.log(chalk.green(`Status:            ${assetData.status}`));
            console.log(chalk.green('----------------------------------------'));
          } else {
            // If no asset data is found
            console.log(chalk.red('No asset information found for the entered asset.'));
          }
      
          // Ask what the user wants to do next
          const nextAction = await select({
            message: 'What would you like to do next?',
            choices: [
              { name: 'Get another asset info', value: 'getAgain' },
              { name: 'Return to the main menu', value: 'mainMenu' }
            ]
          });
      
          // Handle the next action
          if (nextAction === 'getAgain') {
            await getAssetInfo(); // Call the function again
          } else {
            main(); // Return to the main menu
          }
      
        } catch (error) {
          // Handle any errors more gracefully
          console.error(chalk.red('Error occurred while fetching asset info:'), error.message);
      
          // Ask the user whether they want to retry or go back to the main menu
          const retry = await select({
            message: 'Failed to fetch asset information. What would you like to do?',
            choices: [
              { name: 'Retry', value: 'retry' },
              { name: 'Return to the main menu', value: 'mainMenu' }
            ]
          });
      
          // Retry or go back based on user's choice
          if (retry === 'retry') {
            await getAssetInfo(); // Retry fetching the asset info
          } else {
            main(); // Return to the main menu
          }
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
