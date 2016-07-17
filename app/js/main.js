// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let fs = nodeRequire('fs');
let path = nodeRequire('path');
let osascript = nodeRequire('osascript').eval;
const {dialog, app} = nodeRequire('electron').remote;

// Allow the user to choose a location to save the GPX file
let GPXFileLocation = dialog.showSaveDialog({
  title: 'GPX File Location',
  defaultPath: app.getPath('downloads') + '/LocationServicesController.gpx'
});
if (GPXFileLocation === undefined) {
  app.quit();
}
let GPXFileName = path.basename(GPXFileLocation, '.gpx');

$(document).bind("location_changed", function(event, object) {
  let lat = $('.gllpLatitude').attr('value');
  let lon = $('.gllpLongitude').attr('value');

  updateLocation(lat, lon);
});

function updateLocation(lat, lon) {
  writeToGPXFile(lat, lon);
  updateLocationInXcode(lat, lon);
}

function writeToGPXFile(lat, lon) {
  let gpx = `<gpx><wpt lat="${lat}" lon="${lon}"></wpt></gpx>`;
  fs.writeFileSync(GPXFileLocation, gpx);
}

function updateLocationInXcode(lat, lon) {
  let script = `Application('System Events').processes['Xcode'].menuBars.at(0)
    .menuBarItems.byName("Debug").menus.byName("Debug")
    .menuItems.byName("Simulate Location").menus.byName("Simulate Location")
    .menuItems.byName("${GPXFileName}").entireContents()`;
  let realScript = `Application('System Events').processes['Xcode'].menuBars.at(0)
    .menuBarItems.byName("Debug").menus.byName("Debug")
    .menuItems.byName("Simulate Location").menus.byName("Simulate Location")
    .menuItems.byName("${GPXFileName}").click()`;

  osascript(script, function(err, data) {
    if (err) {
      let errorCode = /\((-?\d+)\)/.exec(err.message)[1];
      console.log(errorCode);
      if (errorCode == -1719) {
        alert("Location Services Controller does not have access to Xcode. Please give the app permission under System Preferences -> Security & Privacy -> Privacy.");
      } else {
        alert("Failed to update location in Xcode. Make sure it was added to Xcode under Debug -> Simulate Location");
        console.error(err);
      }
      return;
    }

    osascript(realScript);
  });
}
