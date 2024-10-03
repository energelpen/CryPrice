const apiweb = "https://api.kraken.com/0" 

/*This module is responsible for: 
1) Getting from the Kraken server for the server Unix Time
2) Converting it to RFC 1123 Time
3) Getting the Kraken Server Time with Offset to account for different timezones
4) Get Kraken System Status
*/

// Function to fetch Kraken server time and return Unix time
async function getKrakenTime() {
  try {
    const response = await fetch(`${apiweb}/public/Time`) 
    const data = await response.json() 

    if (!response.ok || (data.error && data.error.length)) {
      throw new Error(data.error?.join(", ") || 'Network response was not ok') 
    }

    return data.result.unixtime  // Return Unix time directly
  } catch (error) {
    console.error("Error fetching Kraken time:", error) 
    return null  // Return null on error
  }
}

// Helper function to convert Unix time to RFC 1123 with UTC offset
function convertUnixToRFC1123(unixTime, utcOffset) {
  const date = new Date((unixTime + utcOffset * 3600) * 1000)  // Adjust for offset in seconds
  return date.toUTCString()  // Convert to RFC 1123 format
}

// Main function to display local time based on UTC offset
async function displayKrakenTimeWithOffset(utcOffsetInput) {
  const krakenUnixTime = await getKrakenTime() 
  if (!krakenUnixTime) return 

  // Ensure the input is a string for validation and splitting
  const utcOffsetStr = utcOffsetInput.toString() 

  // Convert the input to a float and check if it's valid
  const utcOffset = parseFloat(utcOffsetStr) 
  if (isNaN(utcOffset) || utcOffset < -12 || utcOffset > 14) {
    console.error("Invalid UTC offset. Must be between -12 and +14.") 
    return 
  }

  // Check for more than 2 decimal places
  const decimalPlaces = (utcOffsetStr.split('.')[1] || '').length 
  if (decimalPlaces > 2) {
    console.error("Invalid UTC offset. Must not have more than 2 decimal places.") 
    return 
  }

  // Prepare UTC offset string
  let utcOffsetString = utcOffset < 0 ? utcOffsetStr : `+${utcOffsetStr}` 

  // Convert Kraken Unix time to local time based on the UTC offset
  const localTime = convertUnixToRFC1123(krakenUnixTime, utcOffset) 

  return `${localTime} ${utcOffsetString}` 
}

///This function calls the Kraken Server and Checks whether the Server is online or otherwise
async function getServerStatus() {
  try {
    // Fetch the system status from Kraken API
    const response = await fetch(`${apiweb}/public/SystemStatus`);
    
    // Parse the response JSON
    const data = await response.json();

    // Check if the response was not successful or if the API returned an error
    if (!response.ok || (data.error && data.error.length)) {
      throw new Error(data.error?.join(", ") || 'Network response was not ok');
    }

    // Return the system status from the API
    return data.result.status; // Assuming the status is in 'result' field
  } catch (error) {
    console.error("Error fetching server status:", error.message);
    return null; // Return null in case of an error
  }
}



/// example function call to get the Server Unix Time for Kraken
/*
getKrakenTime().then((data) => {
  if (data){
    console.log(data)
  }
})
*/

/// Example function call to get the Kraken Server Time with Offset to account for timezones
/// Displays the data in this format: Mon, 1 Jan 2024 12:00:00 GMT -2
/*
displayKrakenTimeWithOffset(2.0).then((cnvtime)=>{
  if(cnvtime){
    console.log(cnvtime)
  }
})
*/

/// Example funnction call to get the Server Status
/*
getServerStatus().then((stat)=>{
  if(stat){
    console.log(stat)
  }
})
*/

// exports the functions

export { displayKrakenTimeWithOffset, getServerStatus }