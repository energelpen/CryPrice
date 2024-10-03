export function validateAssetString(assetString) {
    // Regular expression to check if the string is a comma-delimited list of alphanumeric items (must contain at least one letter)
    const regex = /^([A-Za-z0-9]+)(,[A-Za-z0-9]+)*$/;
  
    // Check if the string matches the regular expression
    if (!regex.test(assetString)) {
      throw new Error('Invalid input: The asset string must be a comma-delimited list of alphanumeric values.');
    }
  
    // Split the string by commas and check that no part is purely an integer
    const assets = assetString.split(',');
    for (let asset of assets) {
      if (!/[A-Za-z]/.test(asset)) {  // If the asset does not contain at least one letter
        throw new Error('Invalid input: Each asset must contain at least one letter.');
      }
    }
  
    console.log('Valid asset string:', assetString);
  }
  
 /* try {
    // Test cases
    validateAssetString('XBT1,ETH2,LTC3');  // Valid case
    validateAssetString('BTC123,ETH456');   // Valid case
    validateAssetString('DOGE');            // Valid single asset case
    validateAssetString('123,456');         // Invalid case (no letters)
    validateAssetString('123');             // Invalid case (just an integer)
    validateAssetString('BTC, ,LTC');       // Invalid case (empty element)
  } catch (error) {
    console.error(error.message);
 } */
  